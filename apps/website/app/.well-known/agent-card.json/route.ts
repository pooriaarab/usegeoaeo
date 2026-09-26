import { NextResponse } from "next/server";

export const dynamic = "force-static";

const agentCard = {
  name: "geoaeo",
  description:
    "Free, open-source CLI, MCP server, and library that audits any site 0-100 for SEO, GEO, and AEO and generates llms.txt, sitemaps, JSON-LD, WebMCP, and Markdown mirrors.",
  url: "https://usegeoaeo.com",
  provider: {
    organization: "geoaeo",
    url: "https://usegeoaeo.com",
  },
  version: "0.5.0",
  capabilities: {
    audit: true,
    generation: true,
    humanize: true,
  },
  skills: [
    {
      id: "audit",
      name: "audit",
      description:
        "Audit a live URL or local site directory for GEO and AEO gaps.",
    },
    {
      id: "gen",
      name: "gen",
      description:
        "Generate one GEO or AEO artifact from the local site config.",
    },
    {
      id: "humanize",
      name: "humanize",
      description: "Find AI-writing tells in prose files. Set write to update them.",
    },
  ],
};

export function GET() {
  return NextResponse.json(agentCard);
}
