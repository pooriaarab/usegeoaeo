import { generateMdmirror } from "geoaeo/mdmirror";
import siteConfig from "../../../geoaeo.config";
import { GET as docs } from "../../docs.md/route";
import { GET as checklist } from "../../checklist.md/route";
import { GET as examples } from "../../examples.md/route";
import { GET as tools } from "../../tools.md/route";
import { markdownGuides } from "../../../src/generated/markdown-guides.generated";
import { markdownNotFound, markdownResponse } from "../../../src/utils/markdown-http";
import { isMarkdownPage } from "../../../src/utils/markdown-negotiation";

export { markdownOptions as OPTIONS } from "../../../src/utils/markdown-http";

const mirrors: Record<string, () => Response> = {
  "/docs": docs,
  "/checklist": checklist,
  "/examples": examples,
  "/tools": tools,
};
const summaries: Record<string, string> = {
  "/": siteConfig.description,
  "/docs/install":
    "Install geoaeo with `npm install geoaeo`. Use `npx geoaeo init ./` to scaffold a config and artifacts. Requires Node.js 20 or later.",
  "/docs/cli":
    "Run `npx geoaeo audit <url-or-dir>` to score a site. Use `init` to scaffold artifacts, `gen` to generate an artifact, `humanize` to check prose, and `mcp` to start the stdio server.",
  "/docs/mcp":
    "Run `npx geoaeo mcp` over stdio, or use the `geoaeo-mcp` bin. MCP tools: `audit`, `gen`, `humanize`, and `submit`.",
  "/tools/audit":
    "Free live URL audit for SEO, GEO, and AEO, scoring a site 0-100. The live audit fetches with an SSRF guard that needs Node, so on this host run `npx geoaeo audit <url>`.",
  "/tools/llms":
    "Free llms.txt generator: build a short site map for AI answer engines from site name, URL, and description.",
  "/tools/jsonld":
    "Free JSON-LD generator: create schema.org structured data for software, product, faq, breadcrumb, organization, website, article, howto, person, and review.",
};

export function GET(request: Request) {
  const path =
    request.headers.get("x-geoaeo-markdown-path") ??
    new URL(request.url).searchParams.get("path") ??
    "/";
  if (!isMarkdownPage(path)) return markdownNotFound();
  if (Object.hasOwn(mirrors, path)) return mirrors[path]();
  const body = generateMdmirror(siteConfig, {
    path,
    title: path === "/" ? siteConfig.siteName : path.split("/").at(-1),
    body: markdownGuides[path] ?? summaries[path],
  });
  return markdownResponse(body, path);
}
