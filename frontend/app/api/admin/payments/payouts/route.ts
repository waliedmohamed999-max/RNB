import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readPaymentsStore();
  return NextResponse.json({ status: 1, data: store.payouts });
}
