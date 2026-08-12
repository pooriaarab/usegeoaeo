import { z } from "zod";

/**
 * Skill schema.
 *
 * Skills are per-agent prompt augmentations. At run time, the agent's
 * enabled skills are concatenated under a `# Skills` section and
 * appended to the system prompt by `buildAugmentedSystemPrompt`
 * (see apps/web/src/lib/agent-core/skill-executor.ts).
 *
 * Stored in the workspace-scoped `agent_skills` collection. Both
 * `workspaceId` and `agentId` are denormalised so Firestore rules can
 * authorise reads with a single membership check.
 */
export const SkillSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  body: z.string(),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Skill = z.infer<typeof SkillSchema>;
