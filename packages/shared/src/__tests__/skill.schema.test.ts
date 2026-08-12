import { describe, it, expect } from "vitest";
import { SkillSchema } from "../schemas/skill";

describe("SkillSchema", () => {
  it("accepts a valid skill", () => {
    const r = SkillSchema.safeParse({
      id: "s1",
      workspaceId: "ws_1",
      agentId: "a1",
      name: "Format outputs",
      description: "Always reply in Markdown",
      body: "Reply in well-formatted Markdown.",
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("applies sane defaults for description + enabled", () => {
    const r = SkillSchema.parse({
      id: "s1",
      workspaceId: "ws_1",
      agentId: "a1",
      name: "S",
      body: "do x",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.description).toBe("");
    expect(r.enabled).toBe(true);
  });

  it("rejects empty workspaceId or name", () => {
    const r = SkillSchema.safeParse({
      id: "s1",
      workspaceId: "",
      agentId: "a1",
      name: "",
      body: "x",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });
});
