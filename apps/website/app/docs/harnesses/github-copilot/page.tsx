import type { Metadata } from "next";
import { HarnessDocPage } from "@/components/docs/harness-doc-page";
import { HarnessWhatYouGet } from "@/components/docs/harness-what-you-get";

export const metadata: Metadata = {
  title: "geoaeo in GitHub Copilot — MCP setup, audit and gen guide",
  description:
    "Connect geoaeo to GitHub Copilot in VS Code with the geoaeo-mcp server. Configure .vscode/mcp.json, verify tools in Agent mode, audit, and generate.",
};

const intro =
  "Connect the geoaeo MCP server to GitHub Copilot in VS Code. Audit a site and generate GEO and AEO artifacts from Copilot Chat and agent mode.";

export default function GithubCopilotHarnessPage() {
  return (
    <HarnessDocPage slug="github-copilot" name="GitHub Copilot" intro={intro}>
      <HarnessWhatYouGet />
      <Prerequisites />
      <InstallGeoaeo />
      <ConfigureMcpServer />
      <ConfigureMcpSteps />
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
        <li>VS Code with GitHub Copilot and Copilot Chat</li>
        <li>MCP support enabled in VS Code (Copilot agent mode)</li>
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

# verify the MCP binary
npx geoaeo-mcp --help`}</code>
      </pre>
      <p>VS Code starts geoaeo-mcp for you. You do not run it by hand.</p>
    </>
  );
}

function ConfigureMcpServer() {
  return (
    <>
      <h2>Configure the MCP server</h2>
      <p>
        VS Code reads MCP servers from <code>.vscode/mcp.json</code> (workspace scope) or from your user settings.
        Use <code>servers</code> (VS Code format) or <code>mcpServers</code> where supported. Both shapes are
        shown.
      </p>

      <h3>Workspace scope (recommended)</h3>
      <p>
        Create <code>.vscode/mcp.json</code> in the repo root:
      </p>
      <pre>
        <code>{`{
  "servers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"],
      "type": "stdio"
    }
  }
}`}</code>
      </pre>
      <p>Some VS Code builds use mcpServers as the top-level key instead of servers. If the block above does not load, use this equivalent:</p>
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
    </>
  );
}

/** Second half of the configure section: the step-by-step setup. */
function ConfigureMcpSteps() {
  return (
    <>
      <p>Steps:</p>
      <ol>
        <li>
          Create <code>.vscode/mcp.json</code>.
        </li>
        <li>Paste one block above. Validate JSON.</li>
        <li>Reload VS Code (Developer: Reload Window).</li>
        <li>
          Open Copilot Chat, switch to Agent mode, and check the tools/MCP panel. Confirm <code>geoaeo</code> shows
          with <code>audit</code>, <code>gen</code>, <code>humanize</code>.
        </li>
      </ol>
      <p>
        Global scope: add the same server entry to your VS Code <code>settings.json</code> under{" "}
        <code>chat.mcp.servers</code> or <code>mcp.servers</code> depending on your VS Code version.
      </p>
    </>
  );
}

function VerifyConnection() {
  return (
    <>
      <h2>Verify the connection</h2>
      <ol>
        <li>Open Copilot Chat in Agent mode.</li>
        <li>Ask: &quot;What MCP tools does geoaeo provide?&quot;</li>
        <li>
          Confirm <code>audit</code>, <code>gen</code>, and <code>humanize</code> appear under <code>geoaeo</code>.
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
      <p>Prompt Copilot:</p>
      <blockquote>
        <p>Use geoaeo audit on ./ and summarize the score and the top 3 fixes. If ./ has no pages, try https://example.com.</p>
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
        <li>Reports the score and next steps.</li>
      </ol>
      <p>Equivalent CLI:</p>
      <pre>
        <code>{`npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json`}</code>
      </pre>
      <p>
        Use <code>topFixes</code> to choose the next artifact to generate.
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
          Prompt Copilot:
          <blockquote>
            <p>Use geoaeo gen to create the WebMCP manifest for this site. Show the JSON and write it to public/webmcp.json.</p>
          </blockquote>
        </li>
      </ol>
      <p>What the agent does:</p>
      <ol>
        <li>
          Calls <code>gen</code> with <code>{`{"artifact": "webmcp"}`}</code>.
        </li>
        <li>Returns the JSON manifest.</li>
        <li>
          Writes it to <code>public/webmcp.json</code> on confirmation.
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
          <code>{`{"artifact": "robots"}`}</code>
        </li>
        <li>
          <code>{`{"artifact": "jsonld", "type": "software"}`}</code> — type may be <code>software</code>,{" "}
          <code>product</code>, <code>faq</code>, or <code>breadcrumb</code>
        </li>
      </ul>
      <p>Equivalent CLI:</p>
      <pre>
        <code>{`npx geoaeo gen webmcp
npx geoaeo gen webmcp -o ./public/webmcp.json
npx geoaeo gen llms -o ./public/llms.txt`}</code>
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
        <strong>MCP server not shown in Copilot.</strong> Confirm the file is <code>.vscode/mcp.json</code> (not{" "}
        <code>mcp.json</code> at root). Validate JSON with <code>cat .vscode/mcp.json | jq .</code>. Ensure VS Code
        and Copilot Chat are up to date. Reload the window.
      </p>
      <p>
        <strong>servers vs mcpServers confusion.</strong> VS Code has shipped both keys. If one key does not load,
        try the other. Keep <code>type: &quot;stdio&quot;</code> for the <code>servers</code> shape.
      </p>
      <p>
        <strong>npx ENOENT or Node not found.</strong> Check <code>node --version</code> in VS Code&apos;s
        integrated terminal. On macOS, launch VS Code from a shell that has Node on PATH, or set an absolute{" "}
        <code>command</code> path such as <code>&quot;/opt/homebrew/bin/npx&quot;</code>.
      </p>
      <p>
        <strong>audit returns low score.</strong> Audit the workspace root. Ensure Copilot&apos;s cwd is the repo
        root so <code>{`{"target": "./"}`}</code> resolves there.
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
