import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { readToolsStore, writeToolsStore, type Job } from "../../_store";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;
  const { id } = await context.params;
  const patch = (await request.json().catch(() => null)) as Partial<Job> | null;
  const store = await readToolsStore();
  const jobs = store.jobs.map((job) => (job.id === id ? { ...job, ...patch, id } : job));
  await writeToolsStore({ ...store, jobs });
  return NextResponse.json({ status: 1, data: jobs.find((job) => job.id === id) ?? null });
}
