# geoaeo for Gemini CLI

Connect the geoaeo MCP server to Gemini CLI. Use it to audit a site and generate GEO/AEO artifacts from the Gemini agent.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx geoaeo-mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Gemini CLI installed (`gemini` on PATH).
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

Gemini CLI starts `geoaeo-mcp` over stdio. You do not run it by hand.

## Configure the MCP server

Gemini CLI reads MCP servers from `~/.gemini/settings.json` under `mcpServers`. Use `command` and `args`.

Add this entry to `~/.gemini/settings.json`:

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

If `~/.gemini/settings.json` already exists, merge the `geoaeo` key under `mcpServers`. If it does not exist, create the file with the block above.

Project scope alternative: create `.gemini/settings.json` in the repo root with the same block. Global scope takes precedence in some builds.

Steps:

1.  Create or edit `~/.gemini/settings.json`.
2.  Paste the block. Validate JSON: `cat ~/.gemini/settings.json | jq .`.
3.  Restart Gemini CLI: exit and run `gemini` again.
4.  Run `/mcp` or `gemini mcp list` and confirm `geoaeo` shows with 3 tools.

## Verify the connection

1.  Run `gemini`.
2.  Ask: "What MCP tools does geoaeo provide?"
3.  Confirm `audit`, `gen`, and `humanize` appear.

If no tools appear, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt the agent:

> Use geoaeo audit on ./ and summarize the score and the top fixes. If ./ is empty, use https://example.com.

What the agent does:

1.  Calls `audit` with `{"target": "./"}` or `{"target": "https://example.com"}`.
2.  Receives JSON: `score`, `checks[]`, `topFixes[]`, `pages[]`.
3.  Reports the score and the next steps.

Equivalent CLI:

```bash
npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json
```

Use `topFixes` to choose which artifact to generate next.

## Walkthrough 2 — generate an artifact with gen

This uses `gen`, which reads `geoaeo.config.ts` from the current directory.

1.  Scaffold config if missing:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt the agent:

> Use geoaeo gen to create the JSON-LD for this site as type software. Show the JSON and explain where to place it.

What the agent does:

1.  Calls `gen` with `{"artifact": "jsonld", "type": "software"}`.
2.  Returns formatted JSON-LD.
3.  Advises placement (for example, a `<script type="application/ld+json">` tag in the page head).

Other artifacts:

*   `{"artifact": "llms"}`
*   `{"artifact": "llms-full"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "webmcp"}`

Equivalent CLI:

```bash
npx geoaeo gen jsonld --type software
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen webmcp
```

The `humanize` tool is also available: `{"glob": "content/**/*.md", "write": false}`.

## Troubleshooting

**MCP server not found.**
Confirm `~/.gemini/settings.json` is valid JSON. Run `cat ~/.gemini/settings.json | jq .`. Check Node >= 20 with `node --version`.

**npx ENOENT or permission error.**
Run `npx -y geoaeo-mcp` by hand. It should wait on stdin. If it fails, fix npm cache perms or install Node via nvm.

**audit returns empty or low score.**
Ensure you audit the repo root that contains `geoaeo.config.ts` and site files. Use `{"target": "./"}` when the agent's cwd is the repo root.

**gen fails with "Cannot find config".**
Run `npx geoaeo init ./` in the repo root, then retry.

**Tools appear but calls hang.**
Check that no wrapper overrides stdio. Use exact `command: npx` with `args: ["-y", "geoaeo-mcp"]`. Restart Gemini CLI after edits.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
