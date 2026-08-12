import { describe, it, expect } from "vitest";
import { AgentIntegrationSchema } from "../schemas/agent-integration";

describe("AgentIntegrationSchema", () => {
  const base = {
    id: "i1",
    workspaceId: "ws_1",
    provider: "trello" as const,
    displayName: "Marketing Trello",
    status: "connected" as const,
    credentialsRef: "secrets/abc",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("accepts a valid integration", () => {
    const r = AgentIntegrationSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.scopes).toEqual([]);
      expect(r.data.enabledTools).toEqual([]);
      expect(r.data.connectedAt).toBeNull();
      expect(r.data.disconnectedAt).toBeNull();
    }
  });

  it("rejects unsupported provider", () => {
    const r = AgentIntegrationSchema.safeParse({ ...base, provider: "discord" });
    expect(r.success).toBe(false);
  });

  it("rejects empty displayName", () => {
    const r = AgentIntegrationSchema.safeParse({ ...base, displayName: "" });
    expect(r.success).toBe(false);
  });
});
