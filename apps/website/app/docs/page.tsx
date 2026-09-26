import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@template/ui/primitives/card";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";
import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";

export const metadata: Metadata = {
  title: "geoaeo Docs — CLI, MCP, and harnesses for AI discoverability",
  description:
    "Start with geoaeo in minutes. Install the npm package, run the audit and generators from the CLI, connect the MCP server, and wire it into your AI harness.",
};

const sections = [
  {
    title: "Install",
    href: "/docs/install",
    description: "Install geoaeo with npm install geoaeo and scaffold your first config.",
    label: "Start here",
  },
  {
    title: "CLI Reference",
    href: "/docs/cli",
    description: "audit, init, gen, humanize, mcp — every command with flags and examples.",
    label: "CLI",
  },
  {
    title: "MCP Server",
    href: "/docs/mcp",
    description: "Run geoaeo mcp over stdio and expose audit, gen, humanize to agents.",
    label: "MCP",
  },
];

const harnesses = [
  { name: "Claude Code", slug: "claude-code", config: ".mcp.json" },
  { name: "Muse", slug: "codex", config: "~/.codex/config.toml" },
  { name: "Cursor", slug: "cursor", config: ".cursor/mcp.json" },
  { name: "Windsurf", slug: "windsurf", config: "~/.codeium/windsurf/mcp_config.json" },
  { name: "Gemini CLI", slug: "gemini-cli", config: "~/.gemini/settings.json" },
  { name: "GitHub Copilot", slug: "github-copilot", config: ".vscode/mcp.json" },
  { name: "Continue", slug: "continue", config: "~/.continue/config.yaml" },
];

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl">
        <DocsHeader />

        <SectionCards />

        <HarnessCards />

        <QuickStart />

        <RelatedLinks />
    </div>
  );
}

/** Breadcrumb, title block and rule. */
function DocsHeader() {
  return (
    <>
      <DocsBreadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Docs" }]} />

      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-3">
          geoaeo v0.2
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">geoaeo documentation</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
          geoaeo makes any app discoverable and quotable by AI answer engines. SEO plus GEO plus AEO in one package.
          Install once, audit your site, and generate the files that answer engines read.
        </p>
      </div>

      <Separator className="my-8" />
    </>
  );
}

/** Cards for install, CLI and MCP. */
function SectionCards() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="group">
            <Card className="h-full transition-colors group-hover:border-foreground/20 group-hover:shadow-sm">
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs">
                  {s.label}
                </Badge>
                <CardTitle className="text-lg mt-2 group-hover:text-foreground">{s.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  Open {s.title} &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

/** One card per supported harness guide. */
function HarnessCards() {
  return (
    <>
      <div className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Harnesses</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Connect the geoaeo MCP server to your AI harness. Each guide has a copy-paste config block, a verify step,
          and two walkthroughs for audit and gen.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {harnesses.map((h) => (
            <Link key={h.slug} href={`/docs/harnesses/${h.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{h.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{h.config}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    View guide &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/** Copy-paste install and first commands. */
function QuickStart() {
  return (
    <>
      <div className="mt-10 rounded-xl border bg-muted/30 p-5 sm:p-6">
        <h2 className="text-base font-semibold">Quick start</h2>
        <p className="mt-1 text-sm text-muted-foreground">One package, two bins: geoaeo and geoaeo-mcp.</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{`npm install geoaeo

# audit a live site
npx geoaeo audit https://example.com

# scaffold config for your framework
npx geoaeo init ./

# generate artifacts
npx geoaeo gen llms
npx geoaeo gen sitemap --output public/sitemap.xml`}</code>
        </pre>
        <p className="mt-3 text-xs text-muted-foreground">
          MCP server is stdio only. Tools: <span className="font-mono">audit</span>,{" "}
          <span className="font-mono">gen</span>, <span className="font-mono">humanize</span>.
        </p>
      </div>
    </>
  );
}

/** Footer links to the three docs pages. */
function RelatedLinks() {
  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link href="/docs/install" className="text-primary hover:underline underline-offset-4">
          Install &rarr;
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/docs/cli" className="text-primary hover:underline underline-offset-4">
          CLI reference &rarr;
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/docs/mcp" className="text-primary hover:underline underline-offset-4">
          MCP server &rarr;
        </Link>
      </div>
    </>
  );
}
