import { NextRequest, NextResponse } from "next/server";
import { partnerApiUrl } from "@/lib/partner-api";

export const PARTNER_ACCESS_COOKIE = "rnb_partner_access";
export const PARTNER_REFRESH_COOKIE = "rnb_partner_refresh";

const ACCESS_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type PartnerAuthPayload = {
  ok?: boolean;
  data?: {
    token?: string;
    refreshToken?: string;
    role?: string;
  };
  message?: string;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function getPartnerAccessToken(request: NextRequest) {
  return request.cookies.get(PARTNER_ACCESS_COOKIE)?.value ?? "";
}

export function getPartnerRefreshToken(request: NextRequest) {
  return request.cookies.get(PARTNER_REFRESH_COOKIE)?.value ?? "";
}

export function setPartnerSessionCookies(response: NextResponse, auth: PartnerAuthPayload) {
  const token = auth.data?.token;
  const refreshToken = auth.data?.refreshToken;

  if (token) {
    response.cookies.set(PARTNER_ACCESS_COOKIE, token, cookieOptions(ACCESS_MAX_AGE_SECONDS));
  }

  if (refreshToken) {
    response.cookies.set(PARTNER_REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE_SECONDS));
  }
}

export function clearPartnerSessionCookies(response: NextResponse) {
  response.cookies.set(PARTNER_ACCESS_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  response.cookies.set(PARTNER_REFRESH_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function refreshPartnerSession(request: NextRequest) {
  const refreshToken = getPartnerRefreshToken(request);
  if (!refreshToken) return null;

  const upstream = await fetch(partnerApiUrl("auth/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "RNB frontend",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  if (!upstream?.ok) return null;

  const payload = (await upstream.json().catch(() => null)) as PartnerAuthPayload | null;
  if (!payload?.ok || !payload.data?.token || !payload.data?.refreshToken) {
    return null;
  }

  return payload;
}

export function partnerAuthHeader(request: NextRequest, overrideToken?: string) {
  const existing = request.headers.get("authorization");
  if (existing) return existing;

  const token = overrideToken ?? getPartnerAccessToken(request);
  return token ? `Bearer ${token}` : "";
}

/**
 * Resolves the authenticated partner's real id by asking the partner-api backend
 * (via /partner/me) who the caller's access token belongs to. Never trust a
 * partnerId supplied by the client body/query string for authorization - always
 * use this instead, so a caller cannot act as another partner.
 */
export async function resolveAuthenticatedPartnerId(request: NextRequest): Promise<string | null> {
  const authorization = partnerAuthHeader(request);
  if (!authorization) return null;

  try {
    const upstream = await fetch(partnerApiUrl("partner/me"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    });

    if (!upstream.ok) return null;

    const payload = (await upstream.json().catch(() => null)) as { ok?: boolean; data?: { id?: string | number } } | null;
    const id = payload?.data?.id;
    return id === undefined || id === null ? null : String(id);
  } catch {
    return null;
  }
}
