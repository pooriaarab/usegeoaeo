import { defineConfig } from "geoaeo";

export default defineConfig({
  siteName: "geoaeo",
  siteUrl: "https://usegeoaeo.com",
  description:
    "a free, open-source CLI, MCP server, and library that audits any site for SEO, GEO, and AEO, scores it 0-100, and generates llms.txt, sitemaps, JSON-LD, WebMCP, and Markdown mirrors.",
  tools: [
    {
      name: "Site audit",
      url: "https://usegeoaeo.com/tools",
      description: "Score any URL 0-100 for SEO, GEO, and AEO.",
    },
    {
      name: "llms.txt generator",
      url: "https://usegeoaeo.com/tools",
      description: "Generate an llms.txt for your site.",
    },
    {
      name: "JSON-LD generator",
      url: "https://usegeoaeo.com/tools",
      description: "Generate schema.org structured data.",
    },
  ],
  faq: [
    {
      question: "What are GEO and AEO?",
      answer:
        "Generative Engine Optimization and Answer Engine Optimization: making a site easy for AI systems to find, quote, and cite.",
    },
    {
      question: "Is geoaeo free?",
      answer:
        "Yes. geoaeo is free and open source under the MIT license. Install it with npm install geoaeo.",
    },
  ],
  pages: ["/", "/docs", "/checklist", "/examples", "/tools"],
});
