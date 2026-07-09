import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore, writePaymentsStore } from "../../_store";

export async function POST(request: NextRequest, context: { params: Promise<{ partnerId: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { partnerId } = await context.params;
  const store = await readPaymentsStore();
  const payouts = store.payouts.map((payout) =>
    payout.partnerId === partnerId ? { ...payout, due: 0, lastPayout: new Date().toISOString().slice(0, 10), status: "paid" as const } : payout,
  );
  await writePaymentsStore({ ...store, payouts });
  return NextResponse.json({ status: 1, message: "تم تسجيل التحويل للشريك.", data: payouts.find((payout) => payout.partnerId === partnerId) });
}
