import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { readGeneralStore, writeGeneralStore } from "../general/_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readGeneralStore();
  return NextResponse.json({ status: 1, data: store.cities });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const city = (await request.json().catch(() => null)) as (Record<string, unknown> & { id?: string; nameAr?: string }) | null;
  if (!city?.nameAr) return jsonError("City name is required.", 422);
  const store = await readGeneralStore();
  const next = { ...city, id: city.id ?? `city_${Date.now()}` };
  await writeGeneralStore({ ...store, cities: [next, ...store.cities] });
  return NextResponse.json({ status: 1, data: next });
}
