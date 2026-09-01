import { describe, expect, it } from "vitest";

import { config } from "../middleware";

describe("middleware matcher", () => {
  it("still runs the middleware for favicon.ico and _next/image", () => {
    // Regression guard: these paths must stay covered so
    // protectWorkerPreview can harden them during Worker Previews.
    expect(config.matcher).not.toContain("favicon.ico");
    expect(config.matcher).not.toContain("_next/image");
  });

  it("excludes _next/static for performance", () => {
    expect(config.matcher).toContain("_next/static");
  });
});
