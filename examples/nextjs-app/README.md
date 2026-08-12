# GeoWeather — Next.js App Router example

This directory is a minimal Next.js App Router site that has been optimized with
`geoaeo`. It includes the scaffolded route handlers, config, and SEO components
that `geoaeo init` produces.

## Commands

```bash
# 1. Check the starting audit score (before geoaeo)
cd examples/nextjs-app
geoaeo audit .

# 2. Scaffold geoaeo artifacts into the project
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
| `examples/nextjs-app` (source dir) | 45 / 100 |

Next.js generates its GEO/AEO artifacts at runtime — route handlers for `sitemap`, `robots`,
`llms.txt`, JSON-LD, and the `.md` mirrors. A static source-dir audit cannot see runtime
output, so it understates the result. Audit the deployed URL for the true score:

```bash
geoaeo audit https://your-app.example.com
```

## What each generated file does

| File | Purpose |
|------|---------|
| `geoaeo.config.ts` | Site metadata, tools, pricing, FAQ |
| `src/app/llms.txt/route.ts` | Short LLM site map (`GET` → plain text) |
| `src/app/llms-full.txt/route.ts` | Full LLM site map with FAQ and pricing |
| `src/app/sitemap.ts` | Dynamic sitemap.xml (`MetadataRoute.Sitemap`) |
| `src/app/robots.ts` | Dynamic robots.txt (`MetadataRoute.Robots`) |
| `src/app/webmcp/route.ts` | WebMCP tool manifest (JSON) |
| `src/app/[page].md/route.ts` | Markdown mirrors of every page |
| `src/components/seo/json-ld.tsx` | Reusable JSON-LD component (Software, Product, FAQ) |