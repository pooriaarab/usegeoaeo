import { describe, expect, test } from "bun:test";
import { buildUploadKey, getPublicUrl } from "./index";

describe("Storage Helpers", () => {
  test("buildUploadKey generates correct key and cleans filename", () => {
    const key = buildUploadKey("user123", "upl555", "my file#name.jpg");
    expect(key).toBe("uploads/user123/upl555/my_file_name.jpg");
  });

  test("getPublicUrl returns correct route path", () => {
    const url = getPublicUrl("upl555");
    expect(url).toBe("/api/v1/uploads/upl555/content");
  });
});
