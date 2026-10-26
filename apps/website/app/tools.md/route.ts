import { markdownResponse } from "../../src/utils/markdown-http";
export { markdownOptions as OPTIONS } from "../../src/utils/markdown-http";

export const dynamic = "force-static";

const toolsMd = `# Free GEO & AEO tools

Free in-browser tools powered by the open-source geoaeo package.

- [Audit a site](/tools/audit) — score any live URL 0-100 for SEO, GEO, and AEO. The live audit runs in the Node CLI: \`npx geoaeo audit <url>\`.
- [Generate llms.txt](/tools/llms) — a short site map for AI answer engines, built from your site facts.
- [Generate JSON-LD](/tools/jsonld) — schema.org structured data. Kinds: software, product, faq, breadcrumb, organization, website, article, howto, person, review.

The same capabilities ship as an npm package: \`npm install geoaeo\`.

HTML version: https://usegeoaeo.com/tools
`;

export function GET() {
  return markdownResponse(toolsMd, "/tools");
}
