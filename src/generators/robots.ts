import type { SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

export function generateRobots(config: SiteConfig): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(config.siteUrl, '/sitemap.xml')}\n`;
}

