import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";
import {
  appendHardenedSetCookies,
  checkRateLimit,
  jsonError,
  readJsonBody,
} from "@/lib/api-security";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
  rememberMe?: unknown;
  mobile?: unknown;
  digit1?: unknown;
  digit2?: unknown;
  digit3?: unknown;
  digit4?: unknown;
  remember?: unknown;
  return_url?: unknown;
};

const LOCAL_ADMIN_COOKIE = "labayh_vercel_admin";
const DEFAULT_LOCAL_ADMIN_EMAIL = "admin@labayh.local";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const LOCAL_ADMIN_EMAILS = new Set(
  [DEFAULT_LOCAL_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase()),
);
// In production, only an explicitly configured ADMIN_PASSWORD is accepted. If it isn't set,
// this set is empty and local admin login is rejected outright instead of falling back to a
// weak default password.
const LOCAL_ADMIN_PASSWORDS = new Set(
  [
    process.env.ADMIN_PASSWORD,
    ...(IS_PRODUCTION ? [] : [process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD, "password", "strong-password"]),
  ]
    .filter(Boolean)
    .map((value) => String(value)),
);

function safeReturnUrl(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" && value.startsWith("/")
    ? value.slice(0, 200)
    : fallback;
}

function encodeLocalAdminSession(session: unknown) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}
function createLocalAdminSession() {
  return {
    id: 1,
    email: DEFAULT_LOCAL_ADMIN_EMAIL,
    mobile: "",
    first_name: "Admin",
    last_name: "",
    display_name: "Admin",
    avatar: "",
    roles: ["admin", "administrator"],
    dashboard_url: "/dashboard",
  };
}

function localAdminLoginResponse(payload: LoginRequestBody, password: string) {
  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!LOCAL_ADMIN_EMAILS.has(email) || !LOCAL_ADMIN_PASSWORDS.has(password)) {
    return null;
  }

  const redirect = safeReturnUrl(payload.return_url);
  const session = createLocalAdminSession();
  const response = NextResponse.json({
    status: 1,
    message: "تم تسجيل الدخول بحساب الأدمن المحلي.",
    redirect,
    data: session,
  });

  response.cookies.set(LOCAL_ADMIN_COOKIE, encodeLocalAdminSession(session), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: payload.remember || payload.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "session-login", 10);
  if (rateLimit) return rateLimit;

  const payload = await readJsonBody<LoginRequestBody>(request);
  if (!payload) {
    return jsonError("Invalid login request.", 422);
  }

  const email = String(payload.email ?? "").trim().slice(0, 190);
  const password = String(payload.password ?? "");
  const mobile = String(payload.mobile ?? "").replace(/[^\d+]/g, "").slice(0, 20);
  const code = [payload.digit1, payload.digit2, payload.digit3, payload.digit4].map((digit) =>
    String(digit ?? "").replace(/\D/g, "").slice(0, 1),
  );

  const isEmailLogin = email.includes("@") || password.length > 0;
  if (isEmailLogin && (!email || password.length < 6)) {
    return jsonError("Invalid login request.", 422);
  }

  if (!isEmailLogin && (!mobile || code.some((digit) => digit.length !== 1))) {
    return jsonError("Invalid login request.", 422);
  }

  const localAdminResponse = isEmailLogin ? localAdminLoginResponse(payload, password) : null;
  if (localAdminResponse) {
    return localAdminResponse;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const upstream = await fetch(legacyUrl("/bridge/v1/session/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(isEmailLogin ? {
        email,
        password,
        remember: Boolean(payload.remember ?? payload.rememberMe),
        rememberMe: Boolean(payload.remember ?? payload.rememberMe),
        return_url: safeReturnUrl(payload.return_url, "/"),
      } : {
        mobile,
        digit1: code[0],
        digit2: code[1],
        digit3: code[2],
        digit4: code[3],
        remember: Boolean(payload.remember),
        return_url: safeReturnUrl(payload.return_url),
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    if (!upstream.ok && localAdminResponse) {
      return localAdminResponse;
    }

    const response = new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });

    appendHardenedSetCookies(response, upstream);
    return response;
  } catch {
    if (localAdminResponse) {
      return localAdminResponse;
    }

    return jsonError("تعذر الوصول إلى خدمة تسجيل الدخول حاليا. استخدم حساب الأدمن المحلي أو اضبط رابط Laravel.", 503);
  } finally {
    clearTimeout(timeout);
  }
}