import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  return NextResponse.json({
    status: 1,
    data: [
      { id: "log_1", method: "GET", endpoint: "/v1/listings", status: 200, duration: 128, date: "2026-04-18T00:12:00.000Z" },
      { id: "log_2", method: "POST", endpoint: "/v1/bookings", status: 201, duration: 214, date: "2026-04-17T23:45:00.000Z" },
      { id: "log_3", method: "POST", endpoint: "/v1/payments/charge", status: 422, duration: 392, date: "2026-04-17T22:10:00.000Z" },
    ],
  });
}
