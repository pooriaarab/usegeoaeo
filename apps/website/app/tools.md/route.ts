export const dynamic = "force-static";

const toolsMd = `# Free GEO & AEO tools

Free in-browser tools powered by the open-source geoaeo package.

- Audit a site — score any live URL 0-100 for SEO, GEO, and AEO.
- Generate llms.txt — a short site map for AI answer engines, built from your site facts.
- Generate JSON-LD — schema.org structured data. Kinds: software, product, faq, breadcrumb, organization, website, article, howto, person, review.

The same capabilities ship as an npm package: \`npm install geoaeo\`.

HTML version: https://usegeoaeo.com/tools
`;

export function GET() {
  return new Response(toolsMd, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
