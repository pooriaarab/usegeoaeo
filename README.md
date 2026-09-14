# geoaeo

Make any app discoverable, quotable, and usable by AI answer engines.

`geoaeo` audits a site for SEO, GEO, and AEO, scores it 0–100, and generates the files
answer engines need to find, quote, and use it: `llms.txt`, structured data, sitemaps,
robots rules, WebMCP descriptors, and Markdown mirrors.

```bash
npm install geoaeo
npx geoaeo audit https://example.com
```

Free and open source under the MIT license. There is no paid tier.

## Three faces, one package

The same capabilities ship as a library, a CLI, and an MCP server, all at one version.

```ts
import { auditTarget, generateLlms, humanizeText } from "geoaeo";
```

```bash
geoaeo audit <url|dir>   # score 0–100 and list the gaps
geoaeo init [dir]        # scaffold the artifacts into an existing site
geoaeo gen <artifact>    # generate one artifact
geoaeo humanize <files>  # find AI-writing tells in prose
geoaeo mcp               # serve over stdio
```

```jsonc
// Point an MCP client at the server to get the audit, gen, and humanize tools.
{ "mcpServers": { "geoaeo": { "command": "npx", "args": ["-y", "geoaeo-mcp"] } } }
```

`init` detects Next.js, Astro, SvelteKit, Nuxt, and Remix, and writes routes that emit each
artifact. Any other directory gets static files.

## What the audit measures

Twenty weighted checks across answerability, structured data, `llms.txt`, crawlability,
freshness, and E-E-A-T. The score is a number you can put in CI:

```bash
geoaeo audit ./dist --ci --min-score 70
```

The bundled examples score 80 (`static-html`), 48 (`nextjs-app`), and 46 (`astro-site`).
Framework apps score lower because the audit reads source directories, not built output.

## Repo layout

| Path | What it is |
| --- | --- |
| `packages/geoaeo/` | The published npm package: library, CLI, and MCP server. |
| `apps/website/` | [usegeoaeo.com](https://usegeoaeo.com) — docs, the free hosted tools, and the checklist. |
| `workers/` | Cloudflare Workers that back the hosted tools. |
| `docs/` | The GEO/AEO checklist and per-harness setup guides. |

## Documentation

- [Docs](https://usegeoaeo.com/docs) · [Install](https://usegeoaeo.com/docs/install) · [CLI](https://usegeoaeo.com/docs/cli) · [MCP](https://usegeoaeo.com/docs/mcp)
- [The GEO/AEO checklist](https://usegeoaeo.com/checklist)
- [Free hosted tools](https://usegeoaeo.com/tools) — audit a URL, generate `llms.txt` or JSON-LD
- [`AGENTS.md`](./AGENTS.md) — how an agent should discover and drive this project

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md). Run `bun run typecheck`, `bun run test`, and
`bun run build` before you open a pull request.

## License

MIT. See [`LICENSE`](./LICENSE).
