import type { Metadata } from "next";
import { HarnessDocPage } from "@/components/docs/harness-doc-page";
import { HarnessWhatYouGet } from "@/components/docs/harness-what-you-get";
import { pageAlternates } from "@/utils/page-alternates";

export const metadata: Metadata = {
  title: "geoaeo in Windsurf — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Windsurf with the geoaeo-mcp server. Configure mcp_config.json, verify three tools, audit your site, and generate artifacts in Cascade.",
  alternates: pageAlternates("/docs/harnesses/windsurf"),
};

const intro =
  "Connect the geoaeo MCP server to Windsurf. Audit a site and generate GEO and AEO artifacts from Cascade.";

export default function WindsurfHarnessPage() {
  return (
    <HarnessDocPage slug="windsurf" name="Windsurf" intro={intro}>
      <HarnessWhatYouGet />
      <Prerequisites />
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
        <li>Windsurf (latest)</li>
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
      <p>Windsurf starts geoaeo mcp for you. You do not run it by hand.</p>
    </>
  );
}

function ConfigureMcpServer() {
  return (
    <>
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
      "args": ["-y", "geoaeo", "mcp"]
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
    </>
  );
}

function VerifyConnection() {
  return (
    <>
      <h2>Verify the connection</h2>
      <ol>
        <li>Open Cascade (Cmd+L).</li>
        <li>Ask: &quot;What MCP tools does geoaeo provide?&quot;</li>
        <li>
          Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear.
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
    </>
  );
}

function GenWalkthrough() {
  return (
    <>
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
    </>
  );
}

function Troubleshooting() {
  return (
    <>
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
          Tools: <code>audit</code> takes <code>target</code> (string). <code>gen</code> takes <code>artifact</code>{" "}
          enum and optional <code>type</code>. <code>humanize</code> takes <code>glob</code> and optional{" "}
          <code>write</code> (boolean).
        </li>
      </ul>
    </>
  );
}
