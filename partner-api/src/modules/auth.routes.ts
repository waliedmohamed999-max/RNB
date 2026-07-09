import { Router } from "express";
import { z } from "zod";
import {
  comparePassword,
  getTokenExpiresAt,
  hashPassword,
  hashRefreshToken,
  signRefreshToken,
  signToken,
  verifyRefreshToken,
} from "../auth.js";
import { pool, query } from "../db.js";
import { HttpError, validate } from "../http.js";
import { partnerDocumentUpload, verifyAndPersistUpload } from "../uploads.js";

export const authRouter = Router();

const registerSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(160),
    managerName: z.string().min(2).max(120),
    mobile: z.string().min(8).max(24),
    email: z.string().email().max(180),
    password: z.string().min(8).max(120),
    city: z.string().min(2).max(80),
    activityType: z.enum(["hospitality", "events", "experiences", "multi_service"]),
    expectedMonthlyBookings: z.coerce.number().int().min(0).max(1_000_000),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20).optional(),
  }).default({}),
});

const registrationUpload = partnerDocumentUpload.fields([
  { name: "commercialRecord", maxCount: 1 },
  { name: "identityDocument", maxCount: 1 },
]);

async function persistRefreshToken(userId: string, refreshToken: string, metadata: { userAgent?: string; ipAddress?: string }) {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashRefreshToken(refreshToken), metadata.userAgent ?? null, metadata.ipAddress ?? null, getTokenExpiresAt(refreshToken)],
  );
}

authRouter.post("/register-partner", registrationUpload, validate(registerSchema), async (request, response, next) => {
  const client = await pool.connect();

  try {
    const body = (request.validated as z.infer<typeof registerSchema>).body;
    const passwordHash = await hashPassword(body.password);
    const files = request.files as Record<string, Express.Multer.File[]> | undefined;
    const commercialRecordFile = files?.commercialRecord?.[0];
    const identityFile = files?.identityDocument?.[0];
    const commercialRecordUrl = commercialRecordFile ? await verifyAndPersistUpload(commercialRecordFile) : null;
    const identityUrl = identityFile ? await verifyAndPersistUpload(identityFile) : null;

    await client.query("BEGIN");

    const user = await client.query<{ id: string }>(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'partner') RETURNING id",
      [body.email.toLowerCase(), passwordHash],
    );

    const partner = await client.query<{ id: string; status: string }>(
      `INSERT INTO partners (
        user_id, company_name, manager_name, mobile, city, activity_type, expected_monthly_bookings,
        commercial_record_url, identity_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, status`,
      [
        user.rows[0].id,
        body.companyName,
        body.managerName,
        body.mobile,
        body.city,
        body.activityType,
        body.expectedMonthlyBookings,
        commercialRecordUrl,
        identityUrl,
      ],
    );

    await client.query(
      `INSERT INTO partner_permissions (partner_id, permission_key, enabled)
       SELECT $1, key, key IN ('view_bookings', 'manage_account') FROM permissions`,
      [partner.rows[0].id],
    );
    await client.query("INSERT INTO partner_settings (partner_id) VALUES ($1)", [partner.rows[0].id]);

    await client.query("COMMIT");
    response.status(201).json({ ok: true, data: partner.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if ((error as { code?: string }).code === "23505") {
      next(new HttpError(409, "Email already exists."));
      return;
    }
    next(error);
  } finally {
    client.release();
  }
});

authRouter.post("/login", validate(loginSchema), async (request, response, next) => {
  try {
    const body = (request.validated as z.infer<typeof loginSchema>).body;
    const result = await query<{ id: string; role: "admin" | "partner"; password_hash: string }>(
      "SELECT id, role, password_hash FROM users WHERE email = $1",
      [body.email.toLowerCase()],
    );
    const user = result.rows[0];

    if (!user || !(await comparePassword(body.password, user.password_hash))) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const partner = user.role === "partner"
      ? await query<{ status: string }>("SELECT status FROM partners WHERE user_id = $1", [user.id])
      : null;

    if (partner?.rows[0]?.status !== "approved" && user.role === "partner") {
      throw new HttpError(403, "Partner account is not approved yet.");
    }

    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    await persistRefreshToken(user.id, refreshToken, {
      userAgent: request.get("user-agent"),
      ipAddress: request.ip,
    });

    response.json({
      ok: true,
      data: {
        token: signToken({ sub: user.id, role: user.role }),
        refreshToken,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", validate(refreshSchema), async (request, response, next) => {
  const client = await pool.connect();

  try {
    const body = (request.validated as z.infer<typeof refreshSchema>).body;
    const payload = verifyRefreshToken(body.refreshToken);
    const tokenHash = hashRefreshToken(body.refreshToken);

    await client.query("BEGIN");

    const existing = await client.query<{ id: string }>(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > now()
       FOR UPDATE`,
      [payload.sub, tokenHash],
    );

    if (!existing.rows[0]) {
      throw new HttpError(401, "Invalid refresh token.");
    }

    await client.query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1", [existing.rows[0].id]);

    const refreshToken = signRefreshToken({ sub: payload.sub, role: payload.role });
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [payload.sub, hashRefreshToken(refreshToken), request.get("user-agent") ?? null, request.ip, getTokenExpiresAt(refreshToken)],
    );

    await client.query("COMMIT");
    response.json({
      ok: true,
      data: {
        token: signToken({ sub: payload.sub, role: payload.role }),
        refreshToken,
        role: payload.role,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});

authRouter.post("/logout", validate(logoutSchema), async (request, response, next) => {
  try {
    const body = (request.validated as z.infer<typeof logoutSchema>).body;
    if (body.refreshToken) {
      await query("UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL", [hashRefreshToken(body.refreshToken)]);
    }
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
