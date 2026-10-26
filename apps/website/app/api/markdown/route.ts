import { generateMdmirror } from "geoaeo";
import siteConfig from "../../../geoaeo.config";
import { GET as docs } from "../../docs.md/route";
import { GET as checklist } from "../../checklist.md/route";
import { GET as examples } from "../../examples.md/route";
import { GET as tools } from "../../tools.md/route";
import { markdownGuides } from "../../../src/generated/markdown-guides.generated";
import { markdownResponse } from "../../../src/utils/markdown-http";
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
};

export function GET(request: Request) {
  const path =
    request.headers.get("x-geoaeo-markdown-path") ??
    new URL(request.url).searchParams.get("path") ??
    "/";
  if (!isMarkdownPage(path)) return markdownResponse("# Not Found\n", "/", 404);
  if (Object.hasOwn(mirrors, path)) return mirrors[path]();
  const body = generateMdmirror(siteConfig, {
    path,
    title: path === "/" ? siteConfig.siteName : path.split("/").at(-1),
    body: markdownGuides[path] ?? summaries[path],
  });
  return markdownResponse(body, path);
}
