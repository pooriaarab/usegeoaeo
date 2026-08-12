import type { QueueJobMessage } from "@template/jobs";

interface Env {
  DB: D1Database;
  FLAGS: KVNamespace;
  ENVIRONMENT: string;
  /** Cloudflare Email Service binding (send_email). Prefer over Resend. */
  EMAIL?: {
    send(message: {
      to: string | string[];
      from: string | { email: string; name?: string };
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
    }): Promise<{ messageId?: string } | void>;
  };
  EMAIL_FROM?: string;
  /** @deprecated use EMAIL binding */
  RESEND_API_KEY?: string;
}

export default {
  async queue(batch: MessageBatch<QueueJobMessage>, env: Env, ctx: ExecutionContext) {
    console.log(`[queue-consumer] Processing batch of ${batch.messages.length} messages`);

    for (const msg of batch.messages) {
      const message = msg.body;
      const id = message.id;

      // Idempotency check using KV
      const idempotencyKey = `job_run:${id}`;
      const alreadyRun = await env.FLAGS.get(idempotencyKey);
      if (alreadyRun) {
        console.warn(`[queue-consumer] Duplicate message skipped: ${id} (${message.type})`);
        msg.ack();
        continue;
      }

      console.log(`[queue-consumer] Processing message: ${id} [Type: ${message.type}]`);

      try {
        switch (message.type) {
          case "job.demo": {
            console.log(`[queue-consumer] DEMO JOB SUCCESS! Payload:`, JSON.stringify(message.payload));
            break;
          }
          case "email.send": {
            const { to, subject, html, text, from } = message.payload;
            const fromAddr = from || env.EMAIL_FROM || "onboarding@localhost";
            console.log(`[queue-consumer] EMAIL JOB: to=${to} subject="${subject}"`);
            if (env.EMAIL) {
              await env.EMAIL.send({
                to,
                from: typeof fromAddr === "string" ? { email: fromAddr } : fromAddr,
                subject,
                html: html || text,
                text: text || html,
              });
              console.log(`[queue-consumer] Email sent via Cloudflare Email Service`);
            } else if (env.ENVIRONMENT !== "production") {
              console.log(`[queue-consumer] EMAIL binding missing; mock send`, {
                from: fromAddr,
                to,
                subject,
                body: (html || text || "").slice(0, 200),
              });
            } else {
              throw new Error("EMAIL (send_email) binding required in production");
            }
            break;
          }
          case "outbox.drain": {
            console.log(`[queue-consumer] OUTBOX DRAIN JOB: Draining outbox items...`);
            break;
          }
          default: {
            console.warn(`[queue-consumer] Unknown job type received: ${(message as any).type}`);
          }
        }

        // Save idempotency key to prevent duplicate runs (expire after 24h)
        await env.FLAGS.put(idempotencyKey, "success", { expirationTtl: 86400 });
        msg.ack();
      } catch (err) {
        console.error(`[queue-consumer] Error processing message ${id}:`, err);
        // Do not ack the message so it can be retried
        msg.retry();
      }
    }
  },
};
