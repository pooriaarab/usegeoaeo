import type { CheckDef } from "./check-types.js";
import {
  headerNoindex,
  isAnswerable,
  isFaqSchemaPaired,
  isFullSiteMap,
  isRobotsPolicy,
  isShortSiteMap,
  isSitemapXml,
  isWebmcpManifest,
} from "./check-predicates.js";

function artifactChecks(): CheckDef[] {
  return [
    {
      id: "llms",
      label: "/llms.txt",
      weight: 5,
      details: "Short site map is present.",
      passed: (ctx) => isShortSiteMap(ctx.artifacts.get("__llms")),
    },
    {
      id: "llms-full",
      label: "/llms-full.txt",
      weight: 5,
      details: "Full site map is present.",
      passed: (ctx) => isFullSiteMap(ctx.artifacts.get("__llmsFull")),
    },
    {
      id: "sitemap",
      label: "/sitemap.xml",
      weight: 5,
      details: "A sitemap artifact is present.",
      passed: (ctx) => isSitemapXml(ctx.artifacts.get("__sitemap")),
    },
    {
      id: "robots",
      label: "/robots.txt",
      weight: 1,
      details: "Robots policy includes a sitemap URL.",
      passed: (ctx) => isRobotsPolicy(ctx.artifacts.get("__robots")),
    },
    {
      id: "webmcp",
      label: "WebMCP manifest",
      weight: 3,
      details: "A WebMCP-style tool manifest is present.",
      passed: (ctx) => isWebmcpManifest(ctx.artifacts.get("__webmcp")),
    },
  ];
}

function identityChecks(): CheckDef[] {
  return [
    {
      id: "ai-crawlers",
      label: "AI crawler access",
      weight: 3,
      details: "No named AI crawler is disallowed from /.",
      passed: (ctx) => ctx.blockedAiAgents.length === 0,
    },
    {
      id: "markdown",
      label: "Markdown mirrors",
      weight: 4,
      details: "",
      passed: (ctx) => ctx.mirrors.length > 0,
    },
    {
      id: "mcp-card",
      label: "MCP server card",
      weight: 4,
      details: "An MCP server card is published at /.well-known/mcp/server-card.json.",
      passed: (ctx) => ctx.has(ctx.artifacts.get("__mcpCard") ?? ""),
    },
    {
      id: "agent-card",
      label: "Agent card",
      weight: 4,
      details: "An agent card is published at /.well-known/agent-card.json.",
      passed: (ctx) => ctx.has(ctx.artifacts.get("__agentCard") ?? ""),
    },
    {
      id: "agent-skills",
      label: "Agent skills",
      weight: 2,
      details: "An agent-skills index is published under /.well-known/agent-skills/.",
      passed: (ctx) => ctx.has(ctx.artifacts.get("__agentSkills") ?? ""),
    },
  ];
}

function pageMetaChecks(): CheckDef[] {
  return [
    {
      id: "api-catalog",
      label: "API catalog",
      weight: 2,
      details: "An API catalog is published at /.well-known/api-catalog.",
      passed: (ctx) => ctx.has(ctx.artifacts.get("__apiCatalog") ?? ""),
    },
    {
      id: "title",
      label: "Page titles",
      weight: 4,
      details: "Every inspected page has a title.",
      passed: (ctx) => ctx.allPage((page) => page.title),
    },
    {
      id: "description",
      label: "Meta descriptions",
      weight: 4,
      details: "Every inspected page has a meta description.",
      passed: (ctx) => ctx.allPage((page) => page.description),
    },
    {
      id: "canonical",
      label: "Canonical links",
      weight: 3,
      details: "Every inspected page has a canonical URL.",
      passed: (ctx) => ctx.allPage((page) => page.canonical) && ctx.sharedCanonical === undefined,
    },
    {
      id: "open-graph",
      label: "Open Graph tags",
      weight: 3,
      details: "Open Graph tags are present.",
      passed: (ctx) => ctx.anyPage((page) => page.og),
    },
  ];
}

function pageSignalChecks(): CheckDef[] {
  return [
    {
      id: "twitter",
      label: "Twitter tags",
      weight: 2,
      details: "Twitter card tags are present.",
      passed: (ctx) => ctx.anyPage((page) => page.twitter),
    },
    {
      id: "json-ld",
      label: "JSON-LD",
      weight: 5,
      details: "",
      passed: (ctx) => ctx.anyPage((page) => page.jsonLd),
    },
    {
      id: "hreflang",
      label: "hreflang alternates",
      weight: 2,
      details: "Language alternates are declared.",
      passed: (ctx) => ctx.anyPage((page) => page.hreflang),
    },
    {
      id: "meta-robots",
      label: "Indexable",
      weight: 2,
      details: "No page is set to noindex.",
      passed: (ctx) => ctx.allPage((page) => page.metaRobotsOk) && !headerNoindex(ctx.pages),
    },
    {
      id: "image-alt",
      label: "Image alt text",
      weight: 1,
      details: "Every image has alt text.",
      passed: (ctx) => ctx.allPage((page) => page.imageAlt),
    },
  ];
}

function contentChecks(): CheckDef[] {
  return [
    {
      id: "heading-order",
      label: "Heading structure",
      weight: 3,
      details: "A page has one H1 and section H2s.",
      passed: (ctx) => ctx.anyPage((page) => page.headingOrder),
    },
    {
      id: "answerability",
      label: "Answer-first content",
      weight: 9,
      details:
        "A page opens with a concise, direct answer under a clear H1 and has enough body text to quote.",
      passed: (ctx) => ctx.anyPage(isAnswerable),
    },
    {
      id: "qa-framing",
      label: "Question framing",
      weight: 4,
      details: "Content is framed as questions an engine can quote.",
      passed: (ctx) => ctx.anyPage((page) => page.questionHeadings || page.earlyFaq),
    },
    {
      id: "freshness",
      label: "Freshness signals",
      weight: 5,
      details: "Pages show a published or updated date.",
      passed: (ctx) => ctx.anyPage((page) => page.freshness),
    },
    {
      id: "author",
      label: "Author and E-E-A-T",
      weight: 5,
      details: "Pages name an author or organization.",
      passed: (ctx) => ctx.anyPage((page) => page.author),
    },
  ];
}

function schemaChecks(): CheckDef[] {
  return [
    {
      id: "schema-valid",
      label: "Valid JSON-LD",
      weight: 2,
      details: "",
      passed: (ctx) => ctx.allPage((page) => page.jsonLdParseOk),
    },
    {
      id: "faq-schema",
      label: "FAQ schema",
      weight: 3,
      details: "",
      passed: (ctx) => isFaqSchemaPaired(ctx),
    },
  ];
}

function documentChecks(): CheckDef[] {
  return [
    {
      id: "favicon",
      label: "Favicon",
      weight: 1,
      details: "A favicon is declared.",
      passed: (ctx) => ctx.anyPage((page) => page.favicon),
    },
    {
      id: "viewport",
      label: "Viewport tag",
      weight: 2,
      details: "A viewport tag sets width=device-width.",
      passed: (ctx) => ctx.anyPage((page) => page.viewport),
    },
    {
      id: "image-size",
      label: "Sized images",
      weight: 1,
      details: "Every image sets width and height.",
      passed: (ctx) => ctx.allPage((page) => page.imageSized),
    },
    {
      id: "lang",
      label: "Page language",
      weight: 1,
      details: "The document declares its language.",
      passed: (ctx) => ctx.anyPage((page) => page.lang),
    },
  ];
}

export function getCheckDefinitions(): CheckDef[] {
  return [
    ...artifactChecks(),
    ...identityChecks(),
    ...pageMetaChecks(),
    ...pageSignalChecks(),
    ...schemaChecks(),
    ...contentChecks(),
    ...documentChecks(),
  ];
}
