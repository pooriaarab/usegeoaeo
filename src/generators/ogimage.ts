import type { SiteConfig } from '../config.js';

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}

export function generateOgimage(config: SiteConfig): string {
  const title = escapeXml(config.siteName);
  const siteName = escapeXml(config.siteName);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#38bdf8" stroke-width="4"/>
  <text x="80" y="280" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="64">${title}</text>
  <text x="80" y="360" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="32">${siteName}</text>
</svg>
`;
}
