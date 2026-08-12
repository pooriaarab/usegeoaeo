# geoaeo for Continue

Connect the geoaeo MCP server to Continue. Use it to audit a site and generate GEO/AEO artifacts from Continue Chat and Agent.

## What you get

*   CLI bins: `geoaeo` and `geoaeo-mcp`.
*   CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`. No other commands exist.
*   MCP server command: `npx geoaeo-mcp` over stdio.
*   MCP tools: `audit`, `gen`, `humanize`.

## Prerequisites

*   Node.js >= 20.
*   Continue extension in VS Code or JetBrains.
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

Continue starts `geoaeo-mcp` over stdio. You do not run it by hand.

## Configure the MCP server

Continue reads MCP servers from its config file. In recent builds this is `~/.continue/config.yaml` (preferred) or `~/.continue/config.json`. Both formats are shown.

### Option A — config.yaml (preferred)

Add to `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: geoaeo
    command: npx
    args: ["-y", "geoaeo-mcp"]
```

Or with the indexed key form some builds use:

```yaml
experimental:
  mcpServers:
    - name: geoaeo
      command: npx
      args: ["-y", "geoaeo-mcp"]
```

### Option B — config.json

Add to `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "geoaeo",
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  ]
}
```

Steps:

1.  Open `~/.continue/config.yaml` (or `config.json`).
2.  Paste one block above. Validate YAML or JSON.
3.  Reload the editor window or restart the IDE.
4.  Open Continue Chat and check MCP servers. Confirm `geoaeo` shows with `audit`, `gen`, `humanize`.

Project scope: some builds also read `.continue/config.yaml` in the repo root. Use the global file first.

## Verify the connection

1.  Open Continue Chat.
2.  Ask: "What MCP tools does geoaeo provide?"
3.  Confirm `audit`, `gen`, and `humanize` appear.

If no tools appear, see Troubleshooting.

## Walkthrough 1 — audit a site

Prompt Continue:

> Use geoaeo audit on ./ and summarize the score and top fixes. If ./ is not a site, try https://example.com.

What the agent does:

1.  Calls `audit` with `{"target": "./"}` or `{"target": "https://example.com"}`.
2.  Receives JSON: `score`, `checks[]`, `topFixes[]`, `pages[]`.
3.  Reports the score and the next steps.

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

2.  Prompt Continue:

> Use geoaeo gen to create llms-full for this site. Show the first 50 lines.

What the agent does:

1.  Calls `gen` with `{"artifact": "llms-full"}`.
2.  Returns the file text.

Other artifacts:

*   `{"artifact": "llms"}`
*   `{"artifact": "sitemap"}`
*   `{"artifact": "robots"}`
*   `{"artifact": "webmcp"}`
*   `{"artifact": "jsonld", "type": "software"}` — type may be `software`, `product`, `faq`, or `breadcrumb`.

Equivalent CLI:

```bash
npx geoaeo gen llms-full
npx geoaeo gen sitemap -o ./public/sitemap.xml
npx geoaeo gen jsonld --type faq
```

The `humanize` tool is also available: `{"glob": "content/**/*.md", "write": false}`.

## Troubleshooting

**MCP server not shown.**
Check the config file path: `~/.continue/config.yaml` vs `~/.continue/config.json`. Continue loads one file. Validate YAML with `cat ~/.continue/config.yaml` and check indent.

**YAML indent error.**
`mcpServers` is a list. Each entry starts with `- name:`. Keep `command` and `args` indented 4 spaces under the entry.

**npx ENOENT.**
Run `node --version` and `which npx` in the IDE terminal. If Node is not on PATH, use the absolute path in `command`, for example `"/opt/homebrew/bin/npx"`.

**audit returns empty.**
Use `{"target": "./"}` from the workspace root. Ensure the directory contains site files.

**gen fails with "Cannot find config".**
Run `npx geoaeo init ./` in the workspace root, then retry `gen`.

## Reference

*   Package: `geoaeo`. Bins: `geoaeo`, `geoaeo-mcp`.
*   Transport: stdio only.
*   Tools: `audit` takes `target` (string). `gen` takes `artifact` enum and optional `type`. `humanize` takes `glob` and optional `write` (boolean).
