import { z } from "zod";

/**
 * Tool schema.
 *
 * Tools live at the workspace level — the same tool may be allowlisted
 * on multiple agents. Agents reference tools by `name` via
 * `Agent.toolAllowlist`. Two kinds are supported in Plan 1.B.β:
 *
 * - `builtin`: server-implemented (e.g., `web_fetch`). Dispatched by
 *   `apps/web/src/lib/agent-core/builtin-tools.ts`.
 * - `integration`: backed by an `agent_integrations` doc. The
 *   integration adapter framework is deferred — this kind is rejected
 *   by the dispatcher in β with a structured error.
 *
 * Stored in the workspace-scoped `tools` collection.
 */
export const ToolKindSchema = z.enum(["builtin", "integration"]);
export type ToolKind = z.infer<typeof ToolKindSchema>;

export const ToolSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  inputSchema: z.record(z.string(), z.unknown()).default({}),
  kind: ToolKindSchema,
  integrationId: z.string().nullable().default(null),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tool = z.infer<typeof ToolSchema>;
