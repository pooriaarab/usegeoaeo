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

type Handler = (
  message: QueueJobMessage,
  env: Env
) => Promise<void>;

async function handleDemo(
  message: Extract<QueueJobMessage, { type: "job.demo" }>
): Promise<void> {
  console.log(
    "[queue-consumer] DEMO JOB SUCCESS! Payload:",
    JSON.stringify(message.payload)
  );
}

async function handleEmailSend(
  message: Extract<QueueJobMessage, { type: "email.send" }>,
  env: Env
): Promise<void> {
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
    console.log("[queue-consumer] Email sent via Cloudflare Email Service");
    return;
  }
  if (env.ENVIRONMENT !== "production") {
    console.log("[queue-consumer] EMAIL binding missing; mock send", {
      from: fromAddr,
      to,
      subject,
      body: (html || text || "").slice(0, 200),
    });
    return;
  }
  throw new Error("EMAIL (send_email) binding required in production");
}

async function handleOutboxDrain(): Promise<void> {
  console.log("[queue-consumer] OUTBOX DRAIN JOB: Draining outbox items...");
}

const handlers: Record<QueueJobMessage["type"], Handler> = {
  "job.demo": (msg, _env) =>
    handleDemo(msg as Extract<QueueJobMessage, { type: "job.demo" }>),
  "email.send": (msg, env) =>
    handleEmailSend(
      msg as Extract<QueueJobMessage, { type: "email.send" }>,
      env
    ),
  "outbox.drain": () => handleOutboxDrain(),
};

async function processMessage(
  msg: Message<QueueJobMessage>,
  env: Env
): Promise<void> {
  const message = msg.body;
  const id = message.id;
  const idempotencyKey = `job_run:${id}`;
  const alreadyRun = await env.FLAGS.get(idempotencyKey);
  if (alreadyRun) {
    console.warn(
      `[queue-consumer] Duplicate message skipped: ${id} (${message.type})`
    );
    msg.ack();
    return;
  }
  console.log(`[queue-consumer] Processing message: ${id} [Type: ${message.type}]`);
  try {
    if (Object.hasOwn(handlers, message.type)) {
      await handlers[message.type](message, env);
    } else {
      const unknownType = (message as { type: string }).type;
      console.warn(`[queue-consumer] Unknown job type received: ${unknownType}`);
    }
    await env.FLAGS.put(idempotencyKey, "success", {
      expirationTtl: 86400,
    });
    msg.ack();
  } catch (err) {
    console.error(`[queue-consumer] Error processing message ${id}:`, err);
    msg.retry();
  }
}

export default {
  async queue(
    batch: MessageBatch<QueueJobMessage>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    console.log(
      `[queue-consumer] Processing batch of ${batch.messages.length} messages`
    );
    for (const msg of batch.messages) {
      await processMessage(msg, env);
    }
  },
};
