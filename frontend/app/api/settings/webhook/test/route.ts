import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url || !/^https?:\/\//.test(body.url)) {
    return jsonError("Invalid webhook URL.", 422);
  }

  return NextResponse.json({ status: 1, message: "Webhook ping accepted." });
}
