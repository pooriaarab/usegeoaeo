import { z } from "zod";

/**
 * A per-agent memory entry. Stored in the `agent_memory` collection.
 *
 * - `key` is the canonical lookup string for `MemoryStore.get(...)`. Keys are
 *   unique per (workspaceId, agentId).
 * - `value` is arbitrary JSON the agent decided to remember.
 * - `embedding` is reserved for future vector-based similarity search; left
 *   nullable so a swap-in vector backend doesn't require a schema migration.
 * - `expiresAt` is optional; readers should filter out expired entries.
 *   Auto-deletion is out of scope for Phase 1B.
 */
export const MemorySchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  key: z.string().min(1).max(200),
  value: z.record(z.string(), z.unknown()),
  embedding: z.array(z.number()).nullable().default(null),
  expiresAt: z.date().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Memory = z.infer<typeof MemorySchema>;
