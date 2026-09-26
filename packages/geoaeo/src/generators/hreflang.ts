import type { SiteConfig } from "../config.js";
import { normalizeSiteUrl } from "../config.js";

function escapeAttr(value: string): string {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ??
      character,
  );
}

export function generateHreflang(config: SiteConfig, locales: string[] = ["en"]): string {
  const href = `${normalizeSiteUrl(config.siteUrl)}/`;
  const codes = [
    ...new Set(
      (locales.length ? locales : ["en"]).filter((locale) => locale && locale !== "x-default"),
    ),
  ];
  const tags = codes.map(
    (locale) =>
      `<link rel="alternate" hreflang="${escapeAttr(locale)}" href="${escapeAttr(href)}" />`,
  );
  tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(href)}" />`);
  return `${tags.join("\n")}\n`;
}
