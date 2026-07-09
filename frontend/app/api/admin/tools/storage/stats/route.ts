import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  return NextResponse.json({
    status: 1,
    data: {
      used: "2.7 GB",
      total: "5 GB",
      breakdown: { userImages: "400 MB", listings: "1.4 GB", media: "620 MB", backups: "210 MB", temp: "70 MB" },
    },
  });
}
