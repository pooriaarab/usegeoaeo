import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@template/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@template/ui/primitives/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@template/ui/primitives/breadcrumb";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "GEO/AEO checklist — geoaeo",
  description:
    "Canonical GEO/AEO checklist for making an app discoverable and quotable by AI answer engines. geoaeo audit maps to the items marked Covered.",
};

const toc = [
  { href: "#how-to-use", label: "How to use" },
  { href: "#crawlability", label: "1. Crawlability" },
  { href: "#semantic-html", label: "2. Semantic HTML" },
  { href: "#structured-data", label: "3. Structured data" },
  { href: "#llms-txt", label: "4. llms.txt" },
  { href: "#markdown-mirrors", label: "5. Markdown mirrors" },
  { href: "#webmcp", label: "6. WebMCP" },
  { href: "#answerability", label: "7. Answerability" },
  { href: "#citability", label: "8. Citability" },
  { href: "#sitemap-robots", label: "9. Sitemap and robots" },
  { href: "#open-graph", label: "10. Open Graph" },
  { href: "#i18n", label: "11. Internationalization" },
  { href: "#prose", label: "12. Prose quality" },
  { href: "#audit-score-map", label: "Audit score map" },
  { href: "#fix-loop", label: "Recommended fix loop" },
  { href: "#non-goals", label: "Non-goals" },
];

const surfaces = [
  { face: "CLI", entry: "geoaeo", capabilities: "audit, init, gen, humanize, mcp" },
  { face: "MCP", entry: "geoaeo-mcp (stdio)", capabilities: "tools audit, gen, humanize" },
  {
    face: "Library",
    entry: "import { … } from 'geoaeo'",
    capabilities: "audit, generators, humanize, config",
  },
];

const jsonLdKinds = [
  { kind: "software (default)", type: "SoftwareApplication", use: "SaaS / web app home" },
  { kind: "product", type: "Product", use: "Packaged product positioning" },
  { kind: "faq", type: "FAQPage", use: "Q&A pairs from config faq" },
  { kind: "breadcrumb", type: "BreadcrumbList", use: "Home (+ first tool when configured)" },
];

const auditChecks = [
  { id: "llms", label: "/llms.txt", weight: 10, section: "4.1" },
  { id: "llms-full", label: "/llms-full.txt", weight: 10, section: "4.2" },
  { id: "sitemap", label: "/sitemap.xml", weight: 10, section: "9.1" },
  { id: "robots", label: "/robots.txt", weight: 8, section: "9.2" },
  { id: "title", label: "Page titles", weight: 6, section: "2.2" },
  { id: "description", label: "Meta descriptions", weight: 6, section: "2.2" },
  { id: "canonical", label: "Canonical links", weight: 6, section: "8.1" },
  { id: "open-graph", label: "Open Graph tags", weight: 5, section: "10.1" },
  { id: "twitter", label: "Twitter tags", weight: 4, section: "10.2" },
  { id: "json-ld", label: "JSON-LD", weight: 10, section: "3" },
  { id: "webmcp", label: "WebMCP manifest", weight: 8, section: "6" },
  { id: "markdown", label: "Markdown mirrors", weight: 6, section: "5" },
  { id: "answer-first", label: "Answer-first content", weight: 11, section: "7.1" },
];

function Covered() {
  return (
    <Badge variant="success" className="font-normal">
      Covered
    </Badge>
  );
}

function Gap() {
  return (
    <Badge variant="secondary" className="font-normal">
      Not covered yet
    </Badge>
  );
}

function Item({
  id,
  title,
  why,
  covers,
  gaps,
  extra,
  covered = true,
}: {
  id: string;
  title: string;
  why: string;
  covers: string[];
  gaps: string;
  extra?: ReactNode;
  covered?: boolean;
}) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {covered ? <Covered /> : <Gap />}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{why}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {covers.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold mb-2">How geoaeo covers it</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              {covers.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {extra}
        <div>
          <h4 className="text-sm font-semibold mb-2">Not covered yet</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{gaps}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-5">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                On this page
              </p>
              {toc.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0">
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Checklist</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <header className="max-w-2xl mb-10 sm:mb-14">
              <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
                GEO / AEO
              </p>
              <h1 className="text-fluid-xl sm:text-4xl font-bold tracking-tight mb-4">
                GEO/AEO checklist
              </h1>
              <p className="text-muted-foreground text-fluid-sm sm:text-base leading-relaxed">
                Canonical checklist for making an app discoverable and quotable
                by AI answer engines and agents. Use it as the target state for
                any site.{" "}
                <code className="font-mono text-sm text-foreground">geoaeo audit</code>{" "}
                maps to the items marked Covered. Items marked Not covered yet
                are product gaps, not implicit features.
              </p>
            </header>

            <section id="how-to-use" className="scroll-mt-24 mb-12 space-y-6">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                How to use this document
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
                <li>
                  Run{" "}
                  <code className="font-mono text-xs">{"npx geoaeo audit <url-or-dir>"}</code>{" "}
                  and read the score plus top fixes.
                </li>
                <li>
                  Close gaps with{" "}
                  <code className="font-mono text-xs">geoaeo init</code>,{" "}
                  <code className="font-mono text-xs">{"geoaeo gen <artifact>"}</code>, and
                  content edits.
                </li>
                <li>
                  Re-audit until the remaining fails are intentional or tracked
                  as product work.
                </li>
                <li>
                  Treat this checklist as the contract: if audit does not check
                  it, do not assume geoaeo enforces it.
                </li>
              </ol>

              <p className="text-sm text-muted-foreground">
                Real surface today. Generators:{" "}
                <code className="font-mono text-xs">llms</code>,{" "}
                <code className="font-mono text-xs">llms-full</code>,{" "}
                <code className="font-mono text-xs">jsonld</code> (
                <code className="font-mono text-xs">software</code> |{" "}
                <code className="font-mono text-xs">product</code> |{" "}
                <code className="font-mono text-xs">faq</code> |{" "}
                <code className="font-mono text-xs">breadcrumb</code>),{" "}
                <code className="font-mono text-xs">webmcp</code>,{" "}
                <code className="font-mono text-xs">sitemap</code>,{" "}
                <code className="font-mono text-xs">robots</code>.
              </p>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Face</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Capabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surfaces.map((row) => (
                      <TableRow key={row.face}>
                        <TableCell className="font-medium">{row.face}</TableCell>
                        <TableCell className="font-mono text-xs">{row.entry}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.capabilities}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section id="crawlability" className="scroll-mt-24 mb-12 space-y-6">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                1. Crawlability
              </h2>
              <Item
                id="public-html"
                title="1.1 Public HTML that bots and fetchers can reach"
                why="Answer engines and crawlers need a stable HTTP response with real content. Client-only shells with empty first HTML give them nothing to index or quote."
                covers={[
                  "geoaeo audit <url> fetches the home page and up to four sitemap URLs.",
                  "geoaeo audit <dir> walks local HTML and common framework page files (page.tsx, layout.tsx, .html).",
                  "Audit does not execute JavaScript. If critical copy only appears after client render, the audit can pass structure checks while engines still see an empty body.",
                ]}
                gaps="No headless render, no SPA hydration check, no soft-404 detection."
              />
              <Item
                id="robots-block"
                title="1.2 No accidental block of AI or search crawlers"
                why="A robots.txt deny-all, auth wall, or IP block can hide the site from the systems you want to cite you."
                covers={[
                  "geoaeo gen robots emits a robots policy that includes a Sitemap: line from config.",
                  "Audit check robots requires a robots artifact that mentions a user-agent policy and a sitemap URL.",
                ]}
                gaps="No parser for Disallow overreach, no AI-bot allowlist presets, no live robots negotiation beyond fetching /robots.txt."
              />
              <Item
                id="stable-urls"
                title="1.3 Stable, linkable URLs"
                why="Citations need durable paths. Session IDs, unbounded query strings, and rotating slugs break quotes and dilute authority."
                covers={[
                  "Config-driven generators (sitemap, llms, llms-full, JSON-LD) use siteUrl and configured page/tool paths.",
                  "Audit check canonical requires a canonical link on inspected pages.",
                ]}
                gaps="No redirect-chain audit, no query-parameter normalization, no trailing-slash policy enforcement."
              />
            </section>

            <section id="semantic-html" className="scroll-mt-24 mb-12 space-y-6">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                2. Semantic HTML
              </h2>
              <Item
                id="heading-hierarchy"
                title="2.1 One clear H1 and heading hierarchy"
                why="Headings are the cheapest outline for both humans and models. A missing H1 or a wall of same-level headings weakens answer extraction."
                covers={[
                  "Audit answer-first requires an H1 on an inspected page (paired with an early FAQ signal).",
                  "Audit does not score full heading order (H2 under H1, no skipped levels).",
                ]}
                gaps="No landmark/main/article checks, no heading-outline scorer, no generator that rewrites page markup."
              />
              <Item
                id="titles-meta"
                title="2.2 Meaningful titles and meta descriptions"
                why="Titles and descriptions are fallback snippets when models and social unfurlers cannot build a better summary."
                covers={[
                  "Audit checks title and description on every inspected page (all-pages pass rule).",
                  "Works for HTML and for common Next-style metadata source patterns.",
                ]}
                gaps="No length or uniqueness scoring, no keyword stuffing detection, no auto-write of titles from config."
              />
              <Item
                id="visible-content"
                title="2.3 Visible, extractable primary content"
                why="If the answer lives only in images, canvas, or late-loaded widgets, engines cannot quote it reliably."
                covers={[
                  "HTML audit path parses DOM text with Cheerio for FAQ-like early content signals.",
                  "geoaeo humanize helps keep prose direct and less AI-sounding, which improves human trust when a model cites you. It does not invent missing answers.",
                ]}
                gaps="No alt-text audit, no OCR, no main-content density metric."
              />
            </section>

            <section id="structured-data" className="scroll-mt-24 mb-12 space-y-6">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                3. Structured data (JSON-LD)
              </h2>
              <Item
                id="json-ld-types"
                title="3.1 Machine-readable entity types"
                why="schema.org JSON-LD gives engines typed facts (what the product is, FAQ pairs, trail of pages) instead of guessing from prose."
                covers={[
                  "geoaeo gen jsonld --type software|product|faq|breadcrumb",
                  "Library helpers: softwareApplicationJsonLd, productJsonLd, faqJsonLd, breadcrumbJsonLd, generateJsonLd.",
                  "Audit check json-ld passes when any inspected page exposes JSON-LD / @type; the report lists detected types when parseable.",
                ]}
                gaps="No Organization, WebSite, Article, HowTo, Person, SpeakableSpecification, or validation against Google rich-result rules. Audit does not require a specific type, only that some JSON-LD exists."
                extra={
                  <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kind</TableHead>
                          <TableHead>schema.org @type</TableHead>
                          <TableHead>Typical use</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jsonLdKinds.map((row) => (
                          <TableRow key={row.kind}>
                            <TableCell className="font-mono text-xs">{row.kind}</TableCell>
                            <TableCell className="font-mono text-xs">{row.type}</TableCell>
                            <TableCell className="text-muted-foreground">{row.use}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
              />
              <Item
                id="faq-pairs"
                title="3.2 FAQ pairs as first-class data"
                why="Answer engines prefer explicit question → answer pairs. FAQ JSON-LD plus visible FAQ copy is the highest-yield AEO pattern for product sites."
                covers={[
                  "Config field faq: { question, answer }[].",
                  "geoaeo gen jsonld --type faq emits FAQPage.",
                  "Audit answer-first looks for an early “FAQ” / “frequently asked questions” signal with an H1.",
                ]}
                gaps="No check that visible FAQ text matches JSON-LD, no multi-page FAQ graph, no People also ask coverage analysis."
              />
            </section>

            <section id="llms-txt" className="scroll-mt-24 mb-12 space-y-6">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                4. llms.txt and llms-full.txt
              </h2>
              <Item
                id="llms-short"
                title="4.1 Short map (/llms.txt)"
                why="llms.txt is an emerging convention: a small, curated map so models can learn what the site is and which URLs matter without scraping everything."
                covers={[
                  "geoaeo gen llms and geoaeo init (static or Next route).",
                  "Audit check llms (weight 10).",
                ]}
                gaps="No automatic change-detection publish, no content-hash freshness header, no multi-locale llms files."
              />
              <Item
                id="llms-full"
                title="4.2 Long map (/llms-full.txt)"
                why="The full file carries deeper product facts, FAQs, and page lists for agents that will read a larger context window."
                covers={[
                  "geoaeo gen llms-full.",
                  "Audit check llms-full (weight 10), including section-shape heuristics used by the generator.",
                ]}
                gaps="No automatic change-detection publish, no content-hash freshness header, no multi-locale llms files."
              />
            </section>

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

            <section id="audit-score-map" className="scroll-mt-24 mb-12 space-y-4">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                Audit score map (v0.1 implementation)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These are the live <code className="font-mono text-xs">audit</code> check
                IDs and weights. The score is earned weight / total weight,
                rounded 0–100. Total weight: 100.
              </p>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>Checklist section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditChecks.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        <TableCell>{row.label}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.weight}</TableCell>
                        <TableCell className="text-muted-foreground">{row.section}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section id="fix-loop" className="scroll-mt-24 mb-12 space-y-4">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                Recommended fix loop
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Same loop through MCP: tools{" "}
                <code className="font-mono text-xs">audit</code>,{" "}
                <code className="font-mono text-xs">gen</code>,{" "}
                <code className="font-mono text-xs">humanize</code> on{" "}
                <code className="font-mono text-xs">npx geoaeo-mcp</code>.
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs font-mono leading-relaxed">{`# 1. Measure
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
npx geoaeo audit ./apps/website`}</pre>
            </section>

            <section id="non-goals" className="scroll-mt-24 space-y-4">
              <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
                Explicit non-goals (current product)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                geoaeo does not today:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
                <li>
                  Replace a full SEO crawler (JS rendering, log-file analysis,
                  backlink graphs).
                </li>
                <li>
                  Guarantee citations in ChatGPT, Perplexity, Gemini, or any
                  named engine.
                </li>
                <li>Host your artifacts or monitor citation share over time.</li>
                <li>
                  Ship framework plugins beyond{" "}
                  <code className="font-mono text-xs">init</code>
                  &apos;s Next App Router vs static file split.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When a checklist row is marked Not covered yet, treat it as
                manual work or a future version, not as a hidden flag. See{" "}
                <code className="font-mono text-xs">docs/ROADMAP.md</code> and{" "}
                <code className="font-mono text-xs">docs/ENHANCEMENTS.md</code>.
                Compare the three shipped targets on the{" "}
                <Link href="/examples" className="text-foreground underline underline-offset-4">
                  examples page
                </Link>
                .
              </p>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
