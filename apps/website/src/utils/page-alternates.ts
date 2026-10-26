import type { Metadata } from "next";

// Each page must declare its own canonical. If the root layout sets
// canonical: "/", every child inherits the home URL and search engines
// treat docs pages as duplicates. The site is English only, so en and
// x-default both point at the same path — do not invent other locales.
export function pageAlternates(path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: path,
    types: { "text/markdown": path === "/" ? "/index.md" : `${path}.md` },
    languages: {
      en: path,
      "x-default": path,
    },
  };
}

export function withAiSummary(metadata: Metadata): Metadata {
  return {
    ...metadata,
    other: Object.assign({}, metadata.other, { "ai-summary": metadata.description ?? "" }),
  };
}
