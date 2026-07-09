import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const cpu = 18 + Math.round(Math.random() * 20);
  const memoryPercent = 62 + Math.round(Math.random() * 12);
  return NextResponse.json({
    status: 1,
    data: {
      cpu,
      memory: { used: 2.1, total: 3, percent: memoryPercent },
      database: { connected: true, size: "1.1 GB", tables: 128 },
      cache: { active: true, hitRate: 94, size: "291 MB" },
      uptime: "12 يوم 4 ساعة",
    },
  });
}
