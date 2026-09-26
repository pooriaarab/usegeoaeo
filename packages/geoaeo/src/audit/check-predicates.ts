import type { PageSignals, PageSnapshot } from "./types.js";
import { ANSWERABILITY_WORD_FLOOR, LLMS_FULL_MIN_CHARS } from "./constants.js";
import type { CheckContext } from "./check-types.js";

export function headerNoindex(pages: PageSnapshot[]): boolean {
  return pages.some((page) => /noindex/i.test(page.xRobotsTag ?? ""));
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
