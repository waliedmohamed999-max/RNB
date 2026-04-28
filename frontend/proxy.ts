import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE_NAME = "labayh_csrf";
const DASHBOARD_SESSION_HEADER = "x-labayh-session";
const VERCEL_ADMIN_COOKIE = "labayh_vercel_admin";
const DEFAULT_LEGACY_BASE_URL = "http://127.0.0.1:8000";
const PROTECTED_PREFIXES = ["/api/v1/dashboard", "/api/bookings", "/api/finance"];
const ADMIN_PREFIXES = ["/api/admin", "/api/settings", "/api/seo"];
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_API_ROUTES = new Set([
  "/api/auth/check-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/session/login",
  "/api/session/logout",
  "/api/session/register",
  "/api/partners/apply",
  "/api/v1/bookings/complete",
  "/api/seo/robots.txt",
  "/api/seo/sitemap.xml",
]);
const legacyBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_LEGACY_BASE_URL || DEFAULT_LEGACY_BASE_URL);
const legacyOrigin = new URL(legacyBaseUrl).origin;
const configuredTrustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const publicSiteOrigin = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
  : "";

function createToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function encodeSessionHeader(session: unknown) {
  return encodeURIComponent(JSON.stringify(session));
}

async function getSession(request: NextRequest) {
  const localSession = readLocalAdminSession(request.cookies.get(VERCEL_ADMIN_COOKIE)?.value);
  if (localSession) {
    return localSession;
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
      return null;
    }

    const payload = (await response.json()) as { status?: number; data?: { roles?: unknown } };
    return payload.status && payload.data ? payload.data : null;
  } catch {
    return null;
  }
}

function readLocalAdminSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(decodeURIComponent(value)) as { roles?: unknown };
    const roles = Array.isArray(session.roles) ? session.roles : [];
    return roles.length > 0 ? session : null;
  } catch {
    return null;
  }
}

function isAdminSession(session: { roles?: unknown } | null) {
  const roles = Array.isArray(session?.roles) ? session.roles.map((role) => String(role).toLowerCase()) : [];
  return roles.some((role) => ["administrator", "admin", "superadmin"].includes(role));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const adminRoute =
    ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !PUBLIC_API_ROUTES.has(pathname);
  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value ?? "";
  const origin = request.headers.get("origin");
  const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
  const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const requestOrigin = `${forwardedProto}://${requestHost}`;
  const trustedOrigins = new Set([
    request.nextUrl.origin,
    requestOrigin,
    legacyOrigin,
    publicSiteOrigin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...configuredTrustedOrigins,
  ].filter(Boolean));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(DASHBOARD_SESSION_HEADER);

  if (pathname.startsWith("/api/") && origin && !trustedOrigins.has(origin)) {
    return NextResponse.json({ status: 0, message: "Origin not allowed." }, { status: 403 });
  }

  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    applyCorsHeaders(response, origin, trustedOrigins);
    return response;
  }

  if (
    pathname.startsWith("/api/") &&
    STATE_CHANGING_METHODS.has(request.method) &&
    !PUBLIC_API_ROUTES.has(pathname)
  ) {
    const headerToken = request.headers.get("x-csrf-token") ?? "";
    if (!csrfToken || headerToken !== csrfToken) {
      return NextResponse.json({ status: 0, message: "Invalid request token." }, { status: 403 });
    }
  }

  if (protectedRoute || adminRoute) {
    const session = await getSession(request);
    if (!session) {
      if (pathname.startsWith("/api/")) {
        const response = NextResponse.json({ status: 0, message: "Authentication required." }, { status: 401 });
        applyCorsHeaders(response, origin, trustedOrigins);
        return response;
      }

      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("return_url", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (adminRoute && !isAdminSession(session)) {
      const response = NextResponse.json({ status: 0, message: "Admin permissions required." }, { status: 403 });
      applyCorsHeaders(response, origin, trustedOrigins);
      return response;
    }

    requestHeaders.set(DASHBOARD_SESSION_HEADER, encodeSessionHeader(session));
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
    response.headers.append("Vary", "Origin");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
