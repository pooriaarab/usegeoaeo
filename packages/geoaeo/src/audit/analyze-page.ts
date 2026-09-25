import { load } from 'cheerio';
import type { PageSignals } from './types.js';
import { extractSourceProse } from './source-prose.js';
import { sourceHas } from './utils.js';

interface HtmlContext {
  source: string;
  visible: string;
  prose: string;
  top: string;
  jsonLdTypes: string[];
  firstParagraph: string;
  questionHeadings: boolean;
  images: ReturnType<ReturnType<typeof load>['prototype']['toArray']>;
  $: ReturnType<typeof load>;
}

function extractJsonLdTypes($: ReturnType<typeof load>): string[] {
  return $('script[type="application/ld+json"]')
    .map((_, element) => $(element).text())
    .get()
    .flatMap(value => {
      try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        const nodes = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as { '@graph'?: unknown[] })['@graph'])
            ? ((parsed as { '@graph': unknown[] })['@graph'])
            : [parsed];
        return nodes.flatMap(node => {
          const type = (node as { '@type'?: string | string[] })?.['@type'];
          return type ? (Array.isArray(type) ? type : [type]) : [];
        });
      } catch {
        return [];
      }
    });
}

// $.root().text() concatenates every descendant text node, including the
// contents of <script>, <style>, and <noscript> tags. A page's word count
// must come from a clone with those stripped, or a JSON-LD block or an
// analytics snippet -- not prose -- clears the answerability word floor.
function extractProse($: ReturnType<typeof load>): string {
  const clone = $.root().clone();
  clone.find('script, style, noscript').remove();
  return clone.text();
}

function buildHtmlContext(source: string): HtmlContext {
  const $ = load(source);
  const visible = $.root().text();
  const prose = extractProse($);
  const top = visible.slice(0, 3000);
  const jsonLdTypes = extractJsonLdTypes($);
  const firstParagraph = $('p').first().text().trim();
  const questionHeadings = $('h2, h3')
    .toArray()
    .some((element: unknown) => $(element as string).text().trim().endsWith('?'));
  const images = $('img').toArray();
  return { source, visible, prose, top, jsonLdTypes, firstParagraph, questionHeadings, images, $ };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function htmlSignalValue(key: keyof PageSignals, ctx: HtmlContext): PageSignals[keyof PageSignals] {
  const table: Record<string, () => unknown> = {
    title: () => ctx.$('title').text().trim().length > 0,
    description: () => !!ctx.$('meta[name="description"]').attr('content')?.trim().length,
    canonical: () => !!ctx.$('link[rel="canonical"]').attr('href')?.trim().length,
    og: () => ctx.$('meta[property^="og:"]').length >= 2,
    twitter: () => ctx.$('meta[name^="twitter:"]').length >= 1,
    jsonLd: () => ctx.jsonLdTypes.length > 0,
    jsonLdTypes: () => ctx.jsonLdTypes,
    h1: () => ctx.$('h1').length > 0,
    earlyFaq: () => /\bfaq\b|frequently asked questions/i.test(ctx.visible.slice(0, 5000)),
    directAnswer: () => ctx.firstParagraph.length >= 40 && ctx.firstParagraph.length <= 600,
    wordCount: () => countWords(ctx.prose),
    questionHeadings: () => ctx.questionHeadings,
    freshness: () => checkHtmlFreshness(ctx),
    author: () => checkHtmlAuthor(ctx),
    headingOrder: () => ctx.$('h1').length === 1 && ctx.$('h2').length >= 1,
    imageAlt: () => checkHtmlImageAlt(ctx),
    metaRobotsOk: () => !/noindex/i.test(ctx.$('meta[name="robots"]').attr('content') ?? ''),
    hreflang: () => ctx.$('link[rel="alternate"][hreflang]').length > 0,
  };
  return table[key]?.() as PageSignals[keyof PageSignals];
}

function checkHtmlFreshness(ctx: HtmlContext): boolean {
  if (ctx.$('time').length > 0) return true;
  if (ctx.$('meta[property="article:published_time"], meta[property="og:updated_time"], meta[name="date"]').length > 0) return true;
  if (/(updated|published|last modified|posted)[^.]{0,40}\b20\d{2}\b/i.test(ctx.top)) return true;
  return ctx.jsonLdTypes.length > 0 && /"date(Published|Modified)"/i.test(ctx.source);
}

function checkHtmlAuthor(ctx: HtmlContext): boolean {
  if (ctx.$('meta[name="author"]').attr('content')?.trim()) return true;
  if (ctx.$('[rel="author"], [itemprop="author"]').length > 0) return true;
  return /"@type"\s*:\s*"Person"/i.test(ctx.source);
}

function checkHtmlImageAlt(ctx: HtmlContext): boolean {
  if (ctx.images.length === 0) return true;
  return ctx.images.every((element: unknown) => (ctx.$(element as string).attr('alt') ?? '').trim().length > 0);
}

function analyzeHtml(source: string): PageSignals {
  const ctx = buildHtmlContext(source);
  const keys: Array<keyof PageSignals> = [
    'title', 'description', 'canonical', 'og', 'twitter', 'jsonLd', 'jsonLdTypes',
    'h1', 'earlyFaq', 'directAnswer', 'wordCount', 'questionHeadings', 'freshness', 'author',
    'headingOrder', 'imageAlt', 'metaRobotsOk', 'hreflang',
  ];
  const result = {} as PageSignals;
  for (const key of keys) result[key] = htmlSignalValue(key, ctx) as never;
  return result;
}

function sourceSignalValue(key: keyof PageSignals, source: string): PageSignals[keyof PageSignals] {
  const table: Record<string, () => unknown> = {
    title: () => sourceHas(source, [/<title[\s>]/i, /metadata\s*=|title\s*:/i]),
    description: () => sourceHas(source, [/name=["']description["']/i, /description\s*:/i]),
    canonical: () => sourceHas(source, [/rel=["']canonical["']/i, /canonical\s*:/i]),
    og: () => sourceHas(source, [/og:title/i, /og:description/i]),
    twitter: () => sourceHas(source, [/twitter:card/i, /twitter:title/i]),
    jsonLd: () => sourceHas(source, [/application\/ld\+json/i, /['"]@type['"]\s*:/i]),
    jsonLdTypes: () => [...source.matchAll(/['"]@type['"]\s*:\s*['"]([^'"]+)['"]/gi)].map(match => match[1]),
    h1: () => sourceHas(source, [/<h1[\s>]/i, /<h1>/i]),
    earlyFaq: () => /\bfaq\b|frequently asked questions/i.test(source.slice(0, 5000)),
    directAnswer: () => sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<p[\s>]/i]),
    // Source files have no DOM. Count leftover tokens after extractSourceProse
    // (imports, attribute values, tags stripped) — not raw source. That
    // undercounts interpolated text, which is safe. The HTML path above
    // counts visible text and is the one that decides a URL audit. The paths
    // differ only in how they get the string they count.
    wordCount: () => countWords(extractSourceProse(source)),
    questionHeadings: () => /<h[23][^>]*>[^<]*\?/i.test(source),
    freshness: () => sourceHas(source, [/date(Published|Modified)/i, /<time[\s>]/i, /(updated|published|last modified)[^.]{0,40}\b20\d{2}\b/i]),
    author: () => sourceHas(source, [/name=["']author["']/i, /rel=["']author["']/i, /itemprop=["']author["']/i, /"@type"\s*:\s*"Person"/i]),
    headingOrder: () => sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<h2[\s>]/i]),
    imageAlt: () => !/<img(?![^>]*\balt=)[^>]*>/i.test(source),
    metaRobotsOk: () => !/noindex/i.test(source),
    hreflang: () => /hreflang/i.test(source),
  };
  return table[key]?.() as PageSignals[keyof PageSignals];
}

function analyzeSource(source: string): PageSignals {
  const keys: Array<keyof PageSignals> = [
    'title', 'description', 'canonical', 'og', 'twitter', 'jsonLd', 'jsonLdTypes',
    'h1', 'earlyFaq', 'directAnswer', 'wordCount', 'questionHeadings', 'freshness', 'author',
    'headingOrder', 'imageAlt', 'metaRobotsOk', 'hreflang',
  ];
  const result = {} as PageSignals;
  for (const key of keys) result[key] = sourceSignalValue(key, source) as never;
  return result;
}

export function analyzePage(source: string, isHtml: boolean): PageSignals {
  return isHtml ? analyzeHtml(source) : analyzeSource(source);
}
