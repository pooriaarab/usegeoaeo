import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

export const metadata: Metadata = {
  title: "geoaeo in Windsurf — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Windsurf with the geoaeo-mcp server. Configure mcp_config.json, verify three tools, audit your site, and generate artifacts in Cascade.",
};

export default function WindsurfHarnessPage() {
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
          <Link href="/docs/harnesses/windsurf" className="hover:text-foreground transition-colors">
            Harnesses
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Windsurf</span>
        </nav>

        <Badge variant="secondary" className="mb-3">
          Harness: Windsurf
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">geoaeo for Windsurf</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Connect the geoaeo MCP server to Windsurf. Audit a site and generate GEO and AEO artifacts from Cascade.
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
            <li>Windsurf (latest)</li>
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
          <p>Windsurf starts geoaeo-mcp for you. You do not run it by hand.</p>

          <h2>Configure the MCP server</h2>
          <p>
            Windsurf reads MCP servers from <code>~/.codeium/windsurf/mcp_config.json</code>. Use{" "}
            <code>mcpServers</code> with <code>command</code> and <code>args</code>.
          </p>
          <p>
            Add this entry to <code>~/.codeium/windsurf/mcp_config.json</code>:
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
            If the file does not exist, create it with the block above. If it exists, merge the <code>geoaeo</code> key
            under <code>mcpServers</code>.
          </p>
          <p>Steps:</p>
          <ol>
            <li>
              Open <code>~/.codeium/windsurf/mcp_config.json</code>.
            </li>
            <li>
              Paste the block. Validate JSON with <code>cat ~/.codeium/windsurf/mcp_config.json | jq .</code>.
            </li>
            <li>Restart Windsurf.</li>
            <li>Open Cascade and check MCP servers. Confirm geoaeo shows as connected with 3 tools.</li>
          </ol>
          <p>
            Alternative project config some builds read: <code>.windsurf/mcp_config.json</code> with the same shape. Use
            the global file first.
          </p>

          <h2>Verify the connection</h2>
          <ol>
            <li>Open Cascade (Cmd+L).</li>
            <li>Ask: &quot;What MCP tools does geoaeo provide?&quot;</li>
            <li>
              Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear.
            </li>
          </ol>
          <p>If the server shows as error, see Troubleshooting.</p>

          <h2>Walkthrough 1 — audit a site</h2>
          <p>Prompt Cascade:</p>
          <blockquote>
            <p>Audit ./ with geoaeo and give me the score plus the 3 most important fixes. If you need a URL, use https://example.com.</p>
          </blockquote>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>audit</code> with <code>{`{"target": "./"}`}</code> or{" "}
              <code>{`{"target": "https://example.com"}`}</code>.
            </li>
            <li>
              Receives JSON: <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>.
            </li>
            <li>Summarizes the score and fixes.</li>
          </ol>
          <p>Equivalent CLI:</p>
          <pre>
            <code>{`npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json`}</code>
          </pre>
          <p>
            Use <code>topFixes</code> to decide which artifact to generate next.
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
              Prompt Cascade:
              <blockquote>
                <p>Use geoaeo gen to create llms.txt for this site. Show the first 40 lines and write the full file to public/llms.txt.</p>
              </blockquote>
            </li>
          </ol>
          <p>What the agent does:</p>
          <ol>
            <li>
              Calls <code>gen</code> with <code>{`{"artifact": "llms"}`}</code>.
            </li>
            <li>Returns the text.</li>
            <li>
              Writes it to <code>public/llms.txt</code> on confirmation.
            </li>
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
npx geoaeo gen llms -o ./public/llms.txt
npx geoaeo gen jsonld --type breadcrumb -o ./public/jsonld.json`}</code>
          </pre>
          <p>
            The <code>humanize</code> tool is also available: <code>{`{"glob": "content/**/*.md", "write": false}`}</code>.
          </p>

          <h2>Troubleshooting</h2>
          <p>
            <strong>MCP server shows Failed to start or ENOENT.</strong> Run <code>which npx</code> and{" "}
            <code>node --version</code> in Windsurf&apos;s terminal. If Node is not on PATH, add it or use the absolute
            path to npx in <code>command</code>.
          </p>
          <p>
            <strong>Config file not found.</strong> Confirm the path is{" "}
            <code>~/.codeium/windsurf/mcp_config.json</code> (not <code>~/.windsurf/...</code>). Run{" "}
            <code>ls -la ~/.codeium/windsurf/mcp_config.json</code>.
          </p>
          <p>
            <strong>JSON parse error.</strong> Validate with <code>jq</code>. Ensure no trailing comma after the last
            entry in <code>mcpServers</code>.
          </p>
          <p>
            <strong>audit returns empty result.</strong> Use <code>{`{"target": "./"}`}</code> from the workspace root.
            Ensure the directory contains site files. For a URL, include the scheme <code>https://</code>.
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
