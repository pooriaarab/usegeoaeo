import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@template/ui/primitives/table";

/** How the checklist maps onto the audit score, and what geoaeo does not do. */

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
export function AuditScoreMapSection() {
  return (
    <section id="audit-score-map" className="scroll-mt-24 mb-12 space-y-4">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        Audit score map (v0.1 implementation)
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        These are the live <code className="font-mono text-xs">audit</code> check IDs and weights.
        The score is earned weight / total weight, rounded 0–100. Total weight: 100.
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
  );
}

export function FixLoopSection() {
  return (
    <section id="fix-loop" className="scroll-mt-24 mb-12 space-y-4">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">Recommended fix loop</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Same loop through MCP: tools <code className="font-mono text-xs">audit</code>,{" "}
        <code className="font-mono text-xs">gen</code>,{" "}
        <code className="font-mono text-xs">humanize</code> on{" "}
        <code className="font-mono text-xs">npx geoaeo mcp</code>.
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
  );
}

export function NonGoalsSection() {
  return (
    <section id="non-goals" className="scroll-mt-24 space-y-4">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight">
        Explicit non-goals (current product)
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">geoaeo does not today:</p>
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
        <li>Replace a full SEO crawler (JS rendering, log-file analysis, backlink graphs).</li>
        <li>Guarantee citations in ChatGPT, Perplexity, Gemini, or any named engine.</li>
        <li>Host your artifacts or monitor citation share over time.</li>
        <li>
          Ship framework plugins beyond <code className="font-mono text-xs">init</code>
          &apos;s Next App Router vs static file split.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground leading-relaxed">
        When a checklist row is marked Not covered yet, treat it as manual work or a future version,
        not as a hidden flag. See <code className="font-mono text-xs">
          docs/ROADMAP.md
        </code> and{" "}
        <code className="font-mono text-xs">docs/ENHANCEMENTS.md</code>. Compare the three shipped
        targets on the{" "}
        <Link href="/examples" className="text-foreground underline underline-offset-4">
          examples page
        </Link>
        .
      </p>
    </section>
  );
}
