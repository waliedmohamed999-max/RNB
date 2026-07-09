import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, readJsonBody, requireAdminSession } from "@/lib/api-security";
import { updatePartnerAdStatus, type PartnerAdStatus } from "@/lib/partner-ads-store";

const statuses: PartnerAdStatus[] = ["draft", "pending", "approved", "rejected"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const { id } = await context.params;
  const payload = await readJsonBody<Record<string, unknown>>(request);
  const status = typeof payload?.status === "string" ? payload.status : "";
  if (!statuses.includes(status as PartnerAdStatus)) {
    return jsonError("Invalid ad status.", 422);
  }

  const reviewNote = typeof payload?.reviewNote === "string" ? payload.reviewNote.trim().slice(0, 300) : "";
  const ad = await updatePartnerAdStatus(id, status as PartnerAdStatus, reviewNote);
  if (!ad) return jsonError("Ad was not found.", 404);

  return NextResponse.json({ status: 1, data: ad });
}
