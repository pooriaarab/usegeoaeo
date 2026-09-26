export interface QueueMessageContract<Type extends string = string, Payload = unknown> {
  type: Type;
  id: string; // Used as the required idempotency key field (e.g., UUID or CUID)
  payload: Payload;
  createdAt: string;
}

export interface EmailSendPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface JobDemoPayload {
  message: string;
}

export interface OutboxDrainPayload {
  [key: string]: unknown;
}

export type EmailSendJob = QueueMessageContract<"email.send", EmailSendPayload>;
export type JobDemoJob = QueueMessageContract<"job.demo", JobDemoPayload>;
export type OutboxDrainJob = QueueMessageContract<"outbox.drain", OutboxDrainPayload>;

export type QueueJobMessage = EmailSendJob | JobDemoJob | OutboxDrainJob;

/**
 * Enqueues a message to a Cloudflare Queue, ensuring that the idempotency key (message.id) is present.
 */
export async function sendJob(
  queue: Queue<QueueJobMessage>,
  message: QueueJobMessage,
): Promise<void> {
  if (!message.id) {
    throw new Error("Idempotency key 'id' is required for all queue messages.");
  }
  await queue.send(message);
}
