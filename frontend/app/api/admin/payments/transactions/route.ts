import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const status = searchParams.get("status") ?? "all";
  const gateway = searchParams.get("gateway") ?? "all";
  const store = await readPaymentsStore();
  const transactions = store.transactions.filter((item) => {
    const matchesQ = !q || `${item.id} ${item.bookingId} ${item.customer}`.toLowerCase().includes(q);
    const matchesStatus = status === "all" || item.status === status;
    const matchesGateway = gateway === "all" || item.gateway === gateway;
    return matchesQ && matchesStatus && matchesGateway;
  });
  return NextResponse.json({ status: 1, data: transactions });
}
