import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";
import { CSRF_COOKIE_NAME } from "@/lib/security-constants";
import { normalizeDeepText } from "@/lib/text";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_JSON_BODY_BYTES = 128 * 1024;
export const MAX_PROXY_BODY_BYTES = 512 * 1024;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function jsonError(message = "Unable to process the request.", status = 400) {
  return NextResponse.json({ status: 0, message }, { status });
}

export function isSafeMethod(method: string) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  request: NextRequest,
  key: string,
  limit: number,
  windowMs = RATE_LIMIT_WINDOW_MS,
) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(request)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count > limit) {
    return jsonError("Too many requests. Please try again shortly.", 429);
  }

  return null;
}

export async function readJsonBody<T extends Record<string, unknown>>(
  request: NextRequest,
): Promise<T | null> {
  const contentType = request.headers.get("content-type") ?? "";
  const length = Number(request.headers.get("content-length") ?? 0);

  if (!contentType.includes("application/json")) {
    return null;
  }

  if (length > MAX_JSON_BODY_BYTES) {
    return null;
  }

  try {
    const payload = await request.json();
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as T)
      : null;
  } catch {
    return null;
  }
}

export function assertBodySize(request: NextRequest, maxBytes = MAX_PROXY_BODY_BYTES) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > maxBytes) {
    return jsonError("Request body is too large.", 413);
  }

  return null;
}

export async function requireAdminSession(request: NextRequest) {
  try {
    const response = await fetch(legacyUrl("/bridge/v1/session"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError("Authentication required.", 401);
    }

    const payload = (await response.json()) as {
      status?: number;
      data?: { roles?: unknown };
    };
    const roles = Array.isArray(payload.data?.roles) ? payload.data.roles.map(String) : [];
    const allowed = roles.some((role) => ["administrator", "admin", "superadmin"].includes(role));

    if (!payload.status || !allowed) {
      return jsonError("Admin permissions required.", 403);
    }

    return null;
  } catch {
    return jsonError("Authentication required.", 401);
  }
}

export async function requireDashboardSession(request: NextRequest) {
  try {
    const response = await fetch(legacyUrl("/bridge/v1/session"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError("Authentication required.", 401);
    }

    const payload = (await response.json()) as {
      status?: number;
      data?: { roles?: unknown };
    };
    const roles = Array.isArray(payload.data?.roles) ? payload.data.roles : [];

    if (!payload.status || roles.length === 0) {
      return jsonError("Authentication required.", 401);
    }

    return null;
  } catch {
    return jsonError("Authentication required.", 401);
  }
}

export function assertCsrf(request: NextRequest) {
  if (isSafeMethod(request.method)) {
    return null;
  }

  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value ?? "";
  const csrfHeader = request.headers.get("x-csrf-token") ?? "";
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return jsonError("Invalid request token.", 403);
  }

  return null;
}

export function appendHardenedSetCookies(target: NextResponse, upstream: Response) {
  const upstreamHeaders = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookieHeaders =
    typeof upstreamHeaders.getSetCookie === "function"
      ? upstreamHeaders.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie") as string]
        : [];

  cookieHeaders.forEach((cookie) => {
    target.headers.append("set-cookie", hardenSetCookie(cookie));
  });
}

export async function proxyBridgeResponse(
  request: NextRequest,
  path: string,
  init: {
    body?: BodyInit;
    contentType?: string | null;
  } = {},
) {
  const authError = await requireDashboardSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const bodySizeError = assertBodySize(request);
  if (bodySizeError) return bodySizeError;

  const upstream = await fetch(legacyUrl(`/bridge/v1/${path.replace(/^\/+/, "")}`), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      ...(init.contentType ? { "Content-Type": init.contentType } : {}),
    },
    body: init.body,
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const text = await upstream.text();
  const body = contentType.includes("application/json") ? normalizeJsonText(text) : text;
  const response = new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type": contentType,
    },
  });

  appendHardenedSetCookies(response, upstream);
  return response;
}

export function normalizeNumericId(value: string | number | undefined) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? String(id) : null;
}

function hardenSetCookie(cookie: string) {
  const lower = cookie.toLowerCase();
  const parts = [cookie];

  if (!lower.includes("httponly")) {
    parts.push("HttpOnly");
  }

  if (!lower.includes("samesite=")) {
    parts.push("SameSite=Strict");
  }

  if (process.env.NODE_ENV === "production" && !lower.includes("secure")) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function normalizeJsonText(text: string) {
  try {
    return JSON.stringify(normalizeDeepText(JSON.parse(text)));
  } catch {
    return text;
  }
}
