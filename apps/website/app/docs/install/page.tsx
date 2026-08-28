import type { Metadata } from "next";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@template/ui/primitives/card";

export const metadata: Metadata = {
  title: "Install geoaeo — npm install for SEO, GEO, and AEO toolkit",
  description:
    "Add geoaeo to any project with npm install geoaeo. Use npx for one-offs, verify both bins, and scaffold a config for your framework in seconds.",
};

const intro =
  "geoaeo is an unscoped npm package. It ships a library, a CLI, and an MCP server at one version. Free and open source under MIT.";

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <DocsPageHeader crumb="Install" badge="Package: geoaeo" title="Install geoaeo" intro={intro} />

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-code:text-sm prose-pre:bg-muted prose-pre:border">
          <Requirements />
          <Install />
          <OneOffWithoutInstall />
          <VerifyBothBins />
          <ScaffoldConfig />
          <ConfigShape />
          <NextSteps />
        </div>

        <Card className="mt-8 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick check</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>{`node --version  # >= 20
npx geoaeo audit ./ --json | head -n 30`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Requirements() {
  return (
    <>
      <h2>Requirements</h2>
      <ul>
        <li>Node.js 20 or later</li>
        <li>npm, pnpm, yarn, or bun</li>
        <li>A site to audit — a live URL or a local directory</li>
      </ul>
    </>
  );
}

function Install() {
  return (
    <>
      <h2>Install</h2>
      <p>Install as a dev dependency in any site:</p>
      <pre>
        <code>npm install geoaeo</code>
      </pre>
      <p>Or install globally if you run it across many repos:</p>
      <pre>
        <code>npm install -g geoaeo</code>
      </pre>
    </>
  );
}

function OneOffWithoutInstall() {
  return (
    <>
      <h2>One-off without install</h2>
      <p>Use npx when you only need a single audit:</p>
      <pre>
        <code>{`npx geoaeo audit https://example.com
npx geoaeo audit ./ --json`}</code>
      </pre>
    </>
  );
}

function VerifyBothBins() {
  return (
    <>
      <h2>Verify both bins</h2>
      <p>The package provides two bins. Check that both resolve:</p>
      <pre>
        <code>{`npx geoaeo --help
npx geoaeo-mcp --help`}</code>
      </pre>
      <p>
        <code>geoaeo</code> is the CLI. <code>geoaeo-mcp</code> is the MCP server over stdio. You do not run the
        MCP bin by hand when an agent manages it.
      </p>
    </>
  );
}

function ScaffoldConfig() {
  return (
    <>
      <h2>Scaffold config</h2>
      <p>
        Create <code>geoaeo.config.ts</code> from the example. The config holds site facts used by every generator.
      </p>
      <pre>
        <code>{`npx geoaeo init ./
cat geoaeo.config.ts`}</code>
      </pre>
      <p>
        <code>init</code> detects Next.js, Astro, SvelteKit, Nuxt, or Remix and writes routes that emit each
        artifact. Other directories receive static files. Existing files stay unchanged unless you pass{" "}
        <code>--force</code>.
      </p>
      <pre>
        <code>npx geoaeo init ./ --force</code>
      </pre>
    </>
  );
}

function ConfigShape() {
  return (
    <>
      <h2>Config shape</h2>
      <p>A minimal config looks like this:</p>
      <pre>
        <code>{`import { defineConfig } from 'geoaeo';

export default defineConfig({
  siteName: 'Example',
  siteUrl: 'https://example.com',
  description: 'An example site.',
  pages: ['pricing', 'faq'],
});`}</code>
      </pre>
      <p>
        See <code>geoaeo.config.example.ts</code> in the repo for the full shape with tools, plans, and FAQ entries.
      </p>
    </>
  );
}

function NextSteps() {
  return (
    <>
      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/docs/cli">CLI reference</Link> — audit, gen, humanize, and mcp in detail
        </li>
        <li>
          <Link href="/docs/mcp">MCP server</Link> — wire geoaeo-mcp into your agent
        </li>
        <li>
          <Link href="/docs/harnesses/claude-code">Claude Code guide</Link> — first harness setup
        </li>
      </ul>
    </>
  );
}
