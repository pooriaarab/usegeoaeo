import type { Metadata } from "next";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@template/ui/primitives/card";
import { pageAlternates } from "@/utils/page-alternates";

export const metadata: Metadata = {
  title: "geoaeo CLI — audit, init, gen, humanize, and mcp commands",
  description:
    "Complete reference for the geoaeo CLI. Audit any URL or directory for GEO/AEO gaps, scaffold artifacts, generate llms.txt and more, and run the MCP server.",
  alternates: pageAlternates("/docs/cli"),
};

const commands = [
  { name: "audit <url-or-dir>", purpose: "Score the site 0–100 and list missing artifacts." },
  { name: "init [dir]", purpose: "Add Next.js routes or static artifacts. Detects framework." },
  { name: "gen <artifact>", purpose: "Generate one artifact from geoaeo.config.ts." },
  { name: "humanize <glob>", purpose: "Find and strip AI-writing tells in prose files." },
  { name: "mcp", purpose: "Run the MCP server over stdio." },
];

const intro =
  "Five commands. Every capability reachable from the library is reachable from the CLI and the MCP server in the same release.";

export default function CliPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <DocsPageHeader crumb="CLI" badge="Bin: geoaeo" title="CLI reference" intro={intro} />

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Command</th>
                <th className="px-4 py-2.5 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commands.map((c) => (
                <tr key={c.name}>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-code:text-sm prose-pre:bg-muted prose-pre:border mt-8">
          <AuditCommand />
          <InitCommand />
          <GenCommand />
          <HumanizeCommand />
          <McpCommand />
          <Examples />
        </div>

        <Card className="mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Need the MCP server?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/docs/mcp" className="text-primary hover:underline underline-offset-4">
              Connect geoaeo-mcp to your harness &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuditCommand() {
  return (
    <>
      <h2>
        <code>geoaeo audit &lt;target&gt;</code>
      </h2>
      <p>Audit a live URL or a local directory. Scores 0–100 across 25 weighted checks including answerability, structured data, llms.txt, crawlability, freshness, and E-E-A-T.</p>
      <pre>
        <code>{`npx geoaeo audit https://example.com
npx geoaeo audit https://example.com --json
npx geoaeo audit ./apps/website`}</code>
      </pre>
      <h3>Flags</h3>
      <ul>
        <li>
          <code>--json</code> — print JSON instead of the human-readable report
        </li>
        <li>
          <code>--ci</code> — exit non-zero when the score is below <code>--min-score</code>
        </li>
        <li>
          <code>--min-score &lt;n&gt;</code> — minimum passing score for <code>--ci</code> (default <code>90</code>)
        </li>
      </ul>
      <pre>
        <code>npx geoaeo audit https://example.com --ci --min-score 85</code>
      </pre>
      <p>The command exits non-zero when the score is below the threshold. Use it to gate a build.</p>
    </>
  );
}

function InitCommand() {
  return (
    <>
      <h2>
        <code>geoaeo init [directory]</code>
      </h2>
      <p>Scaffold GEO and AEO artifacts into a site. Detects Next.js, Astro, SvelteKit, Nuxt, or Remix.</p>
      <pre>
        <code>{`npx geoaeo init ./
npx geoaeo init ./apps/website --force`}</code>
      </pre>
      <ul>
        <li>Next.js and similar frameworks — writes routes that emit each artifact</li>
        <li>Static sites — writes static files directly</li>
        <li>
          Existing files stay unchanged unless you pass <code>--force</code>
        </li>
      </ul>
    </>
  );
}

function GenCommand() {
  return (
    <>
      <h2>
        <code>geoaeo gen &lt;artifact&gt;</code>
      </h2>
      <p>Generate one artifact from the local <code>geoaeo.config.ts</code>. Prints to stdout or writes to a file.</p>
      <pre>
        <code>{`npx geoaeo gen llms
npx geoaeo gen llms-full --output public/llms-full.txt
npx geoaeo gen sitemap --output public/sitemap.xml
npx geoaeo gen robots
npx geoaeo gen webmcp
npx geoaeo gen jsonld --type faq
npx geoaeo gen ogimage --output public/og.svg
npx geoaeo gen rss --output public/feed.xml
npx geoaeo gen hreflang
npx geoaeo gen mdmirror`}</code>
      </pre>
      <h3>Flags</h3>
      <ul>
        <li>
          <code>-o, --output &lt;file&gt;</code> — write to a file instead of stdout
        </li>
        <li>
          <code>--type &lt;kind&gt;</code> — JSON-LD kind: <code>software</code>, <code>product</code>,{" "}
          <code>faq</code>, <code>breadcrumb</code>, <code>organization</code>, <code>website</code>,{" "}
          <code>article</code>, <code>howto</code>, <code>person</code>, or <code>review</code> (default{" "}
          <code>software</code>)
        </li>
      </ul>
      <p>Available artifacts: llms, llms-full, jsonld, webmcp, sitemap, robots, ogimage, rss, hreflang, mdmirror.</p>
    </>
  );
}

function HumanizeCommand() {
  return (
    <>
      <h2>
        <code>geoaeo humanize &lt;glob&gt;</code>
      </h2>
      <p>Find AI-writing tells in Markdown and JSX files. Checks for em dashes, AI vocabulary, filler, hype, fake-depth tails, and title-case headings.</p>
      <pre>
        <code>{`npx geoaeo humanize 'content/**/*.md' --check
npx geoaeo humanize 'src/**/*.tsx' --write`}</code>
      </pre>
      <ul>
        <li>
          <code>--check</code> — report only. Exits non-zero when tells are found
        </li>
        <li>
          <code>--write</code> — rewrite files in place. Keeps YAML frontmatter, code fences, JSX tags, imports,
          class names, and expressions
        </li>
      </ul>
    </>
  );
}

function McpCommand() {
  return (
    <>
      <h2>
        <code>geoaeo mcp</code>
      </h2>
      <p>Run the MCP server over stdio. The binary is also available as <code>geoaeo-mcp</code>.</p>
      <pre>
        <code>{`npx -y geoaeo mcp
# equivalent: run the geoaeo-mcp bin
npx -y --package=geoaeo geoaeo-mcp`}</code>
      </pre>
      <p>
        The server exposes three tools: <code>audit</code>, <code>gen</code>, and <code>humanize</code>. See the{" "}
        <Link href="/docs/mcp">MCP page</Link> for wiring it into agents.
      </p>
    </>
  );
}

function Examples() {
  return (
    <>
      <h2>Examples</h2>
      <ul>
        <li>
          Gate CI: <code>npx geoaeo audit https://example.com --ci --min-score 85</code>
        </li>
        <li>
          JSON for scripts: <code>npx geoaeo audit ./ --json | jq .score</code>
        </li>
        <li>
          Write JSON-LD: <code>npx geoaeo gen jsonld --type software &gt; public/jsonld.json</code>
        </li>
      </ul>
    </>
  );
}
