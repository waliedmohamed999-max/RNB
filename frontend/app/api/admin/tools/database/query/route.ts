import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const body = (await request.json().catch(() => null)) as { query?: string } | null;
  const query = body?.query?.trim() ?? "";
  if (!/^select\s/i.test(query)) return jsonError("Only SELECT queries are allowed.", 422);
  return NextResponse.json({ status: 1, data: { columns: ["id", "name"], rows: [[1, "Sample"]] } });
}
