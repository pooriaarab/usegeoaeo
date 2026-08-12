import { describe, it, expect } from "vitest";
import {
  ThreadSchema,
  MessageSchema,
  ActorSchema,
  ThreadVisibilitySchema,
} from "../schemas/thread";

describe("ActorSchema", () => {
  it("accepts admin/member/visitor", () => {
    expect(ActorSchema.safeParse("admin").success).toBe(true);
    expect(ActorSchema.safeParse("member").success).toBe(true);
    expect(ActorSchema.safeParse("visitor").success).toBe(true);
  });

  it("rejects unknown actor", () => {
    expect(ActorSchema.safeParse("guest").success).toBe(false);
  });
});

describe("ThreadVisibilitySchema", () => {
  it("accepts internal/public", () => {
    expect(ThreadVisibilitySchema.safeParse("internal").success).toBe(true);
    expect(ThreadVisibilitySchema.safeParse("public").success).toBe(true);
  });
});

describe("ThreadSchema", () => {
  const base = {
    id: "t1",
    workspaceId: "ws",
    agentId: "a1",
    actor: "admin" as const,
    actorId: "u1",
    visibility: "internal" as const,
    title: "",
    status: "open" as const,
    messageCount: 0,
    metadata: {},
    lastMessageAt: null,
    archivedAt: null,
    createdAt: new Date(),
  };

  it("accepts a valid internal admin thread", () => {
    const r = ThreadSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rejects invalid actor", () => {
    const r = ThreadSchema.safeParse({ ...base, actor: "guest" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const r = ThreadSchema.safeParse({ ...base, status: "bogus" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid visibility", () => {
    const r = ThreadSchema.safeParse({ ...base, visibility: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejects negative messageCount", () => {
    const r = ThreadSchema.safeParse({ ...base, messageCount: -1 });
    expect(r.success).toBe(false);
  });
});

describe("MessageSchema", () => {
  const base = {
    id: "m1",
    threadId: "t1",
    workspaceId: "ws",
    agentId: "a1",
    role: "user" as const,
    content: "hi",
    toolCalls: [],
    model: null,
    usage: null,
    parentId: null,
    createdAt: new Date(),
  };

  it("accepts a valid user message with workspaceId denormalised", () => {
    const r = MessageSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("accepts assistant message with usage stats", () => {
    const r = MessageSchema.safeParse({
      ...base,
      role: "assistant",
      content: "hello",
      model: "claude-opus-4-7",
      usage: { inputTokens: 10, outputTokens: 5 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown role", () => {
    const r = MessageSchema.safeParse({ ...base, role: "bot" });
    expect(r.success).toBe(false);
  });

  it("rejects missing workspaceId", () => {
    const { workspaceId: _, ...rest } = base;
    void _;
    const r = MessageSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});
