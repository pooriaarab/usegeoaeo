# GeoWeather — Static HTML example

This directory is a plain HTML site that has been optimized with `geoaeo`.
It is the simplest possible target: one `index.html` file with the static
artifacts that `geoaeo init` generates at the site root.

## Commands

```bash
# 1. Create the project directory and index.html, then check the audit
cd examples/static-html
geoaeo audit .

# 2. Scaffold geoaeo configuration and static artifact files
geoaeo init .

# 3. Regenerate individual artifacts (optional)
geoaeo gen llms -o llms.txt
geoaeo gen sitemap -o sitemap.xml

# 4. Check the final audit score
geoaeo audit .
```

## Audit score

This example ships fully optimized. `geoaeo audit .` scores the static files directly:

| Target | Score |
|------|-------|
| `examples/static-html` | 80 / 100 |

It passes every technical and structured-data check. The open gaps are answerability
signals a real content site adds: a dated/updated stamp, a named author, and Markdown
mirrors.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Home page with meta tags, OG, Twitter, and JSON-LD |
| `geoaeo.config.ts` | Site metadata, tools, pricing, FAQ |
| `llms.txt` | Short LLM site map (plain text) |
| `llms-full.txt` | Full LLM site map with FAQ and pricing |
| `sitemap.xml` | XML sitemap for search engines |
| `robots.txt` | Crawler policy with sitemap link |
| `webmcp.json` | WebMCP tool manifest for AI agents |