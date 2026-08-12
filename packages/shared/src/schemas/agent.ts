import { z } from "zod";

export const AgentSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  model: z.string(),
  systemPrompt: z.string().default(""),
  isDefaultAiChat: z.boolean().default(false),
  toolAllowlist: z.array(z.string()).default([]),
  /**
   * Phase 2.2: per-agent secret used to authorise visitor (public-widget)
   * traffic. Stored on the agent doc; rotatable via the dashboard's
   * "Public widget" tab. Visitor API requests must echo it; the server
   * validates against this value before any visitor thread operation.
   */
  publicKey: z.string().min(8).nullable().default(null),
  /**
   * Phase 2.2: gate that controls whether the visitor widget can create
   * threads against this agent. Disabled by default — admins must opt in
   * after generating a publicKey.
   */
  publicEnabled: z.boolean().default(false),
  lastUsedAt: z.date().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date().nullable().default(null),
});

export type Agent = z.infer<typeof AgentSchema>;
