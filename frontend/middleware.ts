import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME } from "@/lib/security-constants";
import { legacyBaseUrl } from "@/lib/platform";
import { PARTNER_ACCESS_COOKIE, PARTNER_REFRESH_COOKIE } from "@/lib/partner-session";

const PROTECTED_PREFIXES = ["/dashboard", "/api/v1/dashboard"];
const PARTNER_DASHBOARD_PREFIX = "/partner-dashboard";
const PARTNER_API_PREFIX = "/api/partner-system";
const LOCAL_ADMIN_COOKIE = "labayh_vercel_admin";
const PARTNER_PUBLIC_API_PREFIXES = [
  "/api/partner-system/auth/login",
  "/api/partner-system/auth/register-partner",
  "/api/partner-system/health",
];
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const legacyOrigin = new URL(legacyBaseUrl).origin;
const configuredTrustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function createToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseSessionCandidate(value: string) {
  try {
    const session = JSON.parse(value) as { roles?: unknown };
    const roles = Array.isArray(session.roles) ? session.roles : [];
    return roles.length > 0;
  } catch {
    return false;
  }
}

function hasLocalAdminSession(request: NextRequest) {
  const raw = request.cookies.get(LOCAL_ADMIN_COOKIE)?.value;
  if (!raw) {
    return false;
  }

  const candidates = new Set<string>([raw]);
  let decoded = raw;

  for (let index = 0; index < 3; index += 1) {
    try {
      decoded = decodeURIComponent(decoded);
      candidates.add(decoded);
    } catch {
      break;
    }
  }

  for (const candidate of Array.from(candidates)) {
    try {
      candidates.add(decodeBase64Url(candidate));
    } catch {
      // Keep trying the remaining formats.
    }
  }

  return Array.from(candidates).some(parseSessionCandidate);
}
async function hasSession(request: NextRequest) {
  if (hasLocalAdminSession(request)) {
    return true;
  }

  try {
    const response = await fetch(`${legacyBaseUrl}/bridge/v1/session`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { status?: number; data?: unknown };
    return Boolean(payload.status && payload.data);
  } catch {
    return false;
  }
}

function hasPartnerCredential(request: NextRequest) {
  return Boolean(
    request.headers.get("authorization") ||
      request.cookies.get(PARTNER_ACCESS_COOKIE)?.value ||
      request.cookies.get(PARTNER_REFRESH_COOKIE)?.value,
  );
}

function isPartnerDashboardRoute(pathname: string) {
  return pathname.startsWith(PARTNER_DASHBOARD_PREFIX) && pathname !== "/partner-dashboard/login";
}

function isProtectedPartnerApiRoute(pathname: string) {
  return pathname.startsWith(PARTNER_API_PREFIX) && !PARTNER_PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const partnerDashboardRoute = isPartnerDashboardRoute(pathname);
  const protectedPartnerApiRoute = isProtectedPartnerApiRoute(pathname);
  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value ?? "";
  const trustedOrigins = new Set([request.nextUrl.origin, legacyOrigin, ...configuredTrustedOrigins]);
  const origin = request.headers.get("origin");

  if (pathname.startsWith("/api/") && origin && !trustedOrigins.has(origin)) {
    return NextResponse.json({ status: 0, message: "Origin not allowed." }, { status: 403 });
  }

  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, origin, trustedOrigins);
    return response;
  }

  if (pathname.startsWith("/api/") && STATE_CHANGING_METHODS.has(request.method)) {
    const headerToken = request.headers.get("x-csrf-token") ?? "";
    if (!csrfToken || headerToken !== csrfToken) {
      return NextResponse.json({ status: 0, message: "Invalid request token." }, { status: 403 });
    }
  }

  if ((partnerDashboardRoute || protectedPartnerApiRoute) && !hasPartnerCredential(request)) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ status: 0, message: "Authentication required." }, { status: 401 });
      applyCorsHeaders(response, origin, trustedOrigins);
      return response;
    }

    const loginUrl = new URL("/partner-dashboard/login", request.url);
    loginUrl.searchParams.set("return_url", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (protectedRoute && !(await hasSession(request))) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ status: 0, message: "Authentication required." }, { status: 401 });
      applyCorsHeaders(response, origin, trustedOrigins);
      return response;
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("return_url", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  applyCorsHeaders(response, origin, trustedOrigins);
  if (!csrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, createToken(), {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

function applyCorsHeaders(response: NextResponse, origin: string | null, trustedOrigins: Set<string>) {
  if (origin && trustedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-CSRF-Token");
    response.headers.append("Vary", "Origin");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

