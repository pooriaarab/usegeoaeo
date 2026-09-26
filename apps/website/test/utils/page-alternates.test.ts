import { describe, expect, it } from "vitest";

import { pageAlternates } from "../../src/utils/page-alternates";

describe("pageAlternates", () => {
  it("sets the canonical to the page's own path", () => {
    expect(pageAlternates("/docs/cli").canonical).toBe("/docs/cli");
  });

  it("self-references en and x-default hreflang at the same path", () => {
    const { languages } = pageAlternates("/checklist");
    expect(languages).toEqual({
      en: "/checklist",
      "x-default": "/checklist",
    });
  });
});
