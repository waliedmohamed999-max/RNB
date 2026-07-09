import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore, writePaymentsStore } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readPaymentsStore();
  return NextResponse.json({ status: 1, data: store.refunds });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const store = await readPaymentsStore();
  const refund = {
    id: `ref_${Date.now()}`,
    bookingId: String(body.bookingId ?? "#LB-NEW"),
    customer: String(body.customer ?? "عميل"),
    amount: Number(body.amount ?? 0),
    reason: String(body.reason ?? "طلب العميل"),
    status: "review" as const,
    date: new Date().toISOString(),
  };
  await writePaymentsStore({ ...store, refunds: [refund, ...store.refunds] });
  return NextResponse.json({ status: 1, message: "تم إنشاء طلب الاسترداد.", data: refund });
}
