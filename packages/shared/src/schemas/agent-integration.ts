import { z } from "zod";

export const AgentIntegrationProviders = [
  "trello",
  "slack",
  "github",
  "linear",
  "notion",
  "custom",
] as const;

export const AgentIntegrationSchema = z.object({
  id: z.string(),
  workspaceId: z.string().min(1),
  provider: z.enum(AgentIntegrationProviders),
  displayName: z.string().min(1).max(120),
  status: z.enum(["connected", "disconnected", "error"]),
  credentialsRef: z.string(),
  scopes: z.array(z.string()).default([]),
  enabledTools: z.array(z.string()).default([]),
  connectedAt: z.date().nullable().default(null),
  disconnectedAt: z.date().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentIntegration = z.infer<typeof AgentIntegrationSchema>;
export type AgentIntegrationProvider =
  (typeof AgentIntegrationProviders)[number];
