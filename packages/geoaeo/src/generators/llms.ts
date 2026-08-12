import type { SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

function toolsBlock(config: SiteConfig): string {
  if (config.tools.length === 0) return '- No tools listed.';
  return config.tools
    .map(tool => `- [${tool.name}](${absoluteUrl(config.siteUrl, tool.url)}): ${tool.description}`)
    .join('\n');
}

function plansBlock(config: SiteConfig): string {
  if (!config.plans?.length) return '- No plans listed.';
  return config.plans
    .map(plan => {
      const price = plan.price === undefined ? '' : ` (${plan.priceCurrency ?? 'USD'} ${plan.price})`;
      const description = plan.description ? `: ${plan.description}` : '';
      return `- ${plan.name}${price}${description}`;
    })
    .join('\n');
}

export function generateLlms(config: SiteConfig): string {
  const platformLine = config.platforms?.length
    ? ` It supports ${config.platforms.join(', ')}.`
    : '';
  return `# ${config.siteName}\n\n> ${config.description}\n\n## Product\n\n${config.siteName} is ${config.description}.${platformLine}\n\n## Free tools\n\n${toolsBlock(config)}\n\n## Plans\n\n${plansBlock(config)}\n`;
}

export function generateLlmsFull(config: SiteConfig): string {
  const platforms = config.platforms?.length
    ? config.platforms.map(platform => `- ${platform}`).join('\n')
    : '- No platforms listed.';
  const faq = config.faq?.length
    ? config.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')
    : 'No common questions listed.';
  return `# ${config.siteName}

> ${config.description}

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
`;
}

