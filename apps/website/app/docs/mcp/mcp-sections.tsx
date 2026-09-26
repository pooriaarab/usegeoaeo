import Link from "next/link";

export function Tools() {
  return (
    <>
      <h2>Tools</h2>
      <ToolsTable />

      <h3>
        <code>audit</code>
      </h3>
      <pre>
        <code>{`{ "target": "./" }
{ "target": "https://example.com" }`}</code>
      </pre>
      <p>
        Returns JSON: <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>,{" "}
        <code>pages[]</code>. Use topFixes to choose the next gen call.
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
        <code>artifact</code> enum: llms, llms-full, jsonld, webmcp, sitemap, robots, ogimage, rss,
        hreflang, mdmirror. For jsonld, <code>type</code> may be software, product, faq, breadcrumb,
        organization, website, article, howto, person, or review. Reads{" "}
        <code>geoaeo.config.ts</code> in the current directory.
      </p>

      <h3>
        <code>humanize</code>
      </h3>
      <pre>
        <code>{`{ "glob": "content/**/*.md", "write": false }
{ "glob": "src/**/*.tsx", "write": true }`}</code>
      </pre>
    </>
  );
}

export function ConfigureAHarness() {
  return (
    <>
      <h2>Configure a harness</h2>
      <p>
        JSON paste is the fallback for Windsurf, Gemini CLI, Continue, and Copilot. The harness
        starts the server for you:
      </p>
      <pre>
        <code>{`{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo", "mcp"]
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
    </>
  );
}

export function SetupPrompt() {
  return (
    <>
      <h2>Set up in your agent</h2>
      <p>
        Claude Code, Cursor, and Codex install the plugin above. Windsurf, Gemini CLI, Continue, and
        Copilot have no plugin dialect. Paste this prompt instead:
      </p>
      <pre>
        <code>{`Set up geoaeo in this agent. Detect the harness, then configure the
geoaeo MCP server with command \`npx\` and args \`-y geoaeo mcp\`.
Run an audit on the current directory. Report the score and the
top three fixes.`}</code>
      </pre>
      <p>Then try one of these:</p>
      <ul>
        <li>
          <code>Audit https://example.com and list the top 3 fixes.</code>
        </li>
        <li>
          <code>Generate llms.txt for this repo.</code>
        </li>
      </ul>
    </>
  );
}

export function Troubleshooting() {
  return (
    <>
      <h2>Troubleshooting</h2>
      <p>
        <strong>Server shows as disconnected.</strong> Run <code>npx -y geoaeo mcp</code> in a
        terminal. It should wait on stdin. Press Ctrl+C. If npx fails, check Node 20+ and npm
        registry access.
      </p>
      <p>
        <strong>Config not picked up.</strong> Validate JSON with <code>cat .mcp.json | jq .</code>.
        Restart the harness after any config change.
      </p>
      <p>
        <strong>gen returns Cannot find config.</strong> Run <code>npx geoaeo init ./</code> to
        scaffold <code>geoaeo.config.ts</code>.
      </p>
    </>
  );
}

/** The three MCP tools and their inputs. */
function ToolsTable() {
  return (
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
            <td className="px-4 py-3 text-muted-foreground">
              Score a URL or local dir 0–100 and list gaps
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-mono text-xs">gen</td>
            <td className="px-4 py-3 font-mono text-xs">artifact, type?</td>
            <td className="px-4 py-3 text-muted-foreground">
              Generate one artifact from geoaeo.config.ts
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-mono text-xs">humanize</td>
            <td className="px-4 py-3 font-mono text-xs">glob, write?</td>
            <td className="px-4 py-3 text-muted-foreground">
              Find or fix AI-writing tells in prose files
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
