import { describe, it, expect } from "vitest";
import { ToolSchema } from "../schemas/tool";

describe("ToolSchema", () => {
  it("accepts a builtin tool", () => {
    const r = ToolSchema.safeParse({
      id: "t1",
      workspaceId: "ws_1",
      name: "web_fetch",
      description: "Fetch a URL",
      inputSchema: { type: "object", properties: { url: { type: "string" } } },
      kind: "builtin",
      integrationId: null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts an integration-backed tool with integrationId", () => {
    const r = ToolSchema.safeParse({
      id: "t1",
      workspaceId: "ws_1",
      name: "trello.create_card",
      description: "",
      inputSchema: {},
      kind: "integration",
      integrationId: "i1",
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("applies defaults for description, integrationId, enabled, inputSchema", () => {
    const r = ToolSchema.parse({
      id: "t1",
      workspaceId: "ws_1",
      name: "x",
      kind: "builtin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.description).toBe("");
    expect(r.integrationId).toBe(null);
    expect(r.enabled).toBe(true);
    expect(r.inputSchema).toEqual({});
  });

  it("rejects empty workspaceId or name", () => {
    const r = ToolSchema.safeParse({
      id: "t1",
      workspaceId: "",
      name: "",
      kind: "builtin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });
});
