import { NextRequest, NextResponse } from "next/server";
import { appendHardenedSetCookies, assertBodySize, assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";
import { normalizeDeepText } from "@/lib/text";

const ALLOWED_SEGMENTS = /^[a-zA-Z0-9/_-]+$/;

function normalizeJsonResponse(text: string) {
  try {
    return JSON.stringify(normalizeDeepText(JSON.parse(text)));
  } catch {
    return text;
  }
}

async function proxyAdmin(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const bodySizeError = assertBodySize(request);
  if (bodySizeError) return bodySizeError;

  const { path } = await context.params;
  const joinedPath = path.join("/");
  if (!joinedPath || !ALLOWED_SEGMENTS.test(joinedPath)) {
    return jsonError("Invalid admin endpoint.", 404);
  }

  const search = request.nextUrl.searchParams.toString();
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  const upstream = await fetch(legacyUrl(`/bridge/v1/admin/${joinedPath}${search ? `?${search}` : ""}`), {
    method: request.method === "PUT" || request.method === "DELETE" ? "POST" : request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
    },
    body: body || undefined,
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const upstreamText = await upstream.text();
  const responseBody = contentType.includes("application/json")
    ? normalizeJsonResponse(upstreamText)
    : upstreamText;

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      "content-type": contentType,
      ...(upstream.headers.get("content-disposition")
        ? { "content-disposition": upstream.headers.get("content-disposition") as string }
        : {}),
    },
  });

  appendHardenedSetCookies(response, upstream);
  return response;
}

export const GET = proxyAdmin;
export const POST = proxyAdmin;
export const PUT = proxyAdmin;
export const DELETE = proxyAdmin;
