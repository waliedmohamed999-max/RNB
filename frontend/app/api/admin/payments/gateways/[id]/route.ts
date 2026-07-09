import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { toPublicPaymentMethod, type PaymentMethod } from "@/lib/payment-methods";
import { getGateways, saveGateways } from "../../_store";

const PATCHABLE_FIELDS = [
  "label",
  "description",
  "enabled",
  "settlement",
  "instructions",
  "publicKey",
  "secretKey",
  "webhookSecret",
  "merchantId",
  "terminalId",
  "merchantKey",
  "bankName",
  "accountName",
  "iban",
  "swift",
  "maxAmount",
  "feePercent",
  "feeFixed",
  "logo",
] as const satisfies readonly (keyof PaymentMethod)[];

function pickAllowedFields(patch: Record<string, unknown>): Partial<PaymentMethod> {
  const result: Partial<PaymentMethod> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(patch, field)) {
      (result as Record<string, unknown>)[field] = patch[field];
    }
  }
  return result;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const rawPatch = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch = pickAllowedFields(rawPatch);
  const gateways = await getGateways();
  const saved = await saveGateways(gateways.map((gateway) => (gateway.key === id ? { ...gateway, ...patch } : gateway)));
  const updated = saved.find((gateway) => gateway.key === id);
  return NextResponse.json({ status: 1, message: "تم تحديث البوابة.", data: updated ? toPublicPaymentMethod(updated) : null });
}
