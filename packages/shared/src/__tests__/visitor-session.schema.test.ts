import { describe, it, expect } from "vitest";
import {
  VisitorSessionSchema,
  VISITOR_MESSAGE_LIMIT,
  VISITOR_TOKEN_LIMIT,
} from "../schemas/visitor-session";

describe("VisitorSessionSchema", () => {
  const now = new Date();
  const base = {
    id: "vs_1",
    agentId: "a_1",
    workspaceId: "ws_1",
    firstSeenAt: now,
    lastSeenAt: now,
  };

  it("accepts a minimal session and applies defaults", () => {
    const r = VisitorSessionSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.messageCount).toBe(0);
      expect(r.data.tokenUsage).toBe(0);
      expect(r.data.captchaPassedAt).toBeNull();
      expect(r.data.ip).toBe("");
      expect(r.data.userAgent).toBe("");
      expect(r.data.country).toBe("");
    }
  });

  it("rejects missing agentId or workspaceId", () => {
    expect(
      VisitorSessionSchema.safeParse({ ...base, agentId: "" }).success,
    ).toBe(false);
    expect(
      VisitorSessionSchema.safeParse({ ...base, workspaceId: "" }).success,
    ).toBe(false);
  });

  it("rejects negative counters", () => {
    expect(
      VisitorSessionSchema.safeParse({ ...base, messageCount: -1 }).success,
    ).toBe(false);
    expect(
      VisitorSessionSchema.safeParse({ ...base, tokenUsage: -1 }).success,
    ).toBe(false);
  });

  it("exposes hard-ceiling constants", () => {
    expect(VISITOR_MESSAGE_LIMIT).toBeGreaterThan(0);
    expect(VISITOR_TOKEN_LIMIT).toBeGreaterThan(0);
  });
});
