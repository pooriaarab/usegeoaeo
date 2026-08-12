import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo in Continue — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Continue with the geoaeo-mcp server. Configure config.yaml, verify three tools, audit your site, and generate artifacts from Chat.",
};

export default function ContinueHarnessPage() {
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
          <Link href="/docs/harnesses/continue" className="hover:text-foreground transition-colors">
            Harnesses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Continue</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Harness: Continue
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">geoaeo for Continue</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Connect the geoaeo MCP server to Continue. Audit a site and generate GEO and AEO artifacts from Continue Chat
          and Agent.
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
            <li>Continue extension in VS Code or JetBrains</li>
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
          <p>Continue starts geoaeo-mcp over stdio. You do not run it by hand.</p>

          <h2>Configure the MCP server</h2>
          <p>
            Continue reads MCP servers from its config file. In recent builds this is{" "}
            <code>~/.continue/config.yaml</code> (preferred) or <code>~/.continue/config.json</code>. Both formats are
            shown.
          </p>

          <h3>Option A — config.yaml (preferred)</h3>
          <p>
            Add to <code>~/.continue/config.yaml</code>:
          </p>
          <pre>
            <code>{`mcpServers:
  - name: geoaeo
    command: npx
    args: ["-y", "geoaeo-mcp"]`}</code>
          </pre>
          <p>Or with the indexed key form some builds use:</p>
          <pre>
            <code>{`experimental:
  mcpServers:
    - name: geoaeo
      command: npx
      args: ["-y", "geoaeo-mcp"]`}</code>
          </pre>

          <h3>Option B — config.json</h3>
          <p>
            Add to <code>~/.continue/config.json</code>:
          </p>
          <pre>
            <code>{`{
  "mcpServers": [
    {
      "name": "geoaeo",
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  ]
}`}</code>
          </pre>
          <p>Steps:</p>
          <ol>
            <li>
              Open <code>~/.continue/config.yaml</code> (or <code>config.json</code>).
            </li>
            <li>Paste one block above. Validate YAML or JSON.</li>
            <li>Reload the editor window or restart the IDE.</li>
            <li>
              Open Continue Chat and check MCP servers. Confirm <code>geoaeo</code> shows with <code>audit</code>,{" "}
              <code>gen</code>, <code>humanize</code>.
            </li>
          </ol>
          <p>
            Project scope: some builds also read <code>.continue/config.yaml</code> in the repo root. Use the global
            file first.
          </p>

          <h2>Verify the connection</h2>
          <ol>
            <li>Open Continue Chat.</li>
            <li>Ask: &quot;What MCP tools does geoaeo provide?&quot;</li>
            <li>
              Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear.
            </li>
          </ol>
          <p>If no tools appear, see Troubleshooting.</p>

          <h2>Walkthrough 1 — audit a site</h2>
          <p>Prompt Continue:</p>
          <blockquote>
            <p>Use geoaeo audit on ./ and summarize the score and top fixes. If ./ is not a site, try https://example.com.</p>
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
            Use <code>topFixes</code> to choose the next artifact to generate.
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
              Prompt Continue:
              <blockquote>
                <p>Use geoaeo gen to create llms-full for this site. Show the first 50 lines.</p>
              </blockquote>
            </li>
          </ol>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>gen</code> with <code>{`{"artifact": "llms-full"}`}</code>.
            </li>
            <li>Returns the file text.</li>
          </ol>
          <p>Other artifacts:</p>
          <ul>
            <li>
              <code>{`{"artifact": "llms"}`}</code>
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
            <li>
              <code>{`{"artifact": "jsonld", "type": "software"}`}</code> — type may be <code>software</code>,{" "}
              <code>product</code>, <code>faq</code>, or <code>breadcrumb</code>
            </li>
          </ul>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo gen llms-full
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen jsonld --type faq`}</code>
          </pre>
          <p>
            The <code>humanize</code> tool is also available: <code>{`{"glob": "content/**/*.md", "write": false}`}</code>.
          </p>

          <h2>Troubleshooting</h2>
          <p>
            <strong>MCP server not shown.</strong> Check the config file path: <code>~/.continue/config.yaml</code> vs{" "}
            <code>~/.continue/config.json</code>. Continue loads one file. Validate YAML with{" "}
            <code>cat ~/.continue/config.yaml</code> and check indent.
          </p>
          <p>
            <strong>YAML indent error.</strong> <code>mcpServers</code> is a list. Each entry starts with{" "}
            <code>- name:</code>. Keep <code>command</code> and <code>args</code> indented 4 spaces under the entry.
          </p>
          <p>
            <strong>npx ENOENT.</strong> Run <code>node --version</code> and <code>which npx</code> in the IDE
            terminal. If Node is not on PATH, use the absolute path in <code>command</code>, for example{" "}
            <code>&quot;/opt/homebrew/bin/npx&quot;</code>.
          </p>
          <p>
            <strong>audit returns empty.</strong> Use <code>{`{"target": "./"}`}</code> from the workspace root. Ensure
            the directory contains site files.
          </p>
          <p>
            <strong>gen fails with Cannot find config.</strong> Run <code>npx geoaeo init ./</code> in the workspace
            root, then retry <code>gen</code>.
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
