import { describe, it, expect } from "vitest";
import { UploadSchema, MAX_UPLOAD_BYTES } from "../schemas/upload";

describe("UploadSchema", () => {
  it("accepts a complete upload doc", () => {
    const r = UploadSchema.safeParse({
      id: "up_1",
      workspaceId: "ws_1",
      ownerId: "u_1",
      filename: "report.pdf",
      contentType: "application/pdf",
      size: 1024,
      path: "workspaces/ws_1/uploads/up_1/report.pdf",
      createdAt: new Date(),
      readyAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects size > 100MB", () => {
    const r = UploadSchema.safeParse({
      id: "up_1",
      workspaceId: "ws_1",
      ownerId: "u_1",
      filename: "huge.bin",
      contentType: "application/octet-stream",
      size: MAX_UPLOAD_BYTES + 1,
      path: "workspaces/ws_1/uploads/up_1/huge.bin",
      createdAt: new Date(),
      readyAt: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty filename", () => {
    const r = UploadSchema.safeParse({
      id: "up_1",
      workspaceId: "ws_1",
      ownerId: "u_1",
      filename: "",
      contentType: "application/pdf",
      size: 1024,
      path: "workspaces/ws_1/uploads/up_1/",
      createdAt: new Date(),
      readyAt: null,
    });
    expect(r.success).toBe(false);
  });

  it("accepts a ready upload with readyAt set", () => {
    const r = UploadSchema.safeParse({
      id: "up_2",
      workspaceId: "ws_1",
      ownerId: "u_1",
      filename: "image.png",
      contentType: "image/png",
      size: 4096,
      path: "workspaces/ws_1/uploads/up_2/image.png",
      createdAt: new Date(),
      readyAt: new Date(),
    });
    expect(r.success).toBe(true);
  });
});
