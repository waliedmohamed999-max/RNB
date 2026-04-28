import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { legacyBaseUrl, legacyUrl, normalizeFrontendHref } from "@/lib/platform";
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

const VERCEL_ADMIN_COOKIE = "labayh_vercel_admin";
const EMERGENCY_ADMIN_EMAIL = "waliedmohamed999@gmail.com";
const EMERGENCY_ADMIN_PASSWORD_SHA256 = "829ac5c0e9510fcae2a68a8f80f727eb536a8140d8a582ac6fe542b837240cf9";

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

  const localAdminResponse = createLocalAdminSession(email, password, payload.return_url);
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
        return_url:
          typeof payload.return_url === "string" && payload.return_url.startsWith("/")
            ? payload.return_url.slice(0, 200)
            : "/",
      } : {
        mobile,
        digit1: code[0],
        digit2: code[1],
        digit3: code[2],
        digit4: code[3],
        remember: Boolean(payload.remember),
        return_url:
          typeof payload.return_url === "string" && payload.return_url.startsWith("/")
            ? payload.return_url.slice(0, 200)
            : "/dashboard",
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "application/json";
    let responseBody = text;

    if (contentType.includes("application/json")) {
      const payload = JSON.parse(text) as Record<string, unknown>;
      const requestedReturnUrl =
        typeof payload.return_url === "string" ? payload.return_url : isEmailLogin ? "/" : "/dashboard";
      const upstreamRedirect =
        typeof payload.redirect === "string"
          ? payload.redirect
          : typeof payload.dashboard_url === "string"
            ? payload.dashboard_url
            : requestedReturnUrl;

      payload.redirect = normalizeDashboardRedirect(upstreamRedirect, requestedReturnUrl);
      responseBody = JSON.stringify(payload);
    }

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
      },
    });

    appendHardenedSetCookies(response, upstream);
    return response;
  } catch {
    return jsonError(
      "تعذر الاتصال بخدمة تسجيل الدخول. اضبط NEXT_PUBLIC_LEGACY_BASE_URL على رابط Laravel، أو أضف ADMIN_EMAIL و ADMIN_PASSWORD في Vercel.",
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function createLocalAdminSession(email: string, password: string, returnUrl: unknown) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || EMERGENCY_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const adminPasswordHash = adminPassword ? sha256(adminPassword) : EMERGENCY_ADMIN_PASSWORD_SHA256;

  if (!adminEmail || email.toLowerCase() !== adminEmail.toLowerCase() || sha256(password) !== adminPasswordHash) {
    return null;
  }

  const user = {
    id: 1,
    email: adminEmail,
    mobile: "",
    first_name: "Admin",
    last_name: "",
    display_name: "Admin",
    avatar: "",
    roles: ["admin", "administrator"],
    dashboard_url: "/dashboard",
  };
  const redirect =
    typeof returnUrl === "string" && returnUrl.startsWith("/") ? returnUrl.slice(0, 200) : "/dashboard";
  const response = NextResponse.json({ status: 1, data: user, redirect });

  response.cookies.set(VERCEL_ADMIN_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeDashboardRedirect(value: string, fallback: string) {
  const normalized = normalizeFrontendHref(value || fallback);

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const legacy = new URL(legacyBaseUrl);
      const target = new URL(normalized);
      if (target.origin === legacy.origin) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      return fallback.startsWith("/") ? fallback : "/";
    }
  }

  return normalized.startsWith("/") ? normalized : fallback.startsWith("/") ? fallback : "/";
}
