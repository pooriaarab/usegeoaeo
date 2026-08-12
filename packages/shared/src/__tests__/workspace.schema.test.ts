import { describe, it, expect } from "vitest";
import { WorkspaceSchema } from "../schemas/workspace";

describe("WorkspaceSchema", () => {
  it("accepts a valid workspace", () => {
    const r = WorkspaceSchema.safeParse({
      id: "abc",
      ownerId: "user_1",
      name: "Default",
      createdAt: new Date(),
      onboardingCompleteAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty name", () => {
    const r = WorkspaceSchema.safeParse({
      id: "abc",
      ownerId: "user_1",
      name: "",
      createdAt: new Date(),
      onboardingCompleteAt: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing ownerId", () => {
    const r = WorkspaceSchema.safeParse({
      id: "abc",
      name: "Default",
      createdAt: new Date(),
      onboardingCompleteAt: null,
    });
    expect(r.success).toBe(false);
  });
});
