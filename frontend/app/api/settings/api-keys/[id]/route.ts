import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { readStore, writeStore, type StoredApiKey } from "../../_store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const { id } = await context.params;
  const patch = (await request.json().catch(() => null)) as Partial<StoredApiKey> | null;
  if (!patch) return jsonError("Invalid payload.", 422);

  const store = await readStore();
  const keys = store.keys.map((key) => (key.id === id ? { ...key, ...patch, id } : key));
  await writeStore({ ...store, keys });
  return NextResponse.json({ status: 1, data: keys.find((key) => key.id === id) ?? null });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const { id } = await context.params;
  const store = await readStore();
  await writeStore({ ...store, keys: store.keys.filter((key) => key.id !== id) });
  return NextResponse.json({ status: 1 });
}
