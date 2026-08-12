import type { SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

export function sitemapUrls(config: SiteConfig): string[] {
  const paths = ['', ...(config.pages ?? []).map(page => page.replace(/^\/+/, '')), ...config.tools.map(tool => tool.url)];
  return [...new Set(paths.map(path => absoluteUrl(config.siteUrl, path)))];
}

export function generateSitemap(config: SiteConfig): string {
  const entries = sitemapUrls(config)
    .map(url => `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${url === config.siteUrl ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

