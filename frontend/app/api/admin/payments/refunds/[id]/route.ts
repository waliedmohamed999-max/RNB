import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore, writePaymentsStore } from "../../_store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const store = await readPaymentsStore();
  const refunds = store.refunds.map((refund) =>
    refund.id === id ? { ...refund, status: (body.status ?? refund.status) as typeof refund.status } : refund,
  );
  await writePaymentsStore({ ...store, refunds });
  return NextResponse.json({ status: 1, message: "تم تحديث الاسترداد.", data: refunds.find((refund) => refund.id === id) });
}
