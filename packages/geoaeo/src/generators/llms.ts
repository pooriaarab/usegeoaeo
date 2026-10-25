import type { SiteConfig } from "../config.js";
import { absoluteUrl } from "../config.js";

export interface LlmsFullOptions {
  /** ISO date (YYYY-MM-DD). Defaults to config.lastUpdated, then today in UTC. */
  generated?: string;
}

function toolsBlock(config: SiteConfig): string {
  if (config.tools.length === 0) return "- No tools listed.";
  return config.tools
    .map(
      (tool) => `- [${tool.name}](${absoluteUrl(config.siteUrl, tool.url)}): ${tool.description}`,
    )
    .join("\n");
}

function plansBlock(config: SiteConfig): string {
  if (!config.plans?.length) return "- No plans listed.";
  return config.plans
    .map((plan) => {
      const price =
        plan.price === undefined ? "" : ` (${plan.priceCurrency ?? "USD"} ${plan.price})`;
      const description = plan.description ? `: ${plan.description}` : "";
      return `- ${plan.name}${price}${description}`;
    })
    .join("\n");
}

/** The home page plus every configured page, in the order the site lists them. */
function pageEntries(config: SiteConfig): Array<{ label: string; url: string }> {
  const pages = ["", ...(config.pages ?? []).map((page) => page.replace(/^\/+|\/+$/g, ""))];
  return [...new Set(pages)].map((page) => ({
    label: page === "" ? "Home" : (page.split("/").at(-1) ?? page),
    url: absoluteUrl(config.siteUrl, page),
  }));
}

function corePagesBlock(config: SiteConfig): string {
  return pageEntries(config)
    .map(
      (entry) =>
        `- [${entry.label}](${entry.url}): ${
          entry.label === "Home" ? config.description : `The ${entry.label} page.`
        }`,
    )
    .join("\n");
}

function machineReadableBlock(config: SiteConfig): string {
  const entries: Array<[string, string, string]> = [
    ["Full content", "/llms-full.txt", "Site facts, plans, and FAQ answers in one fetch."],
    ["Sitemap", "/sitemap.xml", "Every indexable page URL."],
    ["AI usage policy", "/ai.txt", "What an AI system may summarise, quote, cite, and index."],
  ];
  return entries
    .map(
      ([label, path, description]) =>
        `- [${label}](${absoluteUrl(config.siteUrl, path)}): ${description}`,
    )
    .join("\n");
}

export function generateLlms(config: SiteConfig): string {
  const platformLine = config.platforms?.length
    ? ` It supports ${config.platforms.join(", ")}.`
    : "";
  return `# ${config.siteName}

> ${config.description}

${config.siteName} is ${config.description}.${platformLine}

## Core pages

${corePagesBlock(config)}

## Free tools

${toolsBlock(config)}

## Plans

${plansBlock(config)}

## Machine-readable

${machineReadableBlock(config)}
`;
}

export function generateLlmsFull(config: SiteConfig, options: LlmsFullOptions = {}): string {
  const generated =
    options.generated ?? config.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const platforms = config.platforms?.length
    ? config.platforms.map((platform) => `- ${platform}`).join("\n")
    : "- No platforms listed.";
  const faq = config.faq?.length
    ? config.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n")
    : "No common questions listed.";
  const pages = pageEntries(config)
    .filter((entry) => entry.label !== "Home")
    .map(
      (entry) =>
        `---\n\n<!-- source: ${entry.url} -->\n## ${entry.label}\n\n[${entry.label}](${entry.url})\n`,
    )
    .join("\n");
  return `# ${config.siteName} - full content

> ${config.description}

Generated: ${generated}

---

<!-- source: ${absoluteUrl(config.siteUrl, "/")} -->
## What it is

${config.siteName} is ${config.description}.

## Platforms

${platforms}

## Plans

${plansBlock(config)}

## Free tools

${toolsBlock(config)}

## Common questions

${faq}
${pages ? `\n${pages}` : ""}`;
}
