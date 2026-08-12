import { describe, it, expect } from "vitest";
import { WebhookSchema, WebhookEventTypes } from "../schemas/webhook";

describe("WebhookSchema", () => {
  const base = {
    id: "wh_1",
    workspaceId: "ws_1",
    agentId: "a1",
    url: "https://example.com/hooks",
    secret: "shh",
    events: ["thread.message.created" as const],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("accepts a valid webhook with defaults", () => {
    const r = WebhookSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.enabled).toBe(true);
      expect(r.data.lastDeliveredAt).toBeNull();
      expect(r.data.lastFailureAt).toBeNull();
      expect(r.data.failureCount).toBe(0);
    }
  });

  it("rejects an invalid url", () => {
    const r = WebhookSchema.safeParse({ ...base, url: "not-a-url" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown event", () => {
    const r = WebhookSchema.safeParse({
      ...base,
      events: ["thread.exploded"],
    });
    expect(r.success).toBe(false);
  });

  it("rejects an empty events array (must subscribe to at least one event)", () => {
    const r = WebhookSchema.safeParse({ ...base, events: [] });
    expect(r.success).toBe(false);
  });

  it("rejects negative failureCount", () => {
    const r = WebhookSchema.safeParse({ ...base, failureCount: -1 });
    expect(r.success).toBe(false);
  });

  it("exposes the canonical event type list", () => {
    expect(WebhookEventTypes).toEqual([
      "thread.message.created",
      "thread.created",
      "thread.archived",
    ]);
  });
});
