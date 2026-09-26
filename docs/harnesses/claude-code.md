# geoaeo for Claude Code

Connect the geoaeo MCP server to Claude Code. Use it to audit a site and generate GEO/AEO artifacts without leaving the agent.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx -y geoaeo mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Claude Code >= 1.0.60.
*   A site directory or a live URL to audit.

## Install the plugin

Run these two commands in Claude Code:

```
/plugin marketplace add pooriaarab/usegeoaeo
/plugin install geoaeo@geoaeo
```

The plugin starts `npx geoaeo mcp` over stdio. MCP tools are `audit`, `gen`, and `humanize`.

JSON paste below is the fallback if you want to wire the server by hand.

## Install geoaeo

Use npx for zero install, or add it to the project:

```bash
# one-off, no install
npx geoaeo audit ./ --json

# or add to the project
npm install -D geoaeo
npx geoaeo --help

# verify the MCP server starts (it waits on stdin; Ctrl+C to stop)
npx -y geoaeo mcp
```

The MCP server starts over stdio. You do not run it by hand when you use Claude Code.

## Configure the MCP server

Claude Code reads MCP servers from `.mcp.json` in the project root or from your global Claude Code config. Use `command: npx` with `args: ["-y", "geoaeo", "mcp"]`.

### Option A — project scope (recommended)

Create `.mcp.json` in the repo root:

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

### Option B — CLI helper

```bash
claude mcp add geoaeo -- npx -y geoaeo mcp
claude mcp list
```

### Option C — global scope

Add the same `mcpServers.geoaeo` entry to `~/.claude.json` under `mcpServers`.

Restart Claude Code after you change the config. Run `/mcp` to confirm `geoaeo` shows with tools `audit`, `gen`, `humanize`.

If you use a skill in this repo, add `.claude/skills/geoaeo/SKILL.md` as well. Claude Code loads skills automatically.

## Verify the connection

1.  Open the repo in Claude Code.
2.  Run `/mcp`.
3.  Confirm `geoaeo: connected` and 3 tools listed.
4.  Ask: "Use geoaeo audit on the current directory and summarize the top fixes."

If the tool list is empty, check Troubleshooting.

## Walkthrough 1 — audit a site

This shows the `audit` tool. It scores 0-100 and lists missing artifacts.

Prompt the agent:

> Audit the local site at ./ with geoaeo and tell me the 3 most important fixes.

What the agent does:

1.  Calls `audit` with `{"target": "./"}` (or a URL such as `{"target": "https://example.com"}`).
2.  Receives an `AuditReport` as JSON: `score`, `checks[]`, `topFixes[]`, `pages[]`.
3.  Summarizes the score and the top fixes.

Equivalent CLI you can run by hand:

```bash
npx geoaeo audit ./ --json
npx geoaeo audit https://example.com
```

Expected output shape (abridged):

```json
{
  "target": "./",
  "score": 62,
  "checks": [
    { "id": "llms-txt", "passed": false, "details": "Missing llms.txt" }
  ],
  "topFixes": ["Add llms.txt", "Add JSON-LD SoftwareApplication"]
}
```

Use the `topFixes` list to decide which `gen` calls to run next.

## Walkthrough 2 — generate an artifact with gen

This shows the `gen` tool. It reads `geoaeo.config.ts` in the current directory.

1.  Ensure `geoaeo.config.ts` exists:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt the agent:

> Use geoaeo gen to create the llms.txt for this site and show me the first 30 lines.

What the agent does:

1.  Calls `gen` with `{"artifact": "llms"}`.
2.  Returns the file content as text. The agent can write it to `public/llms.txt` or show it inline.

Other artifacts you can request:

*   `{"artifact": "llms-full"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.
*   `{"artifact": "webmcp"}`

Equivalent CLI:

```bash
npx geoaeo gen llms
npx geoaeo gen jsonld --type software
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen robots -o ./public/robots.txt
```

The `humanize` tool is also available: `{"glob": "content/** /*.md", "write": false}`. Set `write: true` to rewrite files in place.

## Troubleshooting

**Server shows as disconnected in `/mcp`.**
Run `npx -y geoaeo mcp` in a terminal. It should wait on stdin (no output). Press Ctrl+C. If npx fails, check Node >= 20 with `node --version` and check network access to npm.

**Config file not picked up.**
Confirm the file is named `.mcp.json` in the repo root (not `mcp.json`). Validate JSON with `cat .mcp.json | jq .`. Restart Claude Code. Check `claude mcp list` shows geoaeo.

**Audit returns empty or low score on a Next.js app.**
Ensure you audit the project root that contains `geoaeo.config.ts`. For local directories, geoaeo scans HTML, TSX, and MDX files and looks for `public/llms.txt`, `app/llms.txt/route.ts`, and similar paths.

**gen returns "Cannot find config".**
Run `npx geoaeo init ./` to scaffold `geoaeo.config.ts`. Then retry `gen` with the same `artifact` value.

**Permission or EACCES on npx cache.**
Run `npm config get cache` and ensure the directory is writable. Try `npx --yes geoaeo mcp` once to prime the cache.

## Reference

*   Package: `geoaeo` on npm. Bins: `geoaeo`, `geoaeo-mcp`.
*   MCP transport: stdio only. No SSE or HTTP transport exists.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` (enum) and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
