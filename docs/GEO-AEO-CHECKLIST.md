# GEO/AEO checklist

Canonical checklist for making an app discoverable and quotable by AI answer engines
and agents. Use it as the target state for any site. `geoaeo audit` maps to the items
marked **Covered**; items marked **Not covered yet** are product gaps, not implicit
features.

## How to use this document

1. Run `npx geoaeo audit <url-or-dir>` and read the score plus top fixes.
2. Close gaps with `geoaeo init`, `geoaeo gen <artifact>`, and content edits.
3. Re-audit until the remaining fails are intentional or tracked as product work.
4. Treat this checklist as the contract: if audit does not check it, do not assume geoaeo enforces it.

Real surface today:

| Face | Entry | Capabilities |
| --- | --- | --- |
| CLI | `geoaeo` | `audit`, `init`, `gen`, `humanize`, `mcp` |
| MCP | `geoaeo-mcp` (stdio) | tools `audit`, `gen`, `humanize` |
| Library | `import { … } from 'geoaeo'` | audit, generators, humanize, config |

Generators: `llms`, `llms-full`, `jsonld` (`software` \| `product` \| `faq` \| `breadcrumb`),
`webmcp`, `sitemap`, `robots`.

---

## 1. Crawlability

### 1.1 Public HTML that bots and fetchers can reach

**Why it matters.** Answer engines and crawlers need a stable HTTP response with real
content. Client-only shells with empty first HTML give them nothing to index or quote.

**How geoaeo covers it.**
- `geoaeo audit <url>` fetches the home page and up to four sitemap URLs.
- `geoaeo audit <dir>` walks local HTML and common framework page files (`page.tsx`,
  `layout.tsx`, `.html`).
- Audit does **not** execute JavaScript. If critical copy only appears after client
  render, the audit can pass structure checks while engines still see an empty body.

**Not covered yet.** No headless render, no SPA hydration check, no soft-404 detection.

### 1.2 No accidental block of AI or search crawlers

**Why it matters.** A `robots.txt` deny-all, auth wall, or IP block can hide the site from
the systems you want to cite you.

**How geoaeo covers it.**
- `geoaeo gen robots` emits a robots policy that includes a `Sitemap:` line from config
  and an `Allow: /` group for each named AI crawler.
- Audit check `robots` requires a robots artifact that mentions a user-agent policy and a
  sitemap URL.
- Audit check `ai-crawlers` parses the policy's user-agent groups and fails when a named
  AI crawler (GPTBot, ClaudeBot, PerplexityBot, and peers) is disallowed from `/`. A
  crawler with no block of its own inherits the `*` group.

**Not covered yet.** No AI-bot allowlist presets beyond the generator's fixed list, no
live robots negotiation beyond fetching `/robots.txt`.

### 1.3 Stable, linkable URLs

**Why it matters.** Citations need durable paths. Session IDs, unbounded query strings,
and rotating slugs break quotes and dilute authority.

**How geoaeo covers it.**
- Config-driven generators (`sitemap`, `llms`, `llms-full`, JSON-LD) use `siteUrl` and
  configured page/tool paths.
- Audit check `canonical` requires a canonical link on inspected pages.

**Not covered yet.** No redirect-chain audit, no query-parameter normalization, no
trailing-slash policy enforcement.

---

## 2. Semantic HTML

### 2.1 One clear H1 and heading hierarchy

**Why it matters.** Headings are the cheapest outline for both humans and models. A missing
H1 or a wall of same-level headings weakens answer extraction.

**How geoaeo covers it.**
- Audit `answer-first` requires an H1 on an inspected page (paired with an early FAQ
  signal).
- Audit does not score full heading order (H2 under H1, no skipped levels).

**Not covered yet.** No landmark/`main`/`article` checks, no heading-outline scorer, no
generator that rewrites page markup.

### 2.2 Meaningful titles and meta descriptions

**Why it matters.** Titles and descriptions are fallback snippets when models and social
unfurlers cannot build a better summary.

**How geoaeo covers it.**
- Audit checks `title` and `description` on every inspected page (all-pages pass rule).
- Works for HTML and for common Next-style metadata source patterns.

**Not covered yet.** No length or uniqueness scoring, no keyword stuffing detection, no
auto-write of titles from config.

### 2.3 Visible, extractable primary content

**Why it matters.** If the answer lives only in images, canvas, or late-loaded widgets,
engines cannot quote it reliably.

**How geoaeo covers it.**
- HTML audit path parses DOM text with Cheerio for FAQ-like early content signals.
- `geoaeo humanize` helps keep prose direct and less “AI-sounding,” which improves
  human trust when a model cites you. It does not invent missing answers.

**Not covered yet.** No alt-text audit, no OCR, no main-content density metric.

---

## 3. Structured data (JSON-LD)

### 3.1 Machine-readable entity types

**Why it matters.** schema.org JSON-LD gives engines typed facts (what the product is,
FAQ pairs, trail of pages) instead of guessing from prose.

**How geoaeo covers it.**
- `geoaeo gen jsonld --type software|product|faq|breadcrumb`
- Library helpers: `softwareApplicationJsonLd`, `productJsonLd`, `faqJsonLd`,
  `breadcrumbJsonLd`, `generateJsonLd`.
- Audit check `json-ld` passes when any inspected page exposes JSON-LD / `@type`; the
  report lists detected types when parseable.

**Supported kinds today**

| Kind | schema.org `@type` | Typical use |
| --- | --- | --- |
| `software` (default) | `SoftwareApplication` | SaaS / web app home |
| `product` | `Product` | Packaged product positioning |
| `faq` | `FAQPage` | Q&A pairs from config `faq` |
| `breadcrumb` | `BreadcrumbList` | Home (+ first tool when configured) |

**Not covered yet.** No `Organization`, `WebSite`, `Article`, `HowTo`, `Person`,
`SpeakableSpecification`, or validation against Google rich-result rules. Audit does not
require a specific type—only that some JSON-LD exists.

### 3.2 FAQ pairs as first-class data

**Why it matters.** Answer engines prefer explicit question → answer pairs. FAQ JSON-LD
plus visible FAQ copy is the highest-yield AEO pattern for product sites.

**How geoaeo covers it.**
- Config field `faq: { question, answer }[]`.
- `geoaeo gen jsonld --type faq` emits `FAQPage`.
- Audit `answer-first` looks for an early “FAQ” / “frequently asked questions” signal
  with an H1.

**Not covered yet.** No check that visible FAQ text matches JSON-LD, no multi-page FAQ
graph, no “People also ask” coverage analysis.

---

## 4. `llms.txt` and `llms-full.txt`

### 4.1 Short map (`/llms.txt`)

**Why it matters.** [llms.txt](https://llmstxt.org/) is an emerging convention: a small,
curated map so models can learn what the site is and which URLs matter without scraping
everything.

**How geoaeo covers it.**
- `geoaeo gen llms` and `geoaeo init` (static or Next route).
- Audit check `llms` (weight 10).

### 4.2 Long map (`/llms-full.txt`)

**Why it matters.** The full file carries deeper product facts, FAQs, and page lists for
agents that will read a larger context window.

**How geoaeo covers it.**
- `geoaeo gen llms-full`.
- Audit check `llms-full` (weight 10), including section-shape heuristics used by the
  generator.

**Not covered yet.** No automatic change-detection publish, no content-hash freshness
header, no multi-locale llms files.

---

## 5. Markdown mirrors

### 5.1 `.md` twin of key pages

**Why it matters.** Many agents prefer Markdown. A clean `/pricing.md` (or framework
route that serves Markdown) is easier to quote than a heavy HTML document.

**How geoaeo covers it.**
- Audit check `markdown` looks for local `*.md` mirrors (excluding README-like names) or,
  for live URLs, successful fetch of `{page}.md`.
- Weight 6.

**Not covered yet.** `gen` does not emit per-page Markdown mirrors. `init` focuses on
artifact routes/files, not a full MD mirror tree. No parity check (HTML vs MD content).

---

## 6. WebMCP

### 6.1 Tool manifest for agents

**Why it matters.** Discovery is not enough. Agents need a declared tool surface—names,
descriptions, entry URLs—so they can act, not only cite.

**How geoaeo covers it.**
- `geoaeo gen webmcp` from config `tools`.
- Audit check `webmcp` accepts `webmcp.json` / `webmcp` artifacts or routes with a tools
  manifest shape (weight 8).
- MCP server `geoaeo-mcp` exposes geoaeo’s own tools (`audit`, `gen`, `humanize`) to
  coding agents; that is separate from the site’s WebMCP artifact.

**Not covered yet.** No runtime WebMCP protocol server for the target app, no auth-scoped
tooling, no live probe that tools respond.

---

## 7. Answerability

### 7.1 Answer-first page design

**Why it matters.** Models extract the first clear answer. Buried ledes and pure marketing
hero copy lose the citation.

**How geoaeo covers it.**
- Audit `answer-first` (weight 11): H1 present and an early FAQ signal in the first slice
  of visible/source text.
- Config-driven FAQ content feeds `llms-full` and FAQ JSON-LD so answers exist as data.

**Not covered yet.** No question inventory against real SERP/answer-engine prompts, no
“direct answer in first 100 words” scorer beyond the FAQ heuristic, no LLM-as-judge
(see `docs/ENHANCEMENTS.md`).

### 7.2 Q&A framing in prose

**Why it matters.** Pages that state the question the user would ask, then answer it in
plain language, get quoted more often than feature grids alone.

**How geoaeo covers it.**
- Encouraged via FAQ config + generators.
- `geoaeo humanize` strips common AI-writing tells (em dashes, hype, filler, fake-depth
  tails, title-case headings) so answers read like durable documentation.

**Not covered yet.** No template library of answer blocks, no readability grade gate in
audit.

---

## 8. Citability

### 8.1 Canonical URLs

**Why it matters.** Duplicate hosts and parameter variants split citations. Canonical
tags point engines at the URL you want quoted.

**How geoaeo covers it.**
- Audit `canonical` (weight 6), all inspected pages.

**Not covered yet.** No absolute-vs-relative canonical normalization check, no cross-host
mismatch detection against `siteUrl`.

### 8.2 Freshness dates

**Why it matters.** Answer engines prefer recency when facts change (pricing, limits,
API behavior). Visible “Updated” dates and matching metadata reduce stale quotes.

**How geoaeo covers it.**
- **Not covered yet.** No `dateModified` / `datePublished` audit, no generator field for
  per-page updated-at, no sitemap `<lastmod>` enforcement beyond whatever you put in
  config-driven output.

<!-- TODO(v0.3): not built — freshness dates in audit + sitemap lastmod from config -->

### 8.3 Author identity and E-E-A-T signals

**Why it matters.** Experience, expertise, authoritativeness, and trust affect whether a
system treats your page as a source worth citing—especially for YMYL-adjacent topics.

**How geoaeo covers it.**
- **Not covered yet.** No `Person` / `Organization` JSON-LD, no author page checks, no
  review/credential fields in config.

<!-- TODO(v0.3): not built — E-E-A-T / author structured data -->

### 8.4 Quotable factual sentences

**Why it matters.** Models lift short, self-contained facts. Vague brand language is hard
to cite without hallucination.

**How geoaeo covers it.**
- Indirectly: FAQ answers in config, `llms-full` long-form map, `humanize` for cleaner
  prose.

**Not covered yet.** No claim-extraction linter, no “one fact per sentence” scorer.

---

## 9. Sitemap and robots

### 9.1 XML sitemap

**Why it matters.** Sitemaps enumerate the URLs you consider canonical. Audit also uses
the live sitemap to choose extra pages to fetch.

**How geoaeo covers it.**
- `geoaeo gen sitemap`
- Audit `sitemap` (weight 10)

### 9.2 Robots with sitemap pointer

**Why it matters.** Robots.txt is the well-known policy file; pointing at the sitemap
speeds discovery.

**How geoaeo covers it.**
- `geoaeo gen robots`
- Audit `robots` (weight 1) requires both a user-agent policy signal and a sitemap
  reference. Whether the policy actually admits AI crawlers is `ai-crawlers` (§1.2).

**Not covered yet.** No sitemap index for very large sites, no hreflang entries inside
the sitemap, no automated submission to search consoles.

---

## 10. Open Graph and social previews

### 10.1 Open Graph tags

**Why it matters.** OG tags control link previews. They also supply clean title/description
fallbacks for non-HTML consumers.

**How geoaeo covers it.**
- Audit `open-graph` (weight 5): passes when any inspected page has at least two
  `og:*` meta properties (HTML) or common OG source patterns (framework files).

### 10.2 Twitter/X card tags

**Why it matters.** Separate preview pipeline from OG; still widely unfurled.

**How geoaeo covers it.**
- Audit `twitter` (weight 4): at least one `twitter:*` tag or common source pattern on
  any inspected page.

**Not covered yet.** No image dimension checks, no `gen` for OG images, no platform-by-
platform preview simulator. Social checks are any-page, not all-page, unlike title and
description.

---

## 11. Internationalization and hreflang

### 11.1 Locale-clear URLs and hreflang

**Why it matters.** Wrong-locale citations confuse users and dilute the canonical you
want. `hreflang` (HTML or sitemap) tells engines which language/region variant to prefer.

**How geoaeo covers it.**
- **Not covered yet.** No hreflang audit, no locale fields in `geoaeo.config.ts`, no
  per-locale `llms.txt`, no translated FAQ generation.

<!-- TODO(v0.3): not built — i18n / hreflang -->

---

## 12. Prose quality for citation

### 12.1 Human, specific, non-hype copy

**Why it matters.** Over-polished AI tone reduces trust when a human verifies a citation.
Specific product language survives quotation better than generic superlatives.

**How geoaeo covers it.**
- `geoaeo humanize <glob> --check` / `--write`
- MCP + library `humanize`
- Preserves frontmatter, code fences, JSX structure; flags em dashes, AI vocabulary,
  filler, hype, fake-depth tails, title-case headings

**Not covered yet.** Humanize is not part of the numeric audit score. No glossary or
banned-claim list per brand.

---

## Audit score map (v0.1 implementation)

These are the live `audit` check IDs and weights. The score is earned weight / total
weight, rounded 0–100.

| ID | Label | Weight | Checklist section |
| --- | --- | --- | --- |
| `llms` | `/llms.txt` | 10 | 4.1 |
| `llms-full` | `/llms-full.txt` | 10 | 4.2 |
| `sitemap` | `/sitemap.xml` | 10 | 9.1 |
| `robots` | `/robots.txt` | 8 | 9.2 |
| `title` | Page titles | 6 | 2.2 |
| `description` | Meta descriptions | 6 | 2.2 |
| `canonical` | Canonical links | 6 | 8.1 |
| `open-graph` | Open Graph tags | 5 | 10.1 |
| `twitter` | Twitter tags | 4 | 10.2 |
| `json-ld` | JSON-LD | 10 | 3 |
| `webmcp` | WebMCP manifest | 8 | 6 |
| `markdown` | Markdown mirrors | 6 | 5 |
| `answer-first` | Answer-first content | 11 | 7.1 |

Total weight: 100.

---

## Recommended fix loop

```bash
# 1. Measure
npx geoaeo audit https://example.com
npx geoaeo audit ./apps/website

# 2. Scaffold what you can
npx geoaeo init ./apps/website

# 3. Fill gaps from geoaeo.config.ts
npx geoaeo gen llms --output public/llms.txt
npx geoaeo gen llms-full --output public/llms-full.txt
npx geoaeo gen sitemap --output public/sitemap.xml
npx geoaeo gen robots --output public/robots.txt
npx geoaeo gen webmcp --output public/webmcp.json
npx geoaeo gen jsonld --type faq

# 4. Clean prose on key pages
npx geoaeo humanize 'content/**/*.md' --check
npx geoaeo humanize 'content/**/*.md' --write

# 5. Re-measure
npx geoaeo audit ./apps/website
```

Same loop through MCP: tools `audit`, `gen`, `humanize` on `npx geoaeo-mcp`.

---

## Explicit non-goals (current product)

geoaeo does **not** today:

- Replace a full SEO crawler (JS rendering, log-file analysis, backlink graphs).
- Guarantee citations in ChatGPT, Perplexity, Gemini, or any named engine.
- Host your artifacts or monitor citation share over time.
- Ship framework plugins beyond `init`’s Next App Router vs static file split.

When a checklist row is marked **Not covered yet**, treat it as manual work or a future
version—not as a hidden flag. See `docs/ROADMAP.md` and `docs/ENHANCEMENTS.md`.
