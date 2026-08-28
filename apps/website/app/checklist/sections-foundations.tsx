import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@template/ui/primitives/table";
import { Item } from "./checklist-item";

/** Checklist sections 1-4: what an engine must be able to fetch and parse. */

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
export function HowToUseSection() {
  return (
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

      <SurfacesTable />
    </section>
  );
}

export function CrawlabilitySection() {
  return (
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
  );
}

export function SemanticHtmlSection() {
  return (
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
  );
}

export function StructuredDataSection() {
  return (
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
          <JsonLdKindsTable />
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
  );
}

export function LlmsTxtSection() {
  return (
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
  );
}

/** The three faces geoaeo ships, and what each one exposes. */
function SurfacesTable() {
  return (
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
  );
}

/** The JSON-LD kinds gen can emit today. */
function JsonLdKindsTable() {
  return (
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
  );
}
