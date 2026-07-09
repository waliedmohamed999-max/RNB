import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readGeneralStore, writeGeneralStore } from "../../general/_store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const patch = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const store = await readGeneralStore();
  const cities = store.cities.map((city) => (city.id === id ? { ...city, ...patch, id } : city));
  await writeGeneralStore({ ...store, cities });
  return NextResponse.json({ status: 1, data: cities.find((city) => city.id === id) ?? null });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const store = await readGeneralStore();
  await writeGeneralStore({ ...store, cities: store.cities.filter((city) => city.id !== id) });
  return NextResponse.json({ status: 1 });
}
