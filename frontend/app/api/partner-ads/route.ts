import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, checkRateLimit, jsonError, readJsonBody, requireAdminSession } from "@/lib/api-security";
import { createPartnerAd, listPartnerAds, listPublicAds } from "@/lib/partner-ads-store";
import { resolveAuthenticatedPartnerId } from "@/lib/partner-session";

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 220) : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scope = searchParams.get("scope") ?? "public";
  const partnerSlug = searchParams.get("partnerSlug") ?? undefined;

  if (scope === "admin") {
    const authError = await requireAdminSession(request);
    if (authError) return authError;

    return NextResponse.json({ status: 1, data: await listPartnerAds() });
  }

  if (scope === "partner") {
    const partnerId = await resolveAuthenticatedPartnerId(request);
    if (!partnerId) return jsonError("Authentication required.", 401);

    return NextResponse.json({ status: 1, data: await listPartnerAds(partnerId) });
  }

  return NextResponse.json({ status: 1, data: await listPublicAds(partnerSlug) });
}

export async function POST(request: NextRequest) {
  const partnerId = await resolveAuthenticatedPartnerId(request);
  if (!partnerId) return jsonError("Authentication required.", 401);

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const rateLimitError = checkRateLimit(request, "partner-ads:create", 20);
  if (rateLimitError) return rateLimitError;

  const payload = await readJsonBody<Record<string, unknown>>(request);
  if (!payload) return jsonError("Invalid payload.", 422);

  const title = cleanText(payload.title);
  const description = cleanText(payload.description, "").slice(0, 420);
  const targetUrl = cleanText(payload.targetUrl, "/partners/montaja-rawafed/ads");
  const budget = Number(payload.budget ?? 0);

  if (title.length < 4 || description.length < 10 || !Number.isFinite(budget) || budget <= 0) {
    return jsonError("Please provide a valid ad title, description, and budget.", 422);
  }

  const ad = await createPartnerAd({
    // partnerId is always the authenticated caller's own id - never taken from the
    // request body, so one partner cannot create an ad attributed to another partner.
    partnerId,
    partnerSlug: cleanText(payload.partnerSlug, partnerId),
    partnerName: cleanText(payload.partnerName, "منتجع روافد"),
    title,
    description,
    placement: cleanText(payload.placement, "واجهة البحث"),
    serviceType: cleanText(payload.serviceType, "شاليهات وفلل"),
    city: cleanText(payload.city, "الرياض"),
    budget,
    targetUrl,
    imageUrl: cleanText(payload.imageUrl, "/images/labayh-logo.svg"),
  });

  return NextResponse.json({ status: 1, data: ad }, { status: 201 });
}
