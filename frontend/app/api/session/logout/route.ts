import { NextRequest, NextResponse } from "next/server";
import { legacyUrl } from "@/lib/platform";
import { appendHardenedSetCookies } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  return logout(request, true);
}

export async function POST(request: NextRequest) {
  return logout(request, false);
}

async function logout(request: NextRequest, redirectToLogin: boolean) {
  let upstream: Response | null = null;
  let text = JSON.stringify({ status: 1, message: "Logged out." });

  try {
    upstream = await fetch(legacyUrl("/bridge/v1/session/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });
    text = await upstream.text();
  } catch {
    upstream = null;
  }

  const response = redirectToLogin
    ? NextResponse.redirect(new URL("/auth/login?logged_out=1", publicOrigin(request)))
    : new NextResponse(text, {
        status: 200,
        headers: {
          "content-type": upstream?.headers.get("content-type") ?? "application/json",
        },
      });

  if (upstream) {
    appendHardenedSetCookies(response, upstream);
  }

  const knownCookieNames = new Set([
    "labayh_csrf",
    "XSRF-TOKEN",
    "laravel_session",
    "labayh_session",
    "labayh_vercel_admin",
    "cartalyst_sentinel",
  ]);
  request.cookies.getAll().forEach((cookie) => {
    if (/(session|sentinel|xsrf|csrf|remember)/i.test(cookie.name)) {
      knownCookieNames.add(cookie.name);
    }
  });

  knownCookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}

function publicOrigin(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  return `${proto}://${host}`;
}
