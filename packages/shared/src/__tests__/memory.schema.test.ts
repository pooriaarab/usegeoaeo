import { describe, it, expect } from "vitest";
import { MemorySchema } from "../schemas/memory";

describe("MemorySchema", () => {
  const base = {
    id: "m1",
    workspaceId: "ws_1",
    agentId: "a_1",
    key: "user.preference.timezone",
    value: { tz: "America/Los_Angeles" },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("accepts a valid memory entry with defaults", () => {
    const r = MemorySchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.embedding).toBeNull();
      expect(r.data.expiresAt).toBeNull();
    }
  });

  it("accepts an embedding vector", () => {
    const r = MemorySchema.safeParse({
      ...base,
      embedding: [0.1, 0.2, 0.3],
    });
    expect(r.success).toBe(true);
  });

  it("rejects an empty key", () => {
    const r = MemorySchema.safeParse({ ...base, key: "" });
    expect(r.success).toBe(false);
  });

  it("rejects an oversized key", () => {
    const r = MemorySchema.safeParse({ ...base, key: "x".repeat(201) });
    expect(r.success).toBe(false);
  });

  it("rejects missing workspaceId", () => {
    const r = MemorySchema.safeParse({ ...base, workspaceId: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing agentId", () => {
    const r = MemorySchema.safeParse({ ...base, agentId: "" });
    expect(r.success).toBe(false);
  });
});
