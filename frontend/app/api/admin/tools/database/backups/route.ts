import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  return NextResponse.json({ status: 1, data: [{ id: "backup_1", date: "2026-04-18", size: "128 MB" }] });
}
