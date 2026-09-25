export const dynamic = "force-static";

const examplesMd = `# Examples — three GeoWeather targets, three audit scores

The geoaeo package ships a static HTML site, a Next.js App Router app, and an Astro site. Each is the same product (GeoWeather) after \`geoaeo init\`. Scores are from \`geoaeo audit .\` on the source directory under packages/geoaeo/examples/.

- Static HTML — 80/100. Fully optimized on the technical and structured-data checks; the open gaps are answerability signals a real content site adds: a dated/updated stamp, a named author, and Markdown mirrors.
- Next.js App Router — 48/100 as a source directory. Understates the live result because route handlers generate llms.txt, sitemap, robots, WebMCP, and .md mirrors at runtime. Audit the deployed URL for the true score.
- Astro — 46/100 as a source directory. Understates because titles, meta, and JSON-LD appear only after astro build. Audit the built dist/ or the deployed URL.

Source-directory audits understate framework apps: the files on disk are not what engines fetch.

## Reproduce a score

    npx geoaeo audit ./packages/geoaeo/examples/static-html
    npx geoaeo audit ./packages/geoaeo/examples/nextjs-app
    npx geoaeo audit ./packages/geoaeo/examples/astro-site

HTML version: https://usegeoaeo.com/examples
`;

export function GET() {
  return new Response(examplesMd, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
