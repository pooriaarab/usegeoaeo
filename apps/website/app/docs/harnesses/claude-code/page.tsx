import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo in Claude Code — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Claude Code via the geoaeo-mcp server. Configure .mcp.json, verify three tools, audit your site, and generate artifacts without leaving the agent.",
};

export default function ClaudeCodeHarnessPage() {
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
          <Link href="/docs/harnesses/claude-code" className="hover:text-foreground transition-colors">
            Harnesses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Claude Code</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Harness: Claude Code
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">geoaeo for Claude Code</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Connect the geoaeo MCP server to Claude Code. Audit a site and generate GEO and AEO artifacts without leaving
          the agent.
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
            <li>Claude Code 1.0.60 or later</li>
            <li>A site directory or a live URL to audit</li>
          </ul>

          <h2>Install geoaeo</h2>
          <pre>
            <code>{`# one-off, no install
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP binary resolves
npx geoaeo-mcp --help`}</code>
          </pre>
          <p>The MCP server starts over stdio. You do not run it by hand when you use Claude Code.</p>

          <h2>Configure the MCP server</h2>
          <p>
            Claude Code reads MCP servers from <code>.mcp.json</code> in the project root or from your global Claude
            Code config. Use <code>command: npx</code> with <code>args: [&quot;-y&quot;, &quot;geoaeo-mcp&quot;]</code>.
          </p>

          <h3>Option A — project scope (recommended)</h3>
          <p>
            Create <code>.mcp.json</code> in the repo root:
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

          <h3>Option B — CLI helper</h3>
          <pre>
            <code>{`claude mcp add geoaeo -- npx -y geoaeo-mcp
claude mcp list`}</code>
          </pre>

          <h3>Option C — global scope</h3>
          <p>
            Add the same <code>mcpServers.geoaeo</code> entry to <code>~/.claude.json</code> under{" "}
            <code>mcpServers</code>.
          </p>
          <p>
            Restart Claude Code after you change the config. Run <code>/mcp</code> to confirm <code>geoaeo</code> shows
            with tools <code>audit</code>, <code>gen</code>, <code>humanize</code>.
          </p>
          <p>
            If you use a skill in this repo, add <code>.claude/skills/geoaeo/SKILL.md</code> as well. Claude Code loads
            skills automatically.
          </p>

          <h2>Verify the connection</h2>
          <ol>
            <li>Open the repo in Claude Code.</li>
            <li>
              Run <code>/mcp</code>.
            </li>
            <li>
              Confirm <code>geoaeo: connected</code> and 3 tools listed.
            </li>
            <li>
              Ask: &quot;Use geoaeo audit on the current directory and summarize the top fixes.&quot;
            </li>
          </ol>
          <p>If the tool list is empty, check Troubleshooting.</p>

          <h2>Walkthrough 1 — audit a site</h2>
          <p>
            This shows the <code>audit</code> tool. It scores 0–100 and lists missing artifacts.
          </p>
          <p>Prompt the agent:</p>
          <blockquote>
            <p>Audit the local site at ./ with geoaeo and tell me the 3 most important fixes.</p>
          </blockquote>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>audit</code> with <code>{`{"target": "./"}`}</code> (or a URL such as{" "}
              <code>{`{"target": "https://example.com"}`}</code>).
            </li>
            <li>
              Receives an <code>AuditReport</code> as JSON: <code>score</code>, <code>checks[]</code>,{" "}
              <code>topFixes[]</code>, <code>pages[]</code>.
            </li>
            <li>Summarizes the score and the top fixes.</li>
          </ol>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo audit ./ --json
npx geoaeo audit https://example.com`}</code>
          </pre>
          <p>Expected output shape (abridged):</p>
          <pre>
            <code>{`{
  "target": "./",
  "score": 62,
  "checks": [
    { "id": "llms-txt", "passed": false, "details": "Missing llms.txt" }
  ],
  "topFixes": ["Add llms.txt", "Add JSON-LD SoftwareApplication"]
}`}</code>
          </pre>
          <p>
            Use the <code>topFixes</code> list to decide which <code>gen</code> calls to run next.
          </p>

          <h2>Walkthrough 2 — generate an artifact with gen</h2>
          <p>
            This shows the <code>gen</code> tool. It reads <code>geoaeo.config.ts</code> in the current directory.
          </p>
          <ol>
            <li>
              Ensure <code>geoaeo.config.ts</code> exists:
              <pre>
                <code>{`npx geoaeo init ./
cat geoaeo.config.ts`}</code>
              </pre>
            </li>
            <li>
              Prompt the agent:
              <blockquote>
                <p>Use geoaeo gen to create the llms.txt for this site and show me the first 30 lines.</p>
              </blockquote>
            </li>
          </ol>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>gen</code> with <code>{`{"artifact": "llms"}`}</code>.
            </li>
            <li>Returns the file content as text. The agent can write it to public/llms.txt or show it inline.</li>
          </ol>
          <p>Other artifacts:</p>
          <ul>
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
              <code>{`{"artifact": "jsonld", "type": "software"}`}</code> — type may be <code>software</code>,{" "}
              <code>product</code>, <code>faq</code>, or <code>breadcrumb</code>
            </li>
            <li>
              <code>{`{"artifact": "webmcp"}`}</code>
            </li>
          </ul>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo gen llms
npx geoaeo gen jsonld --type software
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen robots -o ./public/robots.txt`}</code>
          </pre>
          <p>
            The <code>humanize</code> tool is also available: <code>{`{"glob": "content/**/*.md", "write": false}`}</code>
            . Set <code>write: true</code> to rewrite files in place.
          </p>

          <h2>Troubleshooting</h2>
          <p>
            <strong>Server shows as disconnected in /mcp.</strong> Run <code>npx -y geoaeo-mcp</code> in a terminal. It
            should wait on stdin. Press Ctrl+C. If npx fails, check Node 20+ and network access to npm.
          </p>
          <p>
            <strong>Config file not picked up.</strong> Confirm the file is named <code>.mcp.json</code> in the repo
            root. Validate JSON with <code>cat .mcp.json | jq .</code>. Restart Claude Code. Check{" "}
            <code>claude mcp list</code> shows geoaeo.
          </p>
          <p>
            <strong>Audit returns empty or low score on a Next.js app.</strong> Ensure you audit the project root that
            contains <code>geoaeo.config.ts</code>. For local directories, geoaeo scans HTML, TSX, and MDX files and
            looks for <code>public/llms.txt</code>, <code>app/llms.txt/route.ts</code>, and similar paths.
          </p>
          <p>
            <strong>gen returns Cannot find config.</strong> Run <code>npx geoaeo init ./</code> to scaffold{" "}
            <code>geoaeo.config.ts</code>.
          </p>
          <p>
            <strong>Permission or EACCES on npx cache.</strong> Run <code>npm config get cache</code> and ensure the
            directory is writable. Try <code>npx --yes geoaeo-mcp</code> once to prime the cache.
          </p>

          <h2>Reference</h2>
          <ul>
            <li>
              Package: <code>geoaeo</code> on npm. Bins: <code>geoaeo</code>, <code>geoaeo-mcp</code>.
            </li>
            <li>MCP transport: stdio only. No SSE or HTTP transport exists.</li>
            <li>
              Tools: <code>audit</code> takes <code>target</code> (string). <code>gen</code> takes{" "}
              <code>artifact</code> (enum) and optional <code>type</code>. <code>humanize</code> takes{" "}
              <code>glob</code> and optional <code>write</code> (boolean).
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
