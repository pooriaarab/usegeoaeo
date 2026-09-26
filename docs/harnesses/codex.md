# geoaeo for Muse

Connect the geoaeo MCP server to Muse. Use it to audit a site and generate GEO/AEO artifacts from the agent.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx -y geoaeo mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Muse installed (`codex` on PATH).
*   A site directory or URL to audit.

## Install geoaeo

```bash
# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP server starts (it waits on stdin; Ctrl+C to stop)
npx -y geoaeo mcp
```

You do not run `geoaeo mcp` by hand when Codex manages it.

## Configure the MCP server

Codex reads MCP servers from `~/.codex/config.toml`. Add a `mcp_servers.geoaeo` entry. Codex uses TOML for this file, not JSON.

Copy this block into `~/.codex/config.toml`:

```toml
[mcp_servers.geoaeo]
command = "npx"
args = ["-y", "geoaeo", "mcp"]
```

If your Codex build reads JSON config, the equivalent JSON is:

```json
{
  "mcp_servers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo", "mcp"]
    }
  }
}
```

Apply the change and restart Codex:

```bash
mkdir -p ~/.codex
cat ~/.codex/config.toml
codex --help
```

Start a new Codex session and confirm the server loads. Run `codex mcp list` if your build supports it, or check the startup log for `geoaeo: connected`.

## Verify the connection

1.  Open the repo with `codex`.
2.  Ask: "List available MCP tools."
3.  Confirm `audit`, `gen`, and `humanize` appear under `geoaeo`.

If no tools appear, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt the agent:

> Use geoaeo audit on https://example.com and summarize the score and the top 3 fixes. If that URL is not reachable, audit ./ instead.

What the agent does:

1.  Calls `audit` with `{"target": "https://example.com"}` or `{"target": "./"}`.
2.  Receives JSON with `score`, `checks[]`, `topFixes[]`.
3.  Reports the score and the fixes.

Equivalent CLI:

```bash
npx geoaeo audit https://example.com --json
npx geoaeo audit ./ --json
```

Use `topFixes` to choose the next `gen` call.

## Walkthrough 2 — generate an artifact with gen

This uses `gen`, which reads `geoaeo.config.ts` in the current working directory.

1.  Scaffold config if missing:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt the agent:

> Use geoaeo gen to create the sitemap for this site. Then write it to public/sitemap.xml.

What the agent does:

1.  Calls `gen` with `{"artifact": "sitemap"}`.
2.  Receives XML text.
3.  Writes it to `public/sitemap.xml` (or shows it for review).

Other artifacts:

*   `{"artifact": "llms"}`
*   `{"artifact": "llms-full"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "webmcp"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.

Equivalent CLI:

```bash
npx geoaeo gen llms
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen jsonld --type faq
```

The `humanize` tool is also available: `{"glob": "content/**/* .md", "write": false}`.

## Troubleshooting

**Config file not loaded.**
Confirm the path is `~/.codex/config.toml`. Run `ls -la ~/.codex/config.toml` and `cat ~/.codex/config.toml`. Ensure the header is exactly `[mcp_servers.geoaeo]`. Restart Codex.

**npx fails or hangs.**
Run `npx -y geoaeo mcp` manually. It should wait on stdin. Press Ctrl+C. If it fails, update Node to >= 20 and check npm registry access.

**audit returns "Cannot find target".**
Use an absolute path or a full https URL. For local dirs, run from the repo root so `./` resolves correctly.

**gen returns "Cannot find config".**
Run `npx geoaeo init ./` in the project root. Then retry `gen`.

**Tools appear but calls time out.**
Check that stdio is not blocked by a wrapper script. Use the exact command `npx` with args `["-y", "geoaeo", "mcp"]`. Remove extra env wrappers.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type` enum. `humanize` takes `glob` (string) and optional `write` (boolean).
