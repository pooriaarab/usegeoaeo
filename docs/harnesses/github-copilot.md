# geoaeo for GitHub Copilot (VS Code)

Connect the geoaeo MCP server to GitHub Copilot in VS Code. Use it to audit a site and generate GEO/AEO artifacts from Copilot Chat and agent mode.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx geoaeo-mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   VS Code with GitHub Copilot and Copilot Chat.
*   MCP support enabled in VS Code (Copilot agent mode).
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

VS Code starts `geoaeo-mcp` for you. You do not run it by hand.

## Configure the MCP server

VS Code reads MCP servers from `.vscode/mcp.json` (workspace scope) or from your user settings. Use `servers` (VS Code format) or `mcpServers` where supported. Both shapes are shown.

### Workspace scope (recommended)

Create `.vscode/mcp.json` in the repo root:

```json
{
  "servers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"],
      "type": "stdio"
    }
  }
}
```

Some VS Code builds use `mcpServers` as the top-level key instead of `servers`. If the block above does not load, use this equivalent:

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

Steps:

1.  Create `.vscode/mcp.json`.
2.  Paste one block above. Validate JSON.
3.  Reload VS Code (Developer: Reload Window).
4.  Open Copilot Chat, switch to Agent mode, and check the tools/MCP panel. Confirm `geoaeo` shows with `audit`, `gen`, `humanize`.

Global scope: add the same server entry to your VS Code `settings.json` under `chat.mcp.servers` or `mcp.servers` depending on your VS Code version.

## Verify the connection

1.  Open Copilot Chat in Agent mode.
2.  Ask: "What MCP tools does geoaeo provide?"
3.  Confirm `audit`, `gen`, and `humanize` appear under `geoaeo`.

If no tools appear, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt Copilot:

> Use geoaeo audit on ./ and summarize the score and the top 3 fixes. If ./ has no pages, try https://example.com.

What the agent does:

1.  Calls `audit` with `{"target": "./"}` or `{"target": "https://example.com"}`.
2.  Receives JSON: `score`, `checks[]`, `topFixes[]`.
3.  Reports the score and next steps.

Equivalent CLI:

```bash
npx geoaeo audit ./ --json
npx geoaeo audit https://example.com --json
```

Use `topFixes` to choose the next artifact to generate.

## Walkthrough 2 — generate an artifact with gen

This uses `gen`, which reads `geoaeo.config.ts` from the current directory.

1.  Scaffold config if missing:

```bash
npx geoaeo init ./
cat geoaeo.config.ts
```

2.  Prompt Copilot:

> Use geoaeo gen to create the WebMCP manifest for this site. Show the JSON and write it to public/webmcp.json.

What the agent does:

1.  Calls `gen` with `{"artifact": "webmcp"}`.
2.  Returns the JSON manifest.
3.  Writes it to `public/webmcp.json` on confirmation.

Other artifacts:

*   `{"artifact": "llms"}`
*   `{"artifact": "llms-full"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.

Equivalent CLI:

```bash
npx geoaeo gen webmcp
npx geoaeo gen webmcp -o ./public/webmcp.json
npx geoaeo gen llms -o ./public/llms.txt
```

The `humanize` tool is also available: `{"glob": "content/**/*.md", "write": false}`.

## Troubleshooting

**MCP server not shown in Copilot.**
Confirm the file is `.vscode/mcp.json` (not `mcp.json` at root). Validate JSON with `cat .vscode/mcp.json | jq .`. Ensure VS Code and Copilot Chat are up to date. Reload the window.

**"servers vs mcpServers" confusion.**
VS Code has shipped both keys. If one key does not load, try the other. Keep `type: "stdio"` for the `servers` shape.

**npx ENOENT or Node not found.**
Check `node --version` in VS Code's integrated terminal. On macOS, launch VS Code from a shell that has Node on PATH, or set an absolute `command` path such as `"/opt/homebrew/bin/npx"`.

**audit returns low score.**
Audit the workspace root. Ensure Copilot's cwd is the repo root so `{"target": "./"}` resolves there.

**gen fails with "Cannot find config".**
Run `npx geoaeo init ./` in the workspace root, then retry `gen`.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
