import { Item } from "./checklist-item";

/** Checklist sections 5-12: the surfaces an engine reads once it can fetch. */

export function MarkdownMirrorsSection() {
  return (
    <section id="markdown-mirrors" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        5. Markdown mirrors
      </h2>
      <Item
        id="md-twins"
        title="5.1 .md twin of key pages"
        why="Many agents prefer Markdown. A clean /pricing.md (or framework route that serves Markdown) is easier to quote than a heavy HTML document."
        covers={[
          "Audit check markdown looks for local *.md mirrors (excluding README-like names) or, for live URLs, successful fetch of {page}.md.",
          "Weight 6.",
        ]}
        gaps="gen does not emit per-page Markdown mirrors. init focuses on artifact routes/files, not a full MD mirror tree. No parity check (HTML vs MD content)."
      />
    </section>
  );
}

export function WebmcpSection() {
  return (
    <section id="webmcp" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        6. WebMCP
      </h2>
      <Item
        id="webmcp-manifest"
        title="6.1 Tool manifest for agents"
        why="Discovery is not enough. Agents need a declared tool surface (names, descriptions, entry URLs) so they can act, not only cite."
        covers={[
          "geoaeo gen webmcp from config tools.",
          "Audit check webmcp accepts webmcp.json / webmcp artifacts or routes with a tools manifest shape (weight 8).",
          "MCP server geoaeo-mcp exposes geoaeo’s own tools (audit, gen, humanize) to coding agents; that is separate from the site’s WebMCP artifact.",
        ]}
        gaps="No runtime WebMCP protocol server for the target app, no auth-scoped tooling, no live probe that tools respond."
      />
    </section>
  );
}

export function AnswerabilitySection() {
  return (
    <section id="answerability" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        7. Answerability
      </h2>
      <Item
        id="answer-first"
        title="7.1 Answer-first page design"
        why="Models extract the first clear answer. Buried ledes and pure marketing hero copy lose the citation."
        covers={[
          "Audit answer-first (weight 11): H1 present and an early FAQ signal in the first slice of visible/source text.",
          "Config-driven FAQ content feeds llms-full and FAQ JSON-LD so answers exist as data.",
        ]}
        gaps="No question inventory against real SERP/answer-engine prompts, no “direct answer in first 100 words” scorer beyond the FAQ heuristic, no LLM-as-judge."
      />
      <Item
        id="qa-framing"
        title="7.2 Q&A framing in prose"
        why="Pages that state the question the user would ask, then answer it in plain language, get quoted more often than feature grids alone."
        covers={[
          "Encouraged via FAQ config + generators.",
          "geoaeo humanize strips common AI-writing tells (em dashes, hype, filler, fake-depth tails, title-case headings) so answers read like durable documentation.",
        ]}
        gaps="No template library of answer blocks, no readability grade gate in audit."
      />
    </section>
  );
}

export function CitabilitySection() {
  return (
    <section id="citability" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        8. Citability
      </h2>
      <Item
        id="canonical"
        title="8.1 Canonical URLs"
        why="Duplicate hosts and parameter variants split citations. Canonical tags point engines at the URL you want quoted."
        covers={["Audit canonical (weight 6), all inspected pages."]}
        gaps="No absolute-vs-relative canonical normalization check, no cross-host mismatch detection against siteUrl."
      />
      <Item
        id="freshness"
        title="8.2 Freshness dates"
        why="Answer engines prefer recency when facts change (pricing, limits, API behavior). Visible Updated dates and matching metadata reduce stale quotes."
        covered={false}
        covers={[]}
        gaps="No dateModified / datePublished audit, no generator field for per-page updated-at, no sitemap lastmod enforcement beyond whatever you put in config-driven output. TODO(v0.3): not built. Freshness dates in audit + sitemap lastmod from config."
      />
      <Item
        id="eeat"
        title="8.3 Author identity and E-E-A-T signals"
        why="Experience, expertise, authoritativeness, and trust affect whether a system treats your page as a source worth citing, especially for YMYL-adjacent topics."
        covered={false}
        covers={[]}
        gaps="No Person / Organization JSON-LD, no author page checks, no review/credential fields in config. TODO(v0.3): not built. E-E-A-T / author structured data."
      />
      <Item
        id="quotable-facts"
        title="8.4 Quotable factual sentences"
        why="Models lift short, self-contained facts. Vague brand language is hard to cite without hallucination."
        covers={[
          "Indirectly: FAQ answers in config, llms-full long-form map, humanize for cleaner prose.",
        ]}
        gaps="No claim-extraction linter, no “one fact per sentence” scorer."
      />
    </section>
  );
}

export function SitemapRobotsSection() {
  return (
    <section id="sitemap-robots" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        9. Sitemap and robots
      </h2>
      <Item
        id="xml-sitemap"
        title="9.1 XML sitemap"
        why="Sitemaps enumerate the URLs you consider canonical. Audit also uses the live sitemap to choose extra pages to fetch."
        covers={["geoaeo gen sitemap", "Audit sitemap (weight 10)"]}
        gaps="No sitemap index for very large sites, no hreflang entries inside the sitemap, no automated submission to search consoles."
      />
      <Item
        id="robots-sitemap"
        title="9.2 Robots with sitemap pointer"
        why="Robots.txt is the well-known policy file; pointing at the sitemap speeds discovery."
        covers={[
          "geoaeo gen robots",
          "Audit robots (weight 8) requires both a user-agent policy signal and a sitemap reference.",
        ]}
        gaps="No sitemap index for very large sites, no hreflang entries inside the sitemap, no automated submission to search consoles."
      />
    </section>
  );
}

export function OpenGraphSection() {
  return (
    <section id="open-graph" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        10. Open Graph and social previews
      </h2>
      <Item
        id="og-tags"
        title="10.1 Open Graph tags"
        why="OG tags control link previews. They also supply clean title/description fallbacks for non-HTML consumers."
        covers={[
          "Audit open-graph (weight 5): passes when any inspected page has at least two og:* meta properties (HTML) or common OG source patterns (framework files).",
        ]}
        gaps="No image dimension checks, no gen for OG images, no platform-by-platform preview simulator. Social checks are any-page, not all-page, unlike title and description."
      />
      <Item
        id="twitter-tags"
        title="10.2 Twitter/X card tags"
        why="Separate preview pipeline from OG; still widely unfurled."
        covers={[
          "Audit twitter (weight 4): at least one twitter:* tag or common source pattern on any inspected page.",
        ]}
        gaps="No image dimension checks, no gen for OG images, no platform-by-platform preview simulator."
      />
    </section>
  );
}

export function I18nSection() {
  return (
    <section id="i18n" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        11. Internationalization and hreflang
      </h2>
      <Item
        id="hreflang"
        title="11.1 Locale-clear URLs and hreflang"
        why="Wrong-locale citations confuse users and dilute the canonical you want. hreflang (HTML or sitemap) tells engines which language/region variant to prefer."
        covered={false}
        covers={[]}
        gaps="No hreflang audit, no locale fields in geoaeo.config.ts, no per-locale llms.txt, no translated FAQ generation. TODO(v0.3): not built. i18n / hreflang."
      />
    </section>
  );
}

export function ProseSection() {
  return (
    <section id="prose" className="scroll-mt-24 mb-12 space-y-6">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        12. Prose quality for citation
      </h2>
      <Item
        id="humanize"
        title="12.1 Human, specific, non-hype copy"
        why="Over-polished AI tone reduces trust when a human verifies a citation. Specific product language survives quotation better than generic superlatives."
        covers={[
          "geoaeo humanize <glob> --check / --write",
          "MCP + library humanize",
          "Preserves frontmatter, code fences, JSX structure; flags em dashes, AI vocabulary, filler, hype, fake-depth tails, title-case headings",
        ]}
        gaps="Humanize is not part of the numeric audit score. No glossary or banned-claim list per brand."
      />
    </section>
  );
}
