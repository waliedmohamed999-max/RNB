import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, jsonError, requireAdminSession } from "@/lib/api-security";
import { readToolsStore, writeToolsStore, type Job } from "../_store";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const store = await readToolsStore();
  return NextResponse.json({ status: 1, data: store.jobs });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const body = (await request.json().catch(() => null)) as Partial<Job> | null;
  if (!body?.name || !body.slug) return jsonError("Job name and slug are required.", 422);
  const store = await readToolsStore();
  const job: Job = { id: `job_${Date.now()}`, name: body.name, slug: body.slug, cron: body.cron ?? "0 8 * * *", active: true };
  await writeToolsStore({ ...store, jobs: [job, ...store.jobs] });
  return NextResponse.json({ status: 1, data: job });
}
