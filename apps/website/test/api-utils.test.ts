import { describe, expect, it } from "vitest";

import { roleSatisfies } from "@/lib/api-utils";

describe("roleSatisfies", () => {
  it("owner satisfies admin", () => {
    expect(roleSatisfies("owner", "admin")).toBe(true);
  });
  it("member does not satisfy admin", () => {
    expect(roleSatisfies("member", "admin")).toBe(false);
  });
  it("admin satisfies member", () => {
    expect(roleSatisfies("admin", "member")).toBe(true);
  });
});
