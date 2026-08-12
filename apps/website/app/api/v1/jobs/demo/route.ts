import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { sendJob, type JobDemoJob } from "@template/jobs";

export const dynamic = "force-dynamic";

/** POST /api/v1/jobs/demo - enqueue an async demo job to OUTBOX_QUEUE */
export async function POST(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    message?: string;
  } | null;

  const demoMessage = body?.message || "Demo message to process asynchronously";

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;
  if (!cfEnv.OUTBOX_QUEUE) {
    return NextResponse.json({ error: "Queue 'OUTBOX_QUEUE' not bound." }, { status: 500 });
  }

  // Generate a random unique ID for idempotency
  const jobId = `job_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

  const job: JobDemoJob = {
    type: "job.demo",
    id: jobId,
    payload: {
      message: demoMessage,
    },
    createdAt: new Date().toISOString(),
  };

  try {
    await sendJob(cfEnv.OUTBOX_QUEUE, job);

    return NextResponse.json({
      success: true,
      jobId,
      message: "Job enqueued successfully to outbox queue",
      job,
    });
  } catch (err: any) {
    console.error("[jobs POST] Failed to send queue job:", err);
    return NextResponse.json({ error: `Queue send failed: ${err.message || err}` }, { status: 500 });
  }
}
