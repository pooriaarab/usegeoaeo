import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { sendJob, type EmailSendJob } from "@template/jobs";

export const dynamic = "force-dynamic";

/** POST /api/v1/contact - verify Turnstile token and process contact form */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    message?: string;
    turnstileToken?: string;
  } | null;

  if (!body?.email || !body?.message) {
    return NextResponse.json({ error: "email and message are required" }, { status: 400 });
  }

  const { email, message, turnstileToken } = body;

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;

  const secretKey = cfEnv.TURNSTILE_SECRET_KEY;

  if (secretKey) {
    // Cloudflare siteverify expects application/x-www-form-urlencoded or JSON
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", turnstileToken || "");

    try {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });

      const verifyData = (await verifyRes.json()) as { success: boolean; "error-codes"?: string[] };

      if (!verifyData.success) {
        console.error("[turnstile] Verification failed", verifyData["error-codes"]);
        return NextResponse.json(
          { error: "Turnstile verification failed. Please try again.", details: verifyData["error-codes"] },
          { status: 400 }
        );
      }
    } catch (err: any) {
      console.error("[turnstile] Verification error", err);
      return NextResponse.json({ error: "Turnstile siteverify API request failed." }, { status: 500 });
    }
  } else {
    // Turnstile secret missing
    if (cfEnv.ENVIRONMENT === "production") {
      return NextResponse.json(
        { error: "Security configuration error: Turnstile is required in production." },
        { status: 500 }
      );
    }
    console.warn("[turnstile] SECRET_KEY missing in development, bypassing Turnstile verification.");
  }

  // Verification passed or bypassed in development!
  console.log(`[contact form] Submission from ${email}: "${message}"`);

  // End-to-end proof: enqueue a confirmation email sending job to OUTBOX_QUEUE
  let enqueued = false;
  let jobId = "";

  if (cfEnv.OUTBOX_QUEUE) {
    jobId = `mail_contact_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const emailJob: EmailSendJob = {
      type: "email.send",
      id: jobId,
      payload: {
        to: email,
        subject: "Contact Form Submission Received",
        html: `<h3>Thank you for reaching out!</h3><p>We received your message:</p><blockquote>${message}</blockquote><p>Our team will get back to you shortly.</p>`,
        from: cfEnv.EMAIL_FROM || "onboarding@localhost",
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await sendJob(cfEnv.OUTBOX_QUEUE, emailJob);
      enqueued = true;
      console.log(`[contact form] Enqueued confirmation email job: ${jobId}`);
    } catch (err) {
      console.error("[contact form] Failed to enqueue email job:", err);
    }
  }

  return NextResponse.json({
    success: true,
    message: "Thank you! Your message has been received and verified.",
    email,
    enqueued,
    jobId,
  });
}
