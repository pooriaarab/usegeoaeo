export const dynamic = "force-static";

const docsMd = `# geoaeo documentation

geoaeo makes any app discoverable and quotable by AI answer engines. SEO plus GEO plus AEO in one package. Install once, audit your site, and generate the files that answer engines read.

## Sections

- Install — https://usegeoaeo.com/docs/install — npm install geoaeo and scaffold your first config.
- CLI reference — https://usegeoaeo.com/docs/cli — audit, init, gen, humanize, mcp, with flags and examples.
- MCP server — https://usegeoaeo.com/docs/mcp — run \`npx geoaeo mcp\` over stdio; tools: audit, gen, humanize.

## Harness guides

Claude Code (.mcp.json), Muse (~/.codex/config.toml), Cursor (.cursor/mcp.json), Windsurf (~/.codeium/windsurf/mcp_config.json), Gemini CLI (~/.gemini/settings.json), GitHub Copilot (.vscode/mcp.json), Continue (~/.continue/config.yaml). Guides live under https://usegeoaeo.com/docs/harnesses/.

## Quick start

    npm install geoaeo
    npx geoaeo audit https://example.com
    npx geoaeo init ./
    npx geoaeo gen llms
    npx geoaeo gen sitemap --output public/sitemap.xml

The MCP server is stdio only. One package, two bins: geoaeo and geoaeo-mcp.

HTML version: https://usegeoaeo.com/docs
`;

export function GET() {
  return new Response(docsMd, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
