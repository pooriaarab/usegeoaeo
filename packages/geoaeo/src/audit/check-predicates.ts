import type { PageSignals, PageSnapshot } from "./types.js";
import { ANSWERABILITY_WORD_FLOOR, LLMS_FULL_MIN_CHARS } from "./constants.js";
import type { CheckContext } from "./check-types.js";

export function headerNoindex(pages: PageSnapshot[]): boolean {
  return pages.some((page) => /noindex/i.test(page.xRobotsTag ?? ""));
}

/**
 * Compare canonicals by the URL they resolve to, not the string as written:
 * `https://a.com` and `https://a.com/` name the same resource, and a relative
 * href resolves against the page that declares it. Path spelling stays
 * significant (`/docs` and `/docs/` are different declarations), and so do
 * scheme, query, and fragment. A directory audit has no origin to resolve
 * relative hrefs against, so those compare as written.
 */
function resolvedCanonical(href: string, pageUrl: string): string {
  try {
    return new URL(href, pageUrl).href;
  } catch {
    try {
      return new URL(href).href;
    } catch {
      return href;
    }
  }
}

/**
 * Every inspected page canonically pointing at one URL (usually the home
 * page) reads to a crawler as "the site is one page" and drops the rest from
 * the index. Returns the declared shared href only when two or more pages all
 * name it; a single page, a page with no canonical, or any differing target
 * keeps the check legal.
 */
export function findSharedCanonical(
  pages: PageSnapshot[],
  signals: PageSignals[],
): string | undefined {
  if (signals.length < 2 || !signals.every((page) => page.canonicalHref.length > 0)) {
    return undefined;
  }
  const resolved = signals.map((page, index) =>
    resolvedCanonical(page.canonicalHref, pages[index]?.url ?? ""),
  );
  return new Set(resolved).size === 1 ? signals[0].canonicalHref : undefined;
}

export function hasOpeningAnswer(page: PageSignals): boolean {
  return page.directAnswer && page.h1;
}

export function hasQuoteBody(page: PageSignals): boolean {
  return page.wordCount >= ANSWERABILITY_WORD_FLOOR;
}

export function isAnswerable(page: PageSignals): boolean {
  return hasOpeningAnswer(page) && hasQuoteBody(page);
}

/** Name which half of answerability failed. A generic miss hides the cause. */
export function answerabilityDetails(ctx: CheckContext): string {
  const opening = ctx.anyPage(hasOpeningAnswer);
  const quote = ctx.anyPage(hasQuoteBody);
  if (ctx.anyPage(isAnswerable)) {
    return "A page opens with a concise, direct answer under a clear H1 and has enough body text to quote.";
  }
  if (opening && !quote) return `Not enough words to quote (need ${ANSWERABILITY_WORD_FLOOR}).`;
  if (!opening && quote) return "No concise direct answer under a clear H1.";
  if (opening && quote)
    return "No single page has both a direct opening answer and enough words to quote.";
  return `No concise direct answer under a clear H1, and not enough words to quote (need ${ANSWERABILITY_WORD_FLOOR}).`;
}

/** FAQ copy without FAQPage schema is invisible structure: engines see the
 * questions but get no typed pairs to quote. Pages without an FAQ section
 * pass: a bare "FAQ" mention (a config field, a file purpose) is not copy. */
export function isFaqSchemaPaired(ctx: CheckContext): boolean {
  return (
    ctx.pageSignals.length > 0 &&
    ctx.pageSignals.every((page) => !page.faqSection || page.faqJsonLd)
  );
}

export function faqSchemaDetails(ctx: CheckContext): string {
  if (!ctx.pageSignals.some((page) => page.faqSection)) {
    return "No FAQ copy found; nothing to pair.";
  }
  if (isFaqSchemaPaired(ctx)) return "FAQ copy pairs with FAQPage JSON-LD.";
  return "FAQ copy found without FAQPage JSON-LD.";
}

export function schemaValidDetails(ctx: CheckContext): string {
  const blocks = ctx.pageSignals.reduce((total, page) => total + page.jsonLdBlocks, 0);
  if (blocks === 0) return "No JSON-LD blocks to validate.";
  if (ctx.allPage((page) => page.jsonLdParseOk)) {
    return `${blocks} JSON-LD block(s) parse with schema.org context.`;
  }
  return "A JSON-LD block failed to parse or misses schema.org context.";
}

/** A body that opens as an HTML document is an error or login page, not the artifact. */
function looksLikeHtmlDocument(text: string): boolean {
  return /^\s*(?:<!--[\s\S]*?-->\s*)*(?:<!doctype\s+html|<html)[\s>]/i.test(text);
}

/**
 * The artifact checks judge a fetched body on what it is, not on whether
 * geoaeo wrote it: a markdown document means at least one line-anchored ATX
 * heading. Directory audits can instead read the route source that generates
 * the artifact (app/llms-full.txt/route.ts), which is why the generator-call
 * branches in the predicates below still count.
 */
function isMarkdownDoc(text: string): boolean {
  const body = text.replace(/^\uFEFF/, "").trim();
  return body.length > 0 && !looksLikeHtmlDocument(body) && /^#{1,6}\s+\S/m.test(body);
}

export function isShortSiteMap(body: string | undefined): boolean {
  const text = body ?? "";
  return /generateLlms/i.test(text) || isMarkdownDoc(text);
}

export function isFullSiteMap(body: string | undefined): boolean {
  const text = (body ?? "").replace(/^\uFEFF/, "").trim();
  return (
    /generateLlmsFull/i.test(text) || (isMarkdownDoc(text) && text.length >= LLMS_FULL_MIN_CHARS)
  );
}

/** A sitemap index file is as much a sitemap as a urlset is. */
export function isSitemapXml(body: string | undefined): boolean {
  return /<urlset|<sitemapindex|generateSitemap|sitemap\s*\(/i.test(body ?? "");
}

export function isRobotsPolicy(body: string | undefined): boolean {
  const text = body ?? "";
  // generateRobots() output always ends with a Sitemap line, so source that
  // names the call counts even though it contains no directives itself.
  return (
    /generateRobots/i.test(text) || (/user-agent\s*:/i.test(text) && /sitemap\s*:/i.test(text))
  );
}

export function isWebmcpManifest(body: string | undefined): boolean {
  return /generateWebmcp|"tools"\s*:|tools\s*[:=]/i.test(body ?? "");
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isHttpsUrl(value: unknown): boolean {
  return typeof value === "string" && /^https:\/\//i.test(value);
}

/**
 * Personal Agent Protocol draft 0.1 document rules that can be read from
 * the file itself. Route source that calls generatePoppy also counts, the
 * same way generateLlms counts for llms.txt.
 */
export function isPoppyDocument(body: string | undefined): boolean {
  const text = body ?? "";
  if (/generatePoppy/i.test(text)) return true;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  const doc = asRecord(parsed);
  if (!doc || typeof doc.protocol_version !== "string" || !/^\d+\.\d+$/.test(doc.protocol_version)) {
    return false;
  }
  if (doc.protocol_version.split(".")[0] !== "0") return false;
  const organization = asRecord(doc.organization);
  if (
    !organization ||
    typeof organization.name !== "string" ||
    !organization.name.trim() ||
    typeof organization.domain !== "string" ||
    !organization.domain.trim()
  ) {
    return false;
  }
  const agent = asRecord(doc.agent);
  const web = asRecord(doc.web);
  const apis = Array.isArray(doc.apis) ? doc.apis : undefined;
  if (!agent && !web && !apis) return false;
  if (apis && (apis.length === 0 || apis.some((entry) => {
    const api = asRecord(entry);
    return !api || typeof api.type !== "string" || !isHttpsUrl(api.url) || typeof api.description !== "string";
  }))) {
    return false;
  }
  const needsAuth = Boolean(agent || apis || web?.browser_session_endpoint);
  if (needsAuth) {
    const auth = asRecord(doc.auth);
    if (!auth || !isHttpsUrl(auth.issuer)) return false;
  }
  return true;
}
