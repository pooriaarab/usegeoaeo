import type { SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

// AI answer-engine crawlers we explicitly welcome. Allowing them is the point of AEO:
// it lets ChatGPT, Claude, Perplexity, Google AI, and others read and cite the site.
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
];

export function generateRobots(config: SiteConfig): string {
  const aiBlocks = AI_AGENTS.map(agent => `User-agent: ${agent}\nAllow: /`).join('\n\n');
  return (
    `User-agent: *\nAllow: /\n\n` +
    `# AI answer engines are welcome to read and cite this site.\n${aiBlocks}\n\n` +
    `Sitemap: ${absoluteUrl(config.siteUrl, '/sitemap.xml')}\n`
  );
}
