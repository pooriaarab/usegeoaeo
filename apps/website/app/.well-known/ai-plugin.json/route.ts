import { NextResponse } from "next/server";

export const dynamic = "force-static";

const SITE_URL = "https://usegeoaeo.com";

// No hosted HTTP API / OpenAPI spec — omit `api` field entirely.
// No support contact email published — omit `contact_email`.
const pluginManifest = {
  schema_version: "v1",
  name_for_human: "geoaeo",
  name_for_model: "geoaeo",
  description_for_human:
    "Audit any site for SEO, GEO and AEO and generate answer-engine artifacts.",
  description_for_model:
    "geoaeo audits any site 0-100 for SEO, GEO and AEO and generates llms.txt, sitemaps, JSON-LD, WebMCP and Markdown mirrors. Use via the npm library, CLI, or MCP server (audit, gen, humanize). No hosted HTTP API.",
  auth: { type: "none" },
  logo_url: `${SITE_URL}/favicon.svg`,
  legal_info_url: SITE_URL,
};

export function GET() {
  return NextResponse.json(pluginManifest);
}
