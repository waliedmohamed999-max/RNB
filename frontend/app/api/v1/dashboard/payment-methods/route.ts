import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";
import type { PaymentMethod } from "@/lib/payment-methods";
import { defaultPaymentMethods, getPaymentMethods, savePaymentMethods } from "@/lib/payment-methods";

const validKeys = new Set(defaultPaymentMethods.map((method) => method.key));
const validSettlements = new Set(["online", "manual", "offline", "installment"]);

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const methods = await getPaymentMethods();
  return NextResponse.json({ status: 1, data: methods });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const payload = (await request.json().catch(() => null)) as { methods?: unknown } | null;

  if (!payload || !Array.isArray(payload.methods)) {
    return NextResponse.json({ status: 0, message: "Invalid payment methods payload." }, { status: 422 });
  }

  const methods: PaymentMethod[] = payload.methods
    .filter((method): method is PaymentMethod => {
      if (!method || typeof method !== "object") return false;
      const candidate = method as PaymentMethod;
      return validKeys.has(candidate.key) && validSettlements.has(candidate.settlement);
    })
    .map((method) => ({
      ...method,
      key: method.key,
      label: String(method.label || ""),
      description: String(method.description || ""),
      enabled: Boolean(method.enabled),
      settlement: method.settlement,
      instructions: method.instructions ? String(method.instructions) : "",
      feePercent: Number(method.feePercent || 0),
      feeFixed: Number(method.feeFixed || 0),
      maxAmount: Number(method.maxAmount || 0),
    }));

  const saved = await savePaymentMethods(methods);
  return NextResponse.json({ status: 1, message: "تم تحديث طرق الدفع.", data: saved });
}
