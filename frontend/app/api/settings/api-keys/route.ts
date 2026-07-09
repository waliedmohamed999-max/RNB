import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { createToken, previewToken, readStore, writeStore, type StoredApiKey } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readStore();
  return NextResponse.json({ status: 1, data: store.keys });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = (await request.json().catch(() => null)) as Partial<StoredApiKey> | null;
  if (!body?.name) return jsonError("Key name is required.", 422);

  const token = createToken(body.environment ?? "test");
  const store = await readStore();
  const key: StoredApiKey = {
    id: `key_${Date.now()}`,
    name: body.name,
    description: body.description ?? "",
    environment: body.environment ?? "test",
    permissions: Array.isArray(body.permissions) ? body.permissions : ["read"],
    active: true,
    createdAt: new Date().toISOString(),
    lastUsed: "لم يستخدم بعد",
    tokenPreview: previewToken(token),
  };
  await writeStore({ ...store, keys: [key, ...store.keys] });

  return NextResponse.json({ status: 1, data: key, token });
}
