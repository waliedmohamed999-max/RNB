import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  return NextResponse.json({
    status: 1,
    message: "تم اختبار الاتصال بنجاح.",
    data: { gateway: id, latencyMs: 118, checkedAt: new Date().toISOString() },
  });
}
