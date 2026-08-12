import { z } from "zod";

/**
 * Thread + Message schemas.
 *
 * Threads are workspace-scoped conversations between an actor (admin/member
 * /visitor) and an agent. Phase 1 only emits `admin|member` threads with
 * `internal` visibility; `visitor` + `public` are reserved for Phase 2.2
 * (visitor-facing chat widget).
 *
 * Messages live in a `messages` subcollection on each thread. `workspaceId`
 * is denormalised onto each message so Firestore rules can authorise reads
 * without a parent `get()` per access (per design D12).
 */

export const ActorSchema = z.enum(["admin", "member", "visitor"]);
export type Actor = z.infer<typeof ActorSchema>;

export const ThreadVisibilitySchema = z.enum(["internal", "public"]);
export type ThreadVisibility = z.infer<typeof ThreadVisibilitySchema>;

export const ThreadStatusSchema = z.enum(["open", "archived"]);
export type ThreadStatus = z.infer<typeof ThreadStatusSchema>;

export const ThreadSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  actor: ActorSchema,
  actorId: z.string().min(1),
  visibility: ThreadVisibilitySchema.default("internal"),
  title: z.string().max(200).default(""),
  status: ThreadStatusSchema.default("open"),
  messageCount: z.number().int().nonnegative().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
  lastMessageAt: z.date().nullable().default(null),
  archivedAt: z.date().nullable().default(null),
  createdAt: z.date(),
});
export type Thread = z.infer<typeof ThreadSchema>;

export const MessageRoleSchema = z.enum([
  "user",
  "assistant",
  "tool",
  "system",
]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
});
export type MessageUsage = z.infer<typeof MessageUsageSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  threadId: z.string().min(1),
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  role: MessageRoleSchema,
  content: z.string(),
  toolCalls: z.array(z.unknown()).default([]),
  model: z.string().nullable().default(null),
  usage: MessageUsageSchema.nullable().default(null),
  parentId: z.string().nullable().default(null),
  createdAt: z.date(),
});
export type Message = z.infer<typeof MessageSchema>;
