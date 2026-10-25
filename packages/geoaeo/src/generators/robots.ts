import type { SiteConfig } from "../config.js";
import { absoluteUrl } from "../config.js";
import { AI_EXCLUDED_PATHS } from "../constants.js";

// Answer engines and user-triggered fetchers. These decide whether ChatGPT,
// Claude, Perplexity, and Google AI can read and cite the site, so they stay
// allowed. The audit reads this list to decide whether a robots policy blocks
// an answer engine.
export const AI_SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
] as const;

// Training crawlers. A site owner may block these and keep citations, because
// the search crawlers above do the fetching for an answer.
export const AI_TRAINING_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
] as const;

/** Every named AI crawler: the search list first, then the training list. */
export const AI_AGENTS: readonly string[] = [...AI_SEARCH_AGENTS, ...AI_TRAINING_AGENTS];

function agentBlocks(agents: readonly string[], allow: boolean): string {
  const rule = allow ? "Allow" : "Disallow";
  return agents.map((agent) => `User-agent: ${agent}\n${rule}: /`).join("\n\n");
}

export function generateRobots(config: SiteConfig): string {
  const trainingAllowed = config.allowTrainingCrawlers !== false;
  const privatePaths = AI_EXCLUDED_PATHS.map((path) => `Disallow: ${path}`).join("\n");
  return (
    `# AI answer engines may read and cite this site.\n` +
    `# Keep this file in sync with /llms.txt and /ai.txt.\n\n` +
    `User-agent: *\nAllow: /\n${privatePaths}\n\n` +
    `${agentBlocks(AI_SEARCH_AGENTS, true)}\n\n` +
    `# Training crawlers. Blocking these does not stop the search crawlers\n` +
    `# above from citing the site.\n` +
    `${agentBlocks(AI_TRAINING_AGENTS, trainingAllowed)}\n\n` +
    `Sitemap: ${absoluteUrl(config.siteUrl, "/sitemap.xml")}\n`
  );
}
