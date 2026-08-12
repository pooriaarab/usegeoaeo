import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo in Muse — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Muse with the geoaeo-mcp server. Set up ~/.codex/config.toml, verify three tools, audit your site, and generate artifacts.",
};

export default function CodexHarnessPage() {
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
          <Link href="/docs/harnesses/codex" className="hover:text-foreground transition-colors">
            Harnesses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Muse</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Harness: Muse
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">geoaeo for Muse</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Connect the geoaeo MCP server to Muse. Audit a site and generate GEO and AEO artifacts from the
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
            <li>Muse installed (codex on PATH)</li>
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
          <p>You do not run geoaeo-mcp by hand when Codex manages it.</p>

          <h2>Configure the MCP server</h2>
          <p>
            Codex reads MCP servers from <code>~/.codex/config.toml</code>. Add a{" "}
            <code>mcp_servers.geoaeo</code> entry. Codex uses TOML for this file, not JSON.
          </p>
          <p>Copy this block into ~/.codex/config.toml:</p>
          <pre>
            <code>{`[mcp_servers.geoaeo]
command = "npx"
args = ["-y", "geoaeo-mcp"]`}</code>
          </pre>
          <p>If your Codex build reads JSON config, the equivalent JSON is:</p>
          <pre>
            <code>{`{
  "mcp_servers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  }
}`}</code>
          </pre>
          <p>Apply the change and restart Codex:</p>
          <pre>
            <code>{`mkdir -p ~/.codex
cat ~/.codex/config.toml
codex --help`}</code>
          </pre>
          <p>
            Start a new Codex session and confirm the server loads. Run <code>codex mcp list</code> if your build
            supports it, or check the startup log for <code>geoaeo: connected</code>.
          </p>

          <h2>Verify the connection</h2>
          <ol>
            <li>
              Open the repo with <code>codex</code>.
            </li>
            <li>Ask: &quot;List available MCP tools.&quot;</li>
            <li>
              Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear under <code>geoaeo</code>.
            </li>
          </ol>
          <p>If no tools appear, see Troubleshooting.</p>

          <h2>Walkthrough 1 — audit a site</h2>
          <p>Prompt the agent:</p>
          <blockquote>
            <p>Use geoaeo audit on https://example.com and summarize the score and the top 3 fixes. If that URL is not reachable, audit ./ instead.</p>
          </blockquote>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>audit</code> with <code>{`{"target": "https://example.com"}`}</code> or{" "}
              <code>{`{"target": "./"}`}</code>.
            </li>
            <li>
              Receives JSON with <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>.
            </li>
            <li>Reports the score and the fixes.</li>
          </ol>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo audit https://example.com --json
npx geoaeo audit ./ --json`}</code>
          </pre>
          <p>
            Use <code>topFixes</code> to choose the next <code>gen</code> call.
          </p>

          <h2>Walkthrough 2 — generate an artifact with gen</h2>
          <p>
            This uses <code>gen</code>, which reads <code>geoaeo.config.ts</code> in the current working directory.
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
                <p>Use geoaeo gen to create the sitemap for this site. Then write it to public/sitemap.xml.</p>
              </blockquote>
            </li>
          </ol>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>gen</code> with <code>{`{"artifact": "sitemap"}`}</code>.
            </li>
            <li>Receives XML text.</li>
            <li>
              Writes it to <code>public/sitemap.xml</code> (or shows it for review).
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
              <code>{`{"artifact": "robots"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "webmcp"}`}</code>
            </li>
            <li>
              <code>{`{"artifact": "jsonld", "type": "software"}`}</code> — type may be <code>software</code>,{" "}
              <code>product</code>, <code>faq</code>, or <code>breadcrumb</code>
            </li>
          </ul>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo gen llms
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen jsonld --type faq`}</code>
          </pre>
          <p>
            The <code>humanize</code> tool is also available: <code>{`{"glob": "content/**/*.md", "write": false}`}</code>.
          </p>

          <h2>Troubleshooting</h2>
          <p>
            <strong>Config file not loaded.</strong> Confirm the path is <code>~/.codex/config.toml</code>. Run{" "}
            <code>ls -la ~/.codex/config.toml</code> and <code>cat ~/.codex/config.toml</code>. Ensure the header is
            exactly <code>[mcp_servers.geoaeo]</code>. Restart Codex.
          </p>
          <p>
            <strong>npx fails or hangs.</strong> Run <code>npx -y geoaeo-mcp</code> manually. It should wait on stdin.
            Press Ctrl+C. If it fails, update Node to 20+ and check npm registry access.
          </p>
          <p>
            <strong>audit returns Cannot find target.</strong> Use an absolute path or a full https URL. For local dirs,
            run from the repo root so <code>./</code> resolves correctly.
          </p>
          <p>
            <strong>gen returns Cannot find config.</strong> Run <code>npx geoaeo init ./</code> in the project root.
          </p>
          <p>
            <strong>Tools appear but calls time out.</strong> Check that stdio is not blocked by a wrapper script. Use
            the exact command <code>npx</code> with args <code>[&quot;-y&quot;, &quot;geoaeo-mcp&quot;]</code>.
          </p>

          <h2>Reference</h2>
          <ul>
            <li>
              Package: <code>geoaeo</code>. Bins: <code>geoaeo</code>, <code>geoaeo-mcp</code>.
            </li>
            <li>Transport: stdio only.</li>
            <li>
              Tools: <code>audit</code> takes <code>target</code> (string). <code>gen</code> takes <code>artifact</code>{" "}
              enum and optional <code>type</code> enum. <code>humanize</code> takes <code>glob</code> (string) and
              optional <code>write</code> (boolean).
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
