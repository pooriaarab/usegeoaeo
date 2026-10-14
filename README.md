# geoaeo

<a href="https://www.npmjs.com/package/geoaeo"><img src="https://img.shields.io/npm/v/geoaeo" alt="npm geoaeo 0.6.0"/></a>
[![Downloads/month](https://img.shields.io/npm/dm/geoaeo)](https://www.npmjs.com/package/geoaeo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Docs](https://usegeoaeo.com/docs) · [Setup](https://usegeoaeo.com/docs/install) · [CLI reference](https://usegeoaeo.com/docs/cli) · [MCP reference](https://usegeoaeo.com/docs/mcp) · [Compare](#compare) · [llms.txt](https://usegeoaeo.com/llms.txt)

geoaeo is an open-source site audit and artifact generator for developers. It checks search engine optimization (SEO), generative-engine optimization (GEO), and answer-engine optimization (AEO) signals. It returns a score and generates discovery files from your site configuration.

## Install

```bash
npm install geoaeo
```

Requires Node.js 20 or newer. The package includes TypeScript types, ES module and CommonJS exports, and five direct dependencies.

## Send your first audit

```bash
npx geoaeo audit https://example.com
```

No environment variables or API keys are required. Success prints the target, a score out of 100, PASS/FAIL checks, and top fixes.
Scores depend on the fetched content; a completed audit does not require a passing score.

For a deterministic local generator example, save this as `example.mjs`:

```js
import { defineConfig, generateLlms } from 'geoaeo';
const config = defineConfig({
  siteName: 'Reply Kit',
  siteUrl: 'https://example.com',
  description: 'A tool that drafts replies.',
  tools: [],
});
process.stdout.write(generateLlms(config));
```

Run `node example.mjs`. Success prints Markdown headed `# Reply Kit`.

## How it works

```text
URL or directory -> snapshot -> 32 weighted checks -> score and top fixes
SiteConfig -> generator -> discovery text, XML, JSON, HTML, or SVG
CLI / agent -> audit, generation, prose checks -> shared library behavior
```

Generators use your configuration; they do not discover your business facts.
The repository includes the npm package, the public website, and Workers for website tools.

## Why it exists

Developers need repeatable checks and generated discovery artifacts in their build workflows.
Yoast SEO provides WordPress editing and metadata workflows. Lighthouse audits web page quality.
geoaeo exposes configuration-driven artifact generation and discovery checks through code, a CLI, and Model Context Protocol (MCP).

## Compare

Scope checked on 2026-10-14 against [Yoast SEO](https://yoast.com/wordpress/plugins/seo/) and [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview).

| Scope | geoaeo | Yoast SEO | Lighthouse |
|---|---|---|---|
| Main workflow | Discovery audits and artifact generation | WordPress SEO editing | Web page quality audits |
| Configuration | SiteConfig and command flags | WordPress plugin settings | Audit configuration |
| Execution | Node.js library, CLI, stdio MCP | WordPress | Chrome tooling or CLI |

## Coverage

| Artifact choice | Status | Output |
|---|---|---|
| `llms` | ✓ generator | Short llms.txt |
| `llms-full` | ✓ generator | Detailed llms-full.txt |
| `jsonld` | ✓ generator | JSON-LD structured data |
| `webmcp` | manifest only | WebMCP-style discovery JSON |
| `poppy` | discovery only | Personal Agent Protocol organization and empty web capability |
| `sitemap` | ✓ generator | XML sitemap |
| `robots` | ✓ generator | robots.txt |
| `ogimage` | ✓ generator | SVG image |
| `rss` | ✓ generator | RSS feed |
| `hreflang` | ✓ generator | Alternate-language link tags |
| `mdmirror` | ✓ generator | Markdown content |

The dispatcher has 11 artifact choices. JSON-LD supports 10 kinds: software, product, faq, breadcrumb, organization, website, article, howto, person, review.
Framework detection includes Next.js, Astro, SvelteKit, Nuxt, and Remix; other directories receive static files.
These are implemented generators and templates, not credential-verified integrations with answer engines.
Local tests verify behavior. No ChatGPT, Claude, Perplexity, or Google AI citation outcome is verified by an audit score.

## Common use cases

1. Next.js developers: scaffold discovery routes and review generated site facts.
2. Astro publishers: generate sitemap, robots, and language artifacts from shared configuration.
3. SvelteKit teams: inspect deployed HTML and track audit thresholds in CI.
4. Agent developers: connect Claude Code or Cursor through the stdio MCP server.
5. Static-site maintainers: generate llms.txt and JSON-LD without a framework plugin.

## Features

- **Audits:** 32 weighted checks return a normalized 0–100 score and up to five top fixes. See the [checklist](https://usegeoaeo.com/checklist).
- **Generators:** emit artifacts from a shared site configuration. See [installation](https://usegeoaeo.com/docs/install).
- **Prose checks:** find configured writing patterns and optionally rewrite matching files. See the [CLI reference](https://usegeoaeo.com/docs/cli).
- **Agent tools:** audit, generate, and check prose over stdio. See the [MCP reference](https://usegeoaeo.com/docs/mcp).

## Runtime surfaces

| CLI command | Behavior |
|---|---|
| `geoaeo audit <target>` | Audit a URL or local directory; `--json` returns JSON |
| `geoaeo init [directory]` | Write starter configuration and framework routes or static artifacts |
| `geoaeo gen <artifact>` | Read configuration and print an artifact; `--output` writes a file |
| `geoaeo humanize <glob>` | Report prose findings; `--write` changes files |
| `geoaeo mcp` | Start the stdio MCP server |

The two bins are `geoaeo` and `geoaeo-mcp`.
The three MCP tools are `audit`, `gen`, and `humanize`. MCP `gen` returns text without writing a file.
Library exports include `auditTarget`, `formatAuditReport`, `defineConfig`, `humanizeText`, and the artifact generators.
`init` is a CLI scaffolding command, not an MCP tool.

## Delivery and behavior limits

- Scores measure implemented heuristics. They do not measure rankings, traffic, or citations.
- A local source audit can miss rendered framework output. Audit a deployed URL to inspect served HTML.
- `init` writes placeholder facts. Replace them before publishing; existing files are skipped unless `--force` is set.
- `gen` reads `geoaeo.config.ts`, `.js`, or `.mjs` from the target directory. Configuration executes as code.
- WebMCP output does not register executable browser tools. Poppy output does not implement authentication or a company agent.
- `audit --ci --min-score N` fails below the chosen score. The default threshold is 90.
- `GEOAEO_ALLOWED_ROOTS` optionally limits local paths for supported CLI and MCP operations. HTTP audit targets remain allowed.
- Prose rewrites use fixed rules; review every change before publishing.

## Integration guides

- [Install geoaeo and scaffold framework artifacts](https://usegeoaeo.com/docs/install).
- [Run audits and generate discovery files from the CLI](https://usegeoaeo.com/docs/cli).
- [Configure an agent with the stdio MCP server](https://usegeoaeo.com/docs/mcp).

For an MCP client, use this server configuration:

```json
{"mcpServers":{"geoaeo":{"command":"npx","args":["-y","geoaeo","mcp"]}}}
```

## Status

The package is version 0.6.0. Interfaces can change before 1.0.
The library is MIT licensed. Public case studies are not yet published.
Use the repository issue tracker for support if you have access, or consult the [public docs](https://usegeoaeo.com/docs).

### Contributing

`packages/geoaeo` contains the package; `apps/website` contains the documentation site.
Install workspace dependencies with `bun install`. Run `bun run ci:local` for lint, types, tests, and plugin-skill checks.
Keep library behavior, CLI commands, and MCP tools aligned when changing shared capabilities.

## FAQ

### Which integrations are verified?

geoaeo includes five framework detectors and a static fallback. Tests cover templates and generators; the audit does not credential-check answer engines.

### Does geoaeo provide a managed SEO service?

geoaeo provides a local package and public browser tools. You deploy generated artifacts to your own site.

### How is geoaeo different from Yoast SEO?

geoaeo uses code and commands to audit discovery signals and generate files. [Yoast SEO](https://yoast.com/wordpress/plugins/seo/) provides WordPress SEO editing and metadata workflows.

### How is geoaeo different from Lighthouse?

geoaeo focuses on discovery checks and configuration-driven artifacts. [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) audits web page quality, including performance and accessibility.

### Does geoaeo guarantee citations from ChatGPT or Claude?

geoaeo cannot guarantee citations. Its score reports the checks implemented in the package.

### Can geoaeo audit a local directory?

geoaeo accepts directories and HTTP URLs. Source files can differ from rendered pages, so inspect deployed output as well.

### Does geoaeo require an API key?

geoaeo requires no API key for its library, CLI, or stdio MCP server. URL audits need network access.

### Does geoaeo overwrite my files?

geoaeo skips existing scaffolding files unless `init --force` is set. Generation writes only when an output path is supplied; prose rewriting requires an explicit write option.

## License

MIT.
