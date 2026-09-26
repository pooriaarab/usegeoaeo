import type { Metadata } from "next";
import { HarnessDocPage } from "@/components/docs/harness-doc-page";
import { HarnessWhatYouGet } from "@/components/docs/harness-what-you-get";
import { InstallThePlugin } from "@/components/docs/install-the-plugin";

export const metadata: Metadata = {
  title: "geoaeo in Cursor — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Cursor with the geoaeo-mcp server. Configure .cursor/mcp.json, verify three tools, audit your site, and generate artifacts from Chat.",
};

const intro =
  "Connect the geoaeo MCP server to Cursor. Audit a site and generate GEO and AEO artifacts from Cursor Chat and Agent.";

export default function CursorHarnessPage() {
  return (
    <HarnessDocPage slug="cursor" name="Cursor" intro={intro}>
      <HarnessWhatYouGet />
      <Prerequisites />
      <InstallThePlugin harness="cursor" />
      <InstallGeoaeo />
      <ConfigureMcpServer />
      <VerifyConnection />
      <AuditWalkthrough />
      <GenWalkthrough />
      <GenArtifactReference />
      <Troubleshooting />
      <Reference />
    </HarnessDocPage>
  );
}

function Prerequisites() {
  return (
    <>
      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 20 or later</li>
        <li>Cursor (latest)</li>
        <li>A site directory or URL to audit</li>
      </ul>
    </>
  );
}

function InstallGeoaeo() {
  return (
    <>
      <h2>Install geoaeo</h2>
      <pre>
        <code>{`# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP server starts (it waits on stdin; Ctrl+C to stop)
npx -y geoaeo mcp`}</code>
      </pre>
      <p>Cursor starts geoaeo mcp for you. You do not run it by hand.</p>
    </>
  );
}

function ConfigureMcpServer() {
  return (
    <>
      <h2>Configure the MCP server</h2>
      <p>
        Cursor reads MCP servers from <code>.cursor/mcp.json</code> (project scope) or{" "}
        <code>~/.cursor/mcp.json</code> (global scope). Use <code>mcpServers</code> with{" "}
        <code>command</code> and <code>args</code>.
      </p>
      <p>
        Create <code>.cursor/mcp.json</code> in the repo root:
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
      <p>Steps:</p>
      <ol>
        <li>
          Create the file at <code>.cursor/mcp.json</code>.
        </li>
        <li>Paste the block above. Validate JSON.</li>
        <li>Reload Cursor (Developer: Reload Window) or restart Cursor.</li>
        <li>
          Open Cursor Settings &gt; Features &gt; MCP. Confirm <code>geoaeo</code> shows as
          connected with 3 tools.
        </li>
      </ol>
      <p>
        For global install, use the same block in <code>~/.cursor/mcp.json</code>.
      </p>
    </>
  );
}

function VerifyConnection() {
  return (
    <>
      <h2>Verify the connection</h2>
      <ol>
        <li>Open Cursor Chat (Cmd+L / Ctrl+L).</li>
        <li>Ask: &quot;List MCP tools for geoaeo.&quot;</li>
        <li>
          Confirm <code>audit</code>, <code>gen</code>, <code>humanize</code> appear.
        </li>
      </ol>
      <p>If the server shows as error, see Troubleshooting.</p>
    </>
  );
}

function AuditWalkthrough() {
  return (
    <>
      <h2>Walkthrough 1 — audit a site</h2>
      <p>Prompt Cursor:</p>
      <blockquote>
        <p>Audit the local site at ./ with geoaeo. Return the score and the top 3 fixes.</p>
      </blockquote>
      <p>What the agent does:</p>
      <ol>
        <li>
          Calls <code>audit</code> with <code>{`{"target": "./"}`}</code>. For a live site, use{" "}
          <code>{`{"target": "https://example.com"}`}</code>.
        </li>
        <li>
          Receives JSON: <code>score</code>, <code>checks[]</code>, <code>topFixes[]</code>,{" "}
          <code>pages[]</code>.
        </li>
        <li>Summarizes the result in chat.</li>
      </ol>
      <p>Equivalent CLI:</p>
      <pre>
        <code>{`npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json`}</code>
      </pre>
      <p>
        Read <code>topFixes</code> to decide which artifact to generate next.
      </p>
    </>
  );
}

function GenWalkthrough() {
  return (
    <>
      <h2>Walkthrough 2 — generate an artifact with gen</h2>
      <p>
        This uses <code>gen</code>, which reads <code>geoaeo.config.ts</code> from the current
        directory.
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
          Prompt Cursor:
          <blockquote>
            <p>
              Use geoaeo gen to create robots.txt for this site. Show the content and write it to
              public/robots.txt.
            </p>
          </blockquote>
        </li>
      </ol>
      <p>What the agent does:</p>
      <ol>
        <li>
          Calls <code>gen</code> with <code>{`{"artifact": "robots"}`}</code>.
        </li>
        <li>Returns the file text.</li>
        <li>
          Writes it to <code>public/robots.txt</code> on confirmation.
        </li>
      </ol>
    </>
  );
}

/** Tail of walkthrough 2: the artifact list and CLI equivalents. */
function GenArtifactReference() {
  return (
    <>
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
          <code>{`{"artifact": "webmcp"}`}</code>
        </li>
        <li>
          <code>{`{"artifact": "jsonld", "type": "software"}`}</code> — type may be{" "}
          <code>software</code>, <code>product</code>, <code>faq</code>, or <code>breadcrumb</code>
        </li>
      </ul>
      <p>Equivalent CLI:</p>
      <pre>
        <code>{`npx geoaeo gen llms
npx geoaeo gen robots -o ./public/robots.txt
npx geoaeo gen jsonld --type product`}</code>
      </pre>
      <p>
        The <code>humanize</code> tool is also available:{" "}
        <code>{`{"glob": "content/**/*.md", "write": false}`}</code>.
      </p>
    </>
  );
}

function Troubleshooting() {
  return (
    <>
      <h2>Troubleshooting</h2>
      <p>
        <strong>MCP shows Failed to connect or ENOENT npx.</strong> Check Node is on PATH inside
        Cursor. Run <code>node --version</code> in Cursor&apos;s terminal. On macOS, ensure Cursor
        was launched after Node was installed. Try absolute command:{" "}
        <code>&quot;/opt/homebrew/bin/npx&quot;</code> or where <code>which npx</code> points.
      </p>
      <p>
        <strong>Config not picked up.</strong> Confirm the file is <code>.cursor/mcp.json</code>{" "}
        (note the dot). Run <code>cat .cursor/mcp.json | jq .</code> to validate JSON. Reload the
        window.
      </p>
      <p>
        <strong>audit returns low score or empty pages.</strong> Audit the repo root that contains{" "}
        <code>geoaeo.config.ts</code>. Cursor&apos;s working directory is the workspace root, so use{" "}
        <code>{`{"target": "./"}`}</code>.
      </p>
      <p>
        <strong>gen returns config error.</strong> Run <code>npx geoaeo init ./</code> to create{" "}
        <code>geoaeo.config.ts</code>. Then retry.
      </p>
      <p>
        <strong>Server starts then exits.</strong> Run <code>npx -y geoaeo mcp</code> in a terminal.
        It should wait on stdin. If it exits, update to Node 20+ and reinstall geoaeo.
      </p>
    </>
  );
}

function Reference() {
  return (
    <>
      <h2>Reference</h2>
      <ul>
        <li>
          Package: <code>geoaeo</code>. Bins: <code>geoaeo</code>, <code>geoaeo-mcp</code>.
        </li>
        <li>Transport: stdio only.</li>
        <li>
          Tools: <code>audit</code> takes <code>target</code> (string). <code>gen</code> takes{" "}
          <code>artifact</code> enum and optional <code>type</code>. <code>humanize</code> takes{" "}
          <code>glob</code> and optional <code>write</code> (boolean).
        </li>
      </ul>
    </>
  );
}
