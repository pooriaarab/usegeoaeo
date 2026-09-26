import type { Metadata } from "next";
import { HarnessDocPage } from "@/components/docs/harness-doc-page";
import { HarnessWhatYouGet } from "@/components/docs/harness-what-you-get";
import { InstallThePlugin } from "@/components/docs/install-the-plugin";

export const metadata: Metadata = {
  title: "geoaeo in Muse — MCP setup, audit, and gen guide",
  description:
    "Connect geoaeo to Muse with the geoaeo-mcp server. Set up ~/.codex/config.toml, verify three tools, audit your site, and generate artifacts.",
};

const intro =
  "Connect the geoaeo MCP server to Muse. Audit a site and generate GEO and AEO artifacts from the agent.";

export default function CodexHarnessPage() {
  return (
    <HarnessDocPage slug="codex" name="Muse" intro={intro}>
      <HarnessWhatYouGet />
      <Prerequisites />
      <InstallThePlugin harness="codex" />
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
        <li>Muse installed (codex on PATH)</li>
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
      <p>You do not run geoaeo mcp by hand when Codex manages it.</p>
    </>
  );
}

function ConfigureMcpServer() {
  return (
    <>
      <h2>Configure the MCP server</h2>
      <p>
        Codex reads MCP servers from <code>~/.codex/config.toml</code>. Add a{" "}
        <code>mcp_servers.geoaeo</code> entry. Codex uses TOML for this file, not JSON.
      </p>
      <p>Copy this block into ~/.codex/config.toml:</p>
      <pre>
        <code>{`[mcp_servers.geoaeo]
command = "npx"
args = ["-y", "geoaeo", "mcp"]`}</code>
      </pre>
      <p>If your Codex build reads JSON config, the equivalent JSON is:</p>
      <pre>
        <code>{`{
  "mcp_servers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo", "mcp"]
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
        Start a new Codex session and confirm the server loads. Run <code>codex mcp list</code> if
        your build supports it, or check the startup log for <code>geoaeo: connected</code>.
      </p>
    </>
  );
}

function VerifyConnection() {
  return (
    <>
      <h2>Verify the connection</h2>
      <ol>
        <li>
          Open the repo with <code>codex</code>.
        </li>
        <li>Ask: &quot;List available MCP tools.&quot;</li>
        <li>
          Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear under{" "}
          <code>geoaeo</code>.
        </li>
      </ol>
      <p>If no tools appear, see Troubleshooting.</p>
    </>
  );
}

function AuditWalkthrough() {
  return (
    <>
      <h2>Walkthrough 1 — audit a site</h2>
      <p>Prompt the agent:</p>
      <blockquote>
        <p>
          Use geoaeo audit on https://example.com and summarize the score and the top 3 fixes. If
          that URL is not reachable, audit ./ instead.
        </p>
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
    </>
  );
}

function GenWalkthrough() {
  return (
    <>
      <h2>Walkthrough 2 — generate an artifact with gen</h2>
      <p>
        This uses <code>gen</code>, which reads <code>geoaeo.config.ts</code> in the current working
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
          Prompt the agent:
          <blockquote>
            <p>
              Use geoaeo gen to create the sitemap for this site. Then write it to
              public/sitemap.xml.
            </p>
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
          <code>{`{"artifact": "robots"}`}</code>
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
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen jsonld --type faq`}</code>
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
        <strong>Config file not loaded.</strong> Confirm the path is{" "}
        <code>~/.codex/config.toml</code>. Run <code>ls -la ~/.codex/config.toml</code> and{" "}
        <code>cat ~/.codex/config.toml</code>. Ensure the header is exactly{" "}
        <code>[mcp_servers.geoaeo]</code>. Restart Codex.
      </p>
      <p>
        <strong>npx fails or hangs.</strong> Run <code>npx -y geoaeo mcp</code> manually. It should
        wait on stdin. Press Ctrl+C. If it fails, update Node to 20+ and check npm registry access.
      </p>
      <p>
        <strong>audit returns Cannot find target.</strong> Use an absolute path or a full https URL.
        For local dirs, run from the repo root so <code>./</code> resolves correctly.
      </p>
      <p>
        <strong>gen returns Cannot find config.</strong> Run <code>npx geoaeo init ./</code> in the
        project root.
      </p>
      <p>
        <strong>Tools appear but calls time out.</strong> Check that stdio is not blocked by a
        wrapper script. Use the exact command <code>npx</code> with args{" "}
        <code>[&quot;-y&quot;, &quot;geoaeo&quot;, &quot;mcp&quot;]</code>.
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
          <code>artifact</code> enum and optional <code>type</code> enum. <code>humanize</code>{" "}
          takes <code>glob</code> (string) and optional <code>write</code> (boolean).
        </li>
      </ul>
    </>
  );
}
