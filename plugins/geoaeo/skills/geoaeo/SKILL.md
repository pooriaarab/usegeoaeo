---
name: geoaeo
description: Make a website discoverable, quotable, and usable by AI answer engines and agents with the geoaeo CLI or MCP tools. Use when the user asks about GEO (Generative Engine Optimization), AEO (Answer Engine Optimization), AI visibility, llms.txt, llms-full.txt, sitemap.xml, robots.txt, JSON-LD structured data, WebMCP manifests, Markdown page mirrors, or removing AI-writing tells from site copy. Runs the audit-fix loop on any target repo or live URL and reports the 0-100 score.
---

# geoaeo

geoaeo scores how well AI answer engines can find, quote, and use a site. It also generates the artifacts that close the gaps. One package ships a CLI (`geoaeo`) and an MCP server (`geoaeo-mcp`). The MCP tools are `audit`, `gen`, and `humanize`.

## Prerequisites

- Node.js 20 or later.
- Run CLI commands with `npx geoaeo ...` from the target repo root.
- If the geoaeo MCP server is configured, call its tools instead of the CLI.

## The audit-fix loop

1. Run `npx geoaeo audit <target>`. The target is a local directory or a live URL. Add `--json` for machine-readable output.
2. Read the score and the FAIL lines. See "Read the score".
3. Fix each gap. See "Match the fix to the gap".
4. Run the audit again on the same target. Confirm the score went up.
5. Repeat until the score stops moving. Some checks need manual page edits. The generators cannot fix those.

Report the before and after scores to the user.

A directory audit walks the tree and skips `.git`, `node_modules`, `.next`, `dist`, and `coverage`. It finds artifact files by name at any depth, so `public/llms.txt` counts. A URL audit fetches artifacts from the site root, so serve them at `/llms.txt`, `/sitemap.xml`, and so on.

## Read the score

The score runs from 0 to 100. Each check has a weight. The score is the earned weight divided by the total weight, rounded. The report ends with "Top fixes": the five heaviest failed checks. Start there.

| Check label | Weight | Pass condition |
| --- | --- | --- |
| `Answer-first content` | 11 | An inspected page has an H1 and an early FAQ signal. |
| `/llms.txt` | 10 | The short site map exists. |
| `/llms-full.txt` | 10 | The full site map exists. |
| `/sitemap.xml` | 10 | A sitemap exists. |
| `JSON-LD` | 10 | At least one page has schema.org JSON-LD. |
| `/robots.txt` | 8 | robots.txt includes a Sitemap URL. |
| `WebMCP manifest` | 8 | A WebMCP-style tool manifest exists. |
| `Page titles` | 6 | Every inspected page has a title. |
| `Meta descriptions` | 6 | Every inspected page has a meta description. |
| `Canonical links` | 6 | Every inspected page has a canonical URL. |
| `Markdown mirrors` | 6 | At least one `.md` page mirror exists. |
| `Open Graph tags` | 5 | Open Graph tags exist on a page. |
| `Twitter tags` | 4 | Twitter card tags exist on a page. |

## Match the fix to the gap

The generators read site facts from `geoaeo.config.ts` in the current directory. If the target has no config, run `npx geoaeo init <dir>` first. Then edit the config and replace the placeholder name, URL, description, tools, plans, faq, and pages with real facts. The output is only as good as the config.

| Failed check | Fix |
| --- | --- |
| `/llms.txt` | `npx geoaeo gen llms -o public/llms.txt` |
| `/llms-full.txt` | `npx geoaeo gen llms-full -o public/llms-full.txt` |
| `/sitemap.xml` | `npx geoaeo gen sitemap -o public/sitemap.xml` |
| `/robots.txt` | `npx geoaeo gen robots -o public/robots.txt` |
| `WebMCP manifest` | `npx geoaeo gen webmcp -o public/webmcp.json` |
| `JSON-LD` | Run `npx geoaeo gen jsonld --type software` (or `product`, `faq`, `breadcrumb`). Embed the output in a `<script type="application/ld+json">` tag on the page. |
| `Markdown mirrors` | Add a `.md` file per page next to the page, or serve `<page>.md` routes. |
| `Page titles` | Edit page metadata by hand. geoaeo has no generator for this. |
| `Meta descriptions` | Edit page metadata by hand. geoaeo has no generator for this. |
| `Canonical links` | Edit page metadata by hand. geoaeo has no generator for this. |
| `Open Graph tags` | Edit page metadata by hand. geoaeo has no generator for this. |
| `Twitter tags` | Edit page metadata by hand. geoaeo has no generator for this. |
| `Answer-first content` | Put a direct answer and an FAQ near the top of a key page. List the same questions in the config `faq` array so `gen jsonld --type faq` and `gen llms-full` include them. |

### Next.js targets

`npx geoaeo init <dir>` detects a Next.js App Router project from `next.config.*` plus `src/app`. It then writes route handlers instead of static files: `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`, `src/app/webmcp/route.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[page].md/route.ts`, and `src/components/seo/json-ld.tsx`. `init` skips existing files unless you pass `--force`.

## Clean the copy

Answer engines quote prose. Strip AI-writing tells from site copy before you call the work done:

```bash
npx geoaeo humanize 'content/**/*.md' --check   # report only, exits non-zero on findings
npx geoaeo humanize 'src/**/*.tsx' --write      # rewrite files in place
```

The humanizer reads `.md`, `.mdx`, `.tsx`, `.jsx`, and `.txt` files. It keeps frontmatter, code fences, and JSX intact.

## Rules

- Do not invent geoaeo commands or flags. The full CLI surface is `audit`, `init`, `gen`, `humanize`, and `mcp`.
- `gen` fails without `geoaeo.config.ts` in the current directory. Run `init` first on a fresh repo.
- Prefer `init` once over many `gen` calls when a repo needs several artifacts.
