import { describe, it, expect } from "vitest";
import {
  WorkspaceMemberSchema,
  workspaceMemberDocId,
} from "../schemas/workspace-member";

const validBase = {
  id: "ws_1_user_1",
  workspaceId: "ws_1",
  userId: "user_1",
  role: "owner" as const,
  invitedBy: null,
  joinedAt: new Date(),
  status: "active" as const,
  email: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("WorkspaceMemberSchema", () => {
  it("accepts a valid owner member", () => {
    const r = WorkspaceMemberSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("accepts pending invite without joinedAt", () => {
    const r = WorkspaceMemberSchema.safeParse({
      ...validBase,
      role: "member",
      status: "pending",
      joinedAt: null,
      invitedBy: "user_1",
      email: "invitee@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown role", () => {
    const r = WorkspaceMemberSchema.safeParse({
      ...validBase,
      role: "viewer",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown status", () => {
    const r = WorkspaceMemberSchema.safeParse({
      ...validBase,
      status: "archived",
    });
    expect(r.success).toBe(false);
  });

  it("rejects malformed email", () => {
    const r = WorkspaceMemberSchema.safeParse({
      ...validBase,
      email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });
});

describe("workspaceMemberDocId", () => {
  it("uses the deterministic underscore form", () => {
    expect(workspaceMemberDocId("ws_1", "user_1")).toBe("ws_1_user_1");
  });
});
