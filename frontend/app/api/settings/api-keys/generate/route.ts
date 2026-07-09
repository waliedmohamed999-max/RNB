import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { createToken } from "../../_store";

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = (await request.json().catch(() => null)) as { environment?: "live" | "test" } | null;
  return NextResponse.json({ status: 1, token: createToken(body?.environment ?? "test") });
}
