# GeoWeather — Astro site example

This directory is a minimal Astro site that has been optimized with `geoaeo`.
It includes the `geoaeo.config.ts` and the static artifact files that
`geoaeo init` produces for non-Next.js projects.

## Commands

```bash
# 1. Check the starting audit score (before geoaeo)
cd examples/astro-site
geoaeo audit .

# 2. Scaffold geoaeo configuration and static artifacts
geoaeo init .

# 3. Regenerate individual artifacts (optional)
geoaeo gen llms -o llms.txt
geoaeo gen sitemap -o public/sitemap.xml

# 4. Check the final audit score
geoaeo audit .
```

## Audit score

`geoaeo audit .` on the source directory scores:

| Target | Score |
|------|-------|
| `examples/astro-site` (source dir) | 31 / 100 |

Astro renders pages at build time. The `.astro` source holds the titles, meta tags, and
JSON-LD, but they only appear in the HTML after `astro build`. A source-dir audit cannot see
them, so it understates the result. Audit the built `dist/` or the deployed URL for the true
score:

```bash
astro build && geoaeo audit ./dist
geoaeo audit https://your-site.example.com
```

## Generated files

| File | Purpose |
|------|---------|
| `geoaeo.config.ts` | Site metadata, tools, pricing, FAQ |
| `llms.txt` | Short LLM site map (plain text) |
| `llms-full.txt` | Full LLM site map with FAQ and pricing |
| `sitemap.xml` | XML sitemap for search engines |
| `robots.txt` | Crawler policy with sitemap link |
| `webmcp.json` | WebMCP tool manifest for AI agents |