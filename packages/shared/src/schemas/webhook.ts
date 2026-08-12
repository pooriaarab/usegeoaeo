import { z } from "zod";

export const WebhookEventTypes = [
  "thread.message.created",
  "thread.created",
  "thread.archived",
] as const;

export const WebhookEventSchema = z.enum(WebhookEventTypes);
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const WebhookSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  url: z.string().url(),
  secret: z.string().min(1),
  events: z.array(WebhookEventSchema).min(1),
  enabled: z.boolean().default(true),
  lastDeliveredAt: z.date().nullable().default(null),
  lastFailureAt: z.date().nullable().default(null),
  failureCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Webhook = z.infer<typeof WebhookSchema>;

/**
 * Webhook shape returned by list/detail endpoints. Strips the shared secret so
 * it never leaves Firestore after the initial create response.
 */
export type WebhookPublic = Omit<Webhook, "secret">;
