import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { readStore, writeStore, type StoredIntegration } from "../_store";

function previewSecret(value: string) {
  if (!value) return "";
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readStore();
  return NextResponse.json({ status: 1, data: store.integrations ?? [] });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const body = (await request.json().catch(() => null)) as Partial<StoredIntegration> & { secretKey?: string } | null;
  if (!body?.name || !body.provider) {
    return jsonError("Integration name and provider are required.", 422);
  }

  const integration: StoredIntegration = {
    id: `int_${Date.now()}`,
    name: body.name,
    type: body.type ?? "custom",
    provider: body.provider,
    environment: body.environment ?? "test",
    status: "active",
    baseUrl: body.baseUrl ?? "",
    publicKey: body.publicKey ?? "",
    secretPreview: previewSecret(body.secretKey ?? body.secretPreview ?? ""),
    webhookUrl: body.webhookUrl ?? "",
    createdAt: new Date().toISOString(),
  };

  const store = await readStore();
  await writeStore({ ...store, integrations: [integration, ...(store.integrations ?? [])] });
  return NextResponse.json({ status: 1, data: integration });
}
