# geoaeo for Windsurf

Connect the geoaeo MCP server to Windsurf. Use it to audit a site and generate GEO/AEO artifacts from Cascade.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx geoaeo-mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Windsurf (latest).
*   A site directory or URL to audit.

## Install geoaeo

```bash
# one-off
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP binary
npx geoaeo-mcp --help
```

Windsurf starts `geoaeo-mcp` for you. You do not run it by hand.

## Configure the MCP server

Windsurf reads MCP servers from `~/.codeium/windsurf/mcp_config.json`. Use `mcpServers` with `command` and `args`.

Add this entry to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  }
}
```

If the file does not exist, create it with the block above. If it exists, merge the `geoaeo` key under `mcpServers`.

Steps:

1.  Open `~/.codeium/windsurf/mcp_config.json`.
2.  Paste the block. Validate JSON with `cat ~/.codeium/windsurf/mcp_config.json | jq .`.
3.  Restart Windsurf.
4.  Open Cascade and check MCP servers. Confirm `geoaeo` shows as connected with 3 tools.

Alternative project config some builds read: `.windsurf/mcp_config.json` with the same shape. Use the global file first.

## Verify the connection

1.  Open Cascade (Cmd+L).
2.  Ask: "What MCP tools does geoaeo provide?"
3.  Confirm `audit`, `gen`, and `humanize` appear.

If the server shows as error, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt Cascade:

> Audit ./ with geoaeo and give me the score plus the 3 most important fixes. If you need a URL, use https://example.com.

What the agent does:

1.  Calls `audit` with `{"target": "./"}` or `{"target": "https://example.com"}`.
2.  Receives JSON: `score`, `checks[]`, `topFixes[]`.
3.  Summarizes the score and fixes.

Equivalent CLI:

```bash
npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json
```

Use `topFixes` to decide which artifact to generate next.

## Walkthrough 2 — generate an artifact with gen

This uses `gen`, which reads `geoaeo.config.ts` from the current directory.

1.  Scaffold config if missing:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt Cascade:

> Use geoaeo gen to create llms.txt for this site. Show the first 40 lines and write the full file to public/llms.txt.

What the agent does:

1.  Calls `gen` with `{"artifact": "llms"}`.
2.  Returns the text.
3.  Writes it to `public/llms.txt` on confirmation.

Other artifacts:

*   `{"artifact": "llms-full"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "webmcp"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.

Equivalent CLI:

```bash
npx geoaeo gen llms
npx geoaeo gen llms -o ./public/llms.txt
npx geoaeo gen jsonld --type breadcrumb -o ./public/jsonld.json
```

The `humanize` tool is also available: `{"glob": "content/**/*.md", "write": false}`.

## Troubleshooting

**MCP server shows "Failed to start" or ENOENT.**
Run `which npx` and `node --version` in Windsurf's terminal. If Node is not on PATH, add it or use the absolute path to npx in `command`.

**Config file not found.**
Confirm the path is `~/.codeium/windsurf/mcp_config.json` (not `~/.windsurf/...`). Run `ls -la ~/.codeium/windsurf/mcp_config.json`.

**JSON parse error.**
Validate with `jq`. Ensure no trailing comma after the last entry in `mcpServers`.

**audit returns empty result.**
Use `{"target": "./"}` from the workspace root. Ensure the directory contains site files. For a URL, include the scheme `https://`.

**gen fails with "Cannot find config".**
Run `npx geoaeo init ./` in the workspace root, then retry `gen`.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
