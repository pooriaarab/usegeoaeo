import { describe, it, expect } from "vitest";
import { AgentSchema } from "../schemas/agent";

describe("AgentSchema", () => {
  const base = {
    id: "a1",
    workspaceId: "ws_1",
    name: "AI Chat",
    model: "claude-opus-4-7",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("accepts a minimal valid agent", () => {
    const r = AgentSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.description).toBe("");
      expect(r.data.systemPrompt).toBe("");
      expect(r.data.isDefaultAiChat).toBe(false);
      expect(r.data.toolAllowlist).toEqual([]);
      expect(r.data.lastUsedAt).toBeNull();
      expect(r.data.archivedAt).toBeNull();
    }
  });

  it("rejects empty name", () => {
    const r = AgentSchema.safeParse({ ...base, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing workspaceId", () => {
    const { workspaceId: _, ...rest } = base;
    void _;
    const r = AgentSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("accepts toolAllowlist of strings", () => {
    const r = AgentSchema.safeParse({
      ...base,
      toolAllowlist: ["search", "create_task"],
    });
    expect(r.success).toBe(true);
  });

  it("defaults publicKey to null and publicEnabled to false", () => {
    const r = AgentSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.publicKey).toBeNull();
      expect(r.data.publicEnabled).toBe(false);
    }
  });

  it("accepts a publicKey string and publicEnabled true", () => {
    const r = AgentSchema.safeParse({
      ...base,
      publicKey: "pk_abcdef0123456789",
      publicEnabled: true,
    });
    expect(r.success).toBe(true);
  });
});
