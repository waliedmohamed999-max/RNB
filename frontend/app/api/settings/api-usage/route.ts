import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  return NextResponse.json({
    status: 1,
    data: {
      today: 2847,
      month: 84291,
      successRate: 99.2,
      averageLatencyMs: 142,
      limits: {
        perMinute: { used: 847, total: 1000 },
        perDay: { used: 84291, total: 100000 },
        perMonth: { used: 84291, total: 1000000 },
      },
    },
  });
}
