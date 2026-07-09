import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-security";
import { readToolsStore } from "../../_store";

export async function GET(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const { jobId } = await context.params;
  const store = await readToolsStore();
  const run = store.runs.find((item) => item.id === jobId);
  return NextResponse.json({ status: run?.status ?? "success", output: run?.output ?? [], duration: run?.duration ?? "0.0 ثانية", result: run ?? null });
}
