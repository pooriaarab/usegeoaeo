import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@template/ui/primitives/card";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo MCP Server — stdio tools for audit, gen, humanize",
  description:
    "Run geoaeo as an MCP server with the geoaeo-mcp bin. Expose audit, gen, and humanize over stdio to Claude Code, Cursor, and every supported harness.",
};

export default function McpPage() {
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
          <span className="text-foreground">MCP</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Bin: geoaeo-mcp
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">MCP server</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Run geoaeo as a Model Context Protocol server. The agent calls geoaeo without leaving the chat. One version
          feeds the library, the CLI, and the MCP server at parity.
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
              <code>mcp</code> — no other commands exist
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
            <li>A site directory or a live URL to audit</li>
            <li>An MCP-capable harness — Claude Code, Cursor, Windsurf, Codex, Gemini CLI, Copilot, or Continue</li>
          </ul>

          <h2>Install</h2>
          <pre>
            <code>{`# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install geoaeo
npx geoaeo --help

# verify the MCP binary
npx geoaeo-mcp --help`}</code>
          </pre>
          <p>You do not run geoaeo-mcp by hand when the harness manages it. The harness starts it over stdio.</p>

          <h2>Transport</h2>
          <p>
            stdio only. No SSE or HTTP transport exists. The server reads from stdin and writes to stdout. The harness
            spawns it with <code>command: npx</code> and <code>args: [&quot;-y&quot;, &quot;geoaeo-mcp&quot;]</code>.
          </p>

          <h2>Tools</h2>
          <div className="not-prose overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Tool</th>
                  <th className="px-4 py-2.5 font-semibold">Input</th>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">audit</td>
                  <td className="px-4 py-3 font-mono text-xs">target: string</td>
                  <td className="px-4 py-3 text-muted-foreground">Score a URL or local dir 0–100 and list gaps</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">gen</td>
                  <td className="px-4 py-3 font-mono text-xs">artifact, type?</td>
                  <td className="px-4 py-3 text-muted-foreground">Generate one artifact from geoaeo.config.ts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">humanize</td>
                  <td className="px-4 py-3 font-mono text-xs">glob, write?</td>
                  <td className="px-4 py-3 text-muted-foreground">Find or fix AI-writing tells in prose files</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>
            <code>audit</code>
          </h3>
          <pre>
            <code>{`{ "target": "./" }
{ "target": "https://example.com" }`}</code>
          </pre>
          <p>
            Returns JSON: <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>, <code>pages[]</code>. Use
            topFixes to choose the next gen call.
          </p>

          <h3>
            <code>gen</code>
          </h3>
          <pre>
            <code>{`{ "artifact": "llms" }
{ "artifact": "llms-full" }
{ "artifact": "sitemap" }
{ "artifact": "robots" }
{ "artifact": "webmcp" }
{ "artifact": "jsonld", "type": "software" }`}</code>
          </pre>
          <p>
            <code>artifact</code> enum: llms, llms-full, jsonld, webmcp, sitemap, robots. For jsonld, <code>type</code>{" "}
            may be software, product, faq, or breadcrumb. Reads <code>geoaeo.config.ts</code> in the current directory.
          </p>

          <h3>
            <code>humanize</code>
          </h3>
          <pre>
            <code>{`{ "glob": "content/**/*.md", "write": false }
{ "glob": "src/**/*.tsx", "write": true }`}</code>
          </pre>

          <h2>Run directly</h2>
          <pre>
            <code>{`npx geoaeo mcp
# equivalent
npx geoaeo-mcp`}</code>
          </pre>
          <p>The process waits on stdin. You only run this for manual testing. Harnesses spawn it for you.</p>

          <h2>Configure a harness</h2>
          <p>Minimal MCP config. The harness starts the server for you:</p>
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
          <p>The exact file path depends on the harness. See the harness guides:</p>
          <ul>
            <li>
              <Link href="/docs/harnesses/claude-code">Claude Code</Link> — <code>.mcp.json</code>
            </li>
            <li>
              <Link href="/docs/harnesses/cursor">Cursor</Link> — <code>.cursor/mcp.json</code>
            </li>
            <li>
              <Link href="/docs/harnesses/codex">Muse</Link> — <code>~/.codex/config.toml</code>
            </li>
            <li>
              <Link href="/docs/harnesses/windsurf">Windsurf</Link> —{" "}
              <code>~/.codeium/windsurf/mcp_config.json</code>
            </li>
            <li>
              <Link href="/docs/harnesses/gemini-cli">Gemini CLI</Link> —{" "}
              <code>~/.gemini/settings.json</code>
            </li>
            <li>
              <Link href="/docs/harnesses/github-copilot">GitHub Copilot</Link> —{" "}
              <code>.vscode/mcp.json</code>
            </li>
            <li>
              <Link href="/docs/harnesses/continue">Continue</Link> —{" "}
              <code>~/.continue/config.yaml</code>
            </li>
          </ul>

          <h2>Troubleshooting</h2>
          <p>
            <strong>Server shows as disconnected.</strong> Run <code>npx -y geoaeo-mcp</code> in a terminal. It should
            wait on stdin. Press Ctrl+C. If npx fails, check Node 20+ and npm registry access.
          </p>
          <p>
            <strong>Config not picked up.</strong> Validate JSON with <code>cat .mcp.json | jq .</code>. Restart the
            harness after any config change.
          </p>
          <p>
            <strong>gen returns Cannot find config.</strong> Run <code>npx geoaeo init ./</code> to scaffold{" "}
            <code>geoaeo.config.ts</code>.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">CLI and MCP stay in sync</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Every CLI example has an MCP equivalent. <code>npx geoaeo audit ./ --json</code> and{" "}
            <code>{`{ "target": "./" }`}</code> hit the same audit code. See the{" "}
            <Link href="/docs/cli" className="text-primary hover:underline">
              CLI reference
            </Link>{" "}
            for flags.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
