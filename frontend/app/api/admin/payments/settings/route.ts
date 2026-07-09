import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readPaymentsStore, writePaymentsStore } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readPaymentsStore();
  return NextResponse.json({ status: 1, data: store.settings });
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const store = await readPaymentsStore();
  const settings = { ...store.settings, ...body };
  await writePaymentsStore({ ...store, settings });
  return NextResponse.json({ status: 1, message: "تم حفظ إعدادات الدفع.", data: settings });
}
