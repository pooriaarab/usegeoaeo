# geoaeo for Cursor

Connect the geoaeo MCP server to Cursor. Use it to audit a site and generate GEO/AEO artifacts from Cursor Chat and Agent.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx -y geoaeo mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Cursor (latest).
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

Cursor starts `geoaeo mcp` for you. You do not run it by hand.

## Configure the MCP server

Cursor reads MCP servers from `.cursor/mcp.json` (project scope) or `~/.cursor/mcp.json` (global scope). Use `mcpServers` with `command` and `args`.

Create `.cursor/mcp.json` in the repo root:

```json
{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo", "mcp"]
    }
  }
}
```

Steps:

1.  Create the file at `.cursor/mcp.json`.
2.  Paste the block above. Validate JSON.
3.  Reload Cursor (Developer: Reload Window) or restart Cursor.
4.  Open Cursor Settings > Features > MCP. Confirm `geoaeo` shows as connected with 3 tools.

For global install, use the same block in `~/.cursor/mcp.json`.

## Verify the connection

1.  Open Cursor Chat (Cmd+L / Ctrl+L).
2.  Ask: "List MCP tools for geoaeo."
3.  Confirm `audit`, `gen`, `humanize` appear.

If the server shows as error, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt Cursor:

> Audit the local site at ./ with geoaeo. Return the score and the top 3 fixes.

What the agent does:

1.  Calls `audit` with `{"target": "./"}`. For a live site, use `{"target": "https://example.com"}`.
2.  Receives JSON: `score`, `checks[]`, `topFixes[]`, `pages[]`.
3.  Summarizes the result in chat.

Equivalent CLI:

```bash
npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json
```

Read `topFixes` to decide which artifact to generate next.

## Walkthrough 2 — generate an artifact with gen

This uses `gen`, which reads `geoaeo.config.ts` from the current directory.

1.  Scaffold config if missing:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt Cursor:

> Use geoaeo gen to create robots.txt for this site. Show the content and write it to public/robots.txt.

What the agent does:

1.  Calls `gen` with `{"artifact": "robots"}`.
2.  Returns the file text.
3.  Writes it to `public/robots.txt` on confirmation.

Other artifacts:

*   `{"artifact": "llms"}`
*   `{"artifact": "llms-full"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "webmcp"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.

Equivalent CLI:

```bash
npx geoaeo gen llms
npx geoaeo gen robots -o ./public/robots.txt
npx geoaeo gen jsonld --type product
```

The `humanize` tool is also available: `{"glob": "content/**/*.md", "write": false}`.

## Troubleshooting

**MCP shows "Failed to connect" or "ENOENT npx".**
Check Node is on PATH inside Cursor. Run `node --version` in Cursor's terminal. On macOS, ensure Cursor was launched after Node was installed. Try absolute command: `"/opt/homebrew/bin/npx"` or where `which npx` points.

**Config not picked up.**
Confirm the file is `.cursor/mcp.json` (note the dot). Run `cat .cursor/mcp.json | jq .` to validate JSON. Reload the window.

**audit returns low score or empty pages.**
Audit the repo root that contains `geoaeo.config.ts`. Cursor's working directory is the workspace root, so use `{"target": "./"}`.

**gen returns config error.**
Run `npx geoaeo init ./` to create `geoaeo.config.ts`. Then retry.

**Server starts then exits.**
Run `npx -y geoaeo mcp` in a terminal. It should wait on stdin. If it exits, update to Node >= 20 and reinstall `geoaeo`.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
