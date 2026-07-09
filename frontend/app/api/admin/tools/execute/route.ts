import { NextRequest, NextResponse } from "next/server";
import { assertCsrf, requireAdminSession } from "@/lib/api-security";
import { legacyUrl } from "@/lib/platform";
import { readToolsStore, writeToolsStore, type ToolRun } from "../_store";

const bridgeActions = new Set(["clear_cache", "clear_view", "update_version", "symlink", "maintenance_on", "maintenance_off"]);

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  const startedAt = performance.now();
  const body = (await request.json().catch(() => null)) as { tool?: string; params?: { bridgeAction?: string; password?: string } } | null;
  const tool = body?.tool ?? "unknown";
  const bridgeAction = body?.params?.bridgeAction;
  let output: string[] = [`بدء تنفيذ ${tool}`, "تهيئة بيئة التنفيذ"];
  let ok = true;

  if (bridgeAction && bridgeActions.has(bridgeAction)) {
    const upstream = await fetch(legacyUrl("/bridge/v1/dashboard/system-native/tools"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ system_tool: bridgeAction, password: body?.params?.password ?? "" }),
      cache: "no-store",
    }).catch(() => null);
    const result = upstream ? ((await upstream.json().catch(() => null)) as { status?: number; message?: string; data?: { logs?: string[] } } | null) : null;
    ok = Boolean(upstream?.ok && result?.status === 1);
    output = result?.data?.logs?.length ? result.data.logs : [result?.message ?? "تم إرسال الطلب إلى النظام."];
  } else {
    output = [
      "فحص الصلاحيات",
      "تشغيل العملية في وضع آمن",
      "تحليل النتائج",
      "اكتمل التنفيذ التجريبي بنجاح",
    ];
  }

  const run: ToolRun = {
    id: `job_${Date.now()}`,
    tool,
    status: ok ? "success" : "failed",
    output,
    duration: `${((performance.now() - startedAt) / 1000).toFixed(1)} ثانية`,
    createdAt: new Date().toISOString(),
  };
  const store = await readToolsStore();
  await writeToolsStore({ ...store, runs: [run, ...store.runs].slice(0, 100) });

  return NextResponse.json({ jobId: run.id, status: run.status, output: run.output, duration: run.duration, result: run });
}
