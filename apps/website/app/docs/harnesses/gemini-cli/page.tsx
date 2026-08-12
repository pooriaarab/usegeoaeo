import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo in Gemini CLI — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Gemini CLI with the geoaeo-mcp server. Configure ~/.gemini/settings.json, verify three tools, audit your site, and generate artifacts.",
};

export default function GeminiCliHarnessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <span className="mx-2">/</span>
          <Link href="/docs/harnesses/gemini-cli" className="hover:text-foreground transition-colors">
            Harnesses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Gemini CLI</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Harness: Gemini CLI
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">geoaeo for Gemini CLI</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Connect the geoaeo MCP server to Gemini CLI. Audit a site and generate GEO and AEO artifacts from the Gemini
          agent.
        </p>

        <Separator className="my-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-code:text-sm prose-pre:bg-muted prose-pre:border">
          <h2>What you get</h2>
          <ul>
            <li>
              CLI bins: <code>geoaeo</code> and <code>geoaeo-mcp</code>
            </li>
            <li>
              CLI commands: <code>audit</code>, <code>init</code>, <code>gen</code>, <code>humanize</code>,{" "}
              <code>mcp</code>. No other commands exist.
            </li>
            <li>
              MCP server command: <code>npx geoaeo-mcp</code> over stdio
            </li>
            <li>
              MCP tools: <code>audit</code>, <code>gen</code>, <code>humanize</code>
            </li>
          </ul>

          <h2>Prerequisites</h2>
          <ul>
            <li>Node.js 20 or later</li>
            <li>Gemini CLI installed (gemini on PATH)</li>
            <li>A site directory or URL to audit</li>
          </ul>

          <h2>Install geoaeo</h2>
          <pre>
            <code>{`# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP binary
npx geoaeo-mcp --help`}</code>
          </pre>
          <p>Gemini CLI starts geoaeo-mcp over stdio. You do not run it by hand.</p>

          <h2>Configure the MCP server</h2>
          <p>
            Gemini CLI reads MCP servers from <code>~/.gemini/settings.json</code> under <code>mcpServers</code>. Use{" "}
            <code>command</code> and <code>args</code>.
          </p>
          <p>
            Add this entry to <code>~/.gemini/settings.json</code>:
          </p>
          <pre>
            <code>{`{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  }
}`}</code>
          </pre>
          <p>
            If <code>~/.gemini/settings.json</code> already exists, merge the <code>geoaeo</code> key under{" "}
            <code>mcpServers</code>. If it does not exist, create the file with the block above.
          </p>
          <p>
            Project scope alternative: create <code>.gemini/settings.json</code> in the repo root with the same block.
            Global scope takes precedence in some builds.
          </p>
          <p>Steps:</p>
          <ol>
            <li>
              Create or edit <code>~/.gemini/settings.json</code>.
            </li>
            <li>
              Paste the block. Validate JSON: <code>cat ~/.gemini/settings.json | jq .</code>.
            </li>
            <li>
              Restart Gemini CLI: exit and run <code>gemini</code> again.
            </li>
            <li>
              Run <code>/mcp</code> or <code>gemini mcp list</code> and confirm <code>geoaeo</code> shows with 3 tools.
            </li>
          </ol>

          <h2>Verify the connection</h2>
          <ol>
            <li>
              Run <code>gemini</code>.
            </li>
            <li>Ask: &quot;What MCP tools does geoaeo provide?&quot;</li>
            <li>
              Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear.
            </li>
          </ol>
          <p>If no tools appear, see Troubleshooting.</p>

          <h2>Walkthrough 1 — audit a site</h2>
          <p>Prompt the agent:</p>
          <blockquote>
            <p>Use geoaeo audit on ./ and summarize the score and the top fixes. If ./ is empty, use https://example.com.</p>
          </blockquote>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>audit</code> with <code>{`{"target": "./"}`}</code> or{" "}
              <code>{`{"target": "https://example.com"}`}</code>.
            </li>
            <li>
              Receives JSON: <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>,{" "}
              <code>pages[]</code>.
            </li>
            <li>Reports the score and the next steps.</li>
          </ol>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json`}</code>
          </pre>
          <p>
            Use <code>topFixes</code> to choose which artifact to generate next.
          </p>

          <h2>Walkthrough 2 — generate an artifact with gen</h2>
          <p>
            This uses <code>gen</code>, which reads <code>geoaeo.config.ts</code> from the current directory.
          </p>
          <ol>
            <li>
              Scaffold config if missing:
              <pre>
                <code>{`npx geoaeo init ./
cat geoaeo.config.ts`}</code>
              </pre>
            </li>
            <li>
              Prompt the agent:
              <blockquote>
                <p>Use geoaeo gen to create the JSON-LD for this site as type software. Show the JSON and explain where to place it.</p>
              </blockquote>
            </li>
          </ol>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>gen</code> with <code>{`{"artifact": "jsonld", "type": "software"}`}</code>.
            </li>
            <li>Returns formatted JSON-LD.</li>
            <li>
              Advises placement (for example, a <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code> tag in
              the page head).
            </li>
          </ol>
          <p>Other artifacts:</p>
          <ul>
            <li>
              <code>{`{"artifact": "llms"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "llms-full"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "sitemap"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "robots"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "webmcp"}`}</code>
            </li>
          </ul>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo gen jsonld --type software
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen webmcp`}</code>
          </pre>
          <p>
            The <code>humanize</code> tool is also available: <code>{`{"glob": "content/**/*.md", "write": false}`}</code>.
          </p>

          <h2>Troubleshooting</h2>
          <p>
            <strong>MCP server not found.</strong> Confirm <code>~/.gemini/settings.json</code> is valid JSON. Run{" "}
            <code>cat ~/.gemini/settings.json | jq .</code>. Check Node 20+ with <code>node --version</code>.
          </p>
          <p>
            <strong>npx ENOENT or permission error.</strong> Run <code>npx -y geoaeo-mcp</code> by hand. It should wait
            on stdin. If it fails, fix npm cache perms or install Node via nvm.
          </p>
          <p>
            <strong>audit returns empty or low score.</strong> Ensure you audit the repo root that contains{" "}
            <code>geoaeo.config.ts</code> and site files. Use <code>{`{"target": "./"}`}</code> when the agent&apos;s
            cwd is the repo root.
          </p>
          <p>
            <strong>gen fails with Cannot find config.</strong> Run <code>npx geoaeo init ./</code> in the repo root,
            then retry.
          </p>
          <p>
            <strong>Tools appear but calls hang.</strong> Check that no wrapper overrides stdio. Use exact{" "}
            <code>command: npx</code> with <code>args: [&quot;-y&quot;, &quot;geoaeo-mcp&quot;]</code>. Restart Gemini
            CLI after edits.
          </p>

          <h2>Reference</h2>
          <ul>
            <li>
              Package: <code>geoaeo</code>. Bins: <code>geoaeo</code>, <code>geoaeo-mcp</code>.
            </li>
            <li>Transport: stdio only.</li>
            <li>
              Tools: <code>audit</code> takes <code>target</code> (string). <code>gen</code> takes <code>artifact</code>{" "}
              enum and optional <code>type</code>. <code>humanize</code> takes <code>glob</code> and optional{" "}
              <code>write</code> (boolean).
            </li>
          </ul>
        </div>

        <div className="mt-8 flex gap-3 text-sm">
          <Link href="/docs/mcp" className="text-primary hover:underline underline-offset-4">
            MCP overview &rarr;
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/docs/cli" className="text-primary hover:underline underline-offset-4">
            CLI reference &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
