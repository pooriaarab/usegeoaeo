import type { Metadata } from "next";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { InstallThePlugin } from "@/components/docs/install-the-plugin";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@template/ui/primitives/card";
import { ConfigureAHarness, SetupPrompt, Tools, Troubleshooting } from "./mcp-sections";

export const metadata: Metadata = {
  title: "geoaeo MCP Server — stdio tools for audit, gen, humanize",
  description:
    "Run geoaeo as an MCP server with the geoaeo-mcp bin. Expose audit, gen, and humanize over stdio to Claude Code, Cursor, and every supported harness.",
};

const intro =
  "Run geoaeo as a Model Context Protocol server. The agent calls geoaeo without leaving the chat. One version feeds the library, the CLI, and the MCP server at parity.";

export default function McpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <DocsPageHeader crumb="MCP" badge="Bin: geoaeo-mcp" title="MCP server" intro={intro} />

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-code:text-sm prose-pre:bg-muted prose-pre:border">
          <WhatYouGet />
          <Prerequisites />
          <InstallThePlugin harness="shared" />
          <Install />
          <Transport />
          <Tools />
          <RunDirectly />
          <ConfigureAHarness />
          <SetupPrompt />
          <Troubleshooting />
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

function WhatYouGet() {
  return (
    <>
      <h2>What you get</h2>
      <ul>
        <li>
          CLI bins: <code>geoaeo</code> and <code>geoaeo-mcp</code>
        </li>
        <li>
          CLI commands: <code>audit</code>, <code>init</code>, <code>gen</code>,{" "}
          <code>humanize</code>, <code>mcp</code> — no other commands exist
        </li>
        <li>
          MCP server command: <code>npx -y geoaeo mcp</code> over stdio
        </li>
        <li>
          MCP tools: <code>audit</code>, <code>gen</code>, <code>humanize</code>
        </li>
      </ul>
    </>
  );
}

function Prerequisites() {
  return (
    <>
      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 20 or later</li>
        <li>A site directory or a live URL to audit</li>
        <li>
          An MCP-capable harness — Claude Code, Cursor, Windsurf, Codex, Gemini CLI, Copilot, or
          Continue
        </li>
      </ul>
    </>
  );
}

function Install() {
  return (
    <>
      <h2>Install</h2>
      <pre>
        <code>{`# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install geoaeo
npx geoaeo --help

# verify the MCP server starts (it waits on stdin; Ctrl+C to stop)
npx -y geoaeo mcp`}</code>
      </pre>
      <p>
        You do not run geoaeo mcp by hand when the harness manages it. The harness starts it over
        stdio.
      </p>
    </>
  );
}

function Transport() {
  return (
    <>
      <h2>Transport</h2>
      <p>
        stdio only. No SSE or HTTP transport exists. The server reads from stdin and writes to
        stdout. The harness spawns it with <code>command: npx</code> and{" "}
        <code>args: [&quot;-y&quot;, &quot;geoaeo&quot;, &quot;mcp&quot;]</code>.
      </p>
    </>
  );
}

function RunDirectly() {
  return (
    <>
      <h2>Run directly</h2>
      <pre>
        <code>{`npx -y geoaeo mcp
# equivalent: run the geoaeo-mcp bin
npx -y --package=geoaeo geoaeo-mcp`}</code>
      </pre>
      <p>
        The process waits on stdin. You only run this for manual testing. Harnesses spawn it for
        you.
      </p>
    </>
  );
}
