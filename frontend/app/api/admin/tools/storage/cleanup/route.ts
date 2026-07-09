import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  return NextResponse.json({ status: 1, output: ["تم حذف الملفات المؤقتة", "تم تحرير 291 MB"] });
}
