import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readGeneralStore, writeGeneralStore } from "../general/_store";

export async function PUT(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const colors = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const store = await readGeneralStore();
  await writeGeneralStore({ ...store, colors: colors ?? {} });
  return NextResponse.json({ status: 1, data: colors });
}
