import { load } from "cheerio";
import type { PageSignals } from "./types.js";
import { extractSourceProse } from "./source-prose.js";
import { extractJsonLd, type JsonLdFacts } from "./jsonld-facts.js";
import { sourceHas } from "./utils.js";

interface HtmlContext {
  source: string;
  visible: string;
  prose: string;
  top: string;
  jsonLdTypes: string[];
  jsonLd: JsonLdFacts;
  firstParagraph: string;
  questionHeadings: boolean;
  images: ReturnType<ReturnType<typeof load>["prototype"]["toArray"]>;
  $: ReturnType<typeof load>;
}

// $.root().text() concatenates every descendant text node, including the
// contents of <script>, <style>, and <noscript> tags. A page's word count
// must come from a clone with those stripped, or a JSON-LD block or an
// analytics snippet -- not prose -- clears the answerability word floor.
function extractProse($: ReturnType<typeof load>): string {
  const clone = $.root().clone();
  clone.find("script, style, noscript").remove();
  return clone.text();
}

function buildHtmlContext(source: string): HtmlContext {
  const $ = load(source);
  const visible = $.root().text();
  const prose = extractProse($);
  const top = visible.slice(0, 3000);
  const jsonLd = extractJsonLd($);
  const jsonLdTypes = jsonLd.types;
  const firstParagraph = $("p").first().text().trim();
  const questionHeadings = $("h2, h3")
    .toArray()
    .some((element: unknown) =>
      $(element as string)
        .text()
        .trim()
        .endsWith("?"),
    );
  const images = $("img").toArray();
  return {
    source,
    visible,
    prose,
    top,
    jsonLdTypes,
    jsonLd,
    firstParagraph,
    questionHeadings,
    images,
    $,
  };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function htmlSignalValue(key: keyof PageSignals, ctx: HtmlContext): PageSignals[keyof PageSignals] {
  const table: Record<string, () => unknown> = {
    title: () => ctx.$("title").text().trim().length > 0,
    description: () => !!ctx.$('meta[name="description"]').attr("content")?.trim().length,
    canonical: () => !!ctx.$('link[rel="canonical"]').attr("href")?.trim().length,
    canonicalHref: () => ctx.$('link[rel="canonical"]').attr("href")?.trim() ?? "",
    og: () => ctx.$('meta[property^="og:"]').length >= 2,
    twitter: () => ctx.$('meta[name^="twitter:"]').length >= 1,
    jsonLd: () => ctx.jsonLdTypes.length > 0,
    jsonLdTypes: () => ctx.jsonLdTypes,
    jsonLdBlocks: () => ctx.jsonLd.blocks,
    jsonLdParseOk: () => ctx.jsonLd.parseOk,
    faqJsonLd: () => ctx.jsonLd.faq,
    favicon: () => checkHtmlFavicon(ctx),
    viewport: () => checkHtmlViewport(ctx),
    imageSized: () => checkHtmlImageSized(ctx),
    lang: () => !!ctx.$("html").attr("lang")?.trim(),
    h1: () => ctx.$("h1").length > 0,
    earlyFaq: () => /\bfaq\b|frequently asked questions/i.test(ctx.visible.slice(0, 5000)),
    faqSection: () => checkHtmlFaqSection(ctx),
    directAnswer: () => ctx.firstParagraph.length >= 40 && ctx.firstParagraph.length <= 600,
    wordCount: () => countWords(ctx.prose),
    questionHeadings: () => ctx.questionHeadings,
    freshness: () => checkHtmlFreshness(ctx),
    author: () => checkHtmlAuthor(ctx),
    headingOrder: () => ctx.$("h1").length === 1 && ctx.$("h2").length >= 1,
    imageAlt: () => checkHtmlImageAlt(ctx),
    metaRobotsOk: () => !/noindex/i.test(ctx.$('meta[name="robots"]').attr("content") ?? ""),
    hreflang: () => ctx.$('link[rel="alternate"][hreflang]').length > 0,
  };
  return table[key]?.() as PageSignals[keyof PageSignals];
}

function checkHtmlFreshness(ctx: HtmlContext): boolean {
  if (ctx.$("time").length > 0) return true;
  if (
    ctx.$(
      'meta[property="article:published_time"], meta[property="og:updated_time"], meta[name="date"]',
    ).length > 0
  )
    return true;
  if (/(updated|published|last modified|posted)[^.]{0,40}\b20\d{2}\b/i.test(ctx.top)) return true;
  return ctx.jsonLdTypes.length > 0 && /"date(Published|Modified)"/i.test(ctx.source);
}

function checkHtmlAuthor(ctx: HtmlContext): boolean {
  if (ctx.$('meta[name="author"]').attr("content")?.trim()) return true;
  if (ctx.$('[rel="author"], [itemprop="author"]').length > 0) return true;
  if (/"@type"\s*:\s*"Person"/i.test(ctx.source)) return true;
  return ctx.jsonLdTypes.includes("Organization") || ctx.jsonLdTypes.includes("Brand");
}

function checkHtmlFavicon(ctx: HtmlContext): boolean {
  return ctx
    .$("link[rel]")
    .toArray()
    .some((element: unknown) =>
      (ctx.$(element as string).attr("rel") ?? "").split(/\s+/).includes("icon"),
    );
}

function checkHtmlViewport(ctx: HtmlContext): boolean {
  const content = ctx.$('meta[name="viewport"]').attr("content")?.replace(/\s+/g, "") ?? "";
  return content.split(",").includes("width=device-width");
}

function checkHtmlFaqSection(ctx: HtmlContext): boolean {
  if (/frequently asked questions/i.test(ctx.visible)) return true;
  return ctx
    .$("h1, h2, h3")
    .toArray()
    .some((element: unknown) =>
      /^faqs?$/i.test(
        ctx
          .$(element as string)
          .text()
          .trim(),
      ),
    );
}

function checkHtmlImageSized(ctx: HtmlContext): boolean {
  if (ctx.images.length === 0) return true;
  return ctx.images.every((element: unknown) => {
    const image = ctx.$(element as string);
    return (
      (image.attr("width") ?? "").trim().length > 0 &&
      (image.attr("height") ?? "").trim().length > 0
    );
  });
}

function checkHtmlImageAlt(ctx: HtmlContext): boolean {
  if (ctx.images.length === 0) return true;
  return ctx.images.every(
    (element: unknown) => (ctx.$(element as string).attr("alt") ?? "").trim().length > 0,
  );
}

function analyzeHtml(source: string): PageSignals {
  const ctx = buildHtmlContext(source);
  const keys: Array<keyof PageSignals> = [
    "title",
    "description",
    "canonical",
    "canonicalHref",
    "og",
    "twitter",
    "jsonLd",
    "jsonLdTypes",
    "jsonLdBlocks",
    "jsonLdParseOk",
    "faqJsonLd",
    "favicon",
    "viewport",
    "imageSized",
    "lang",
    "h1",
    "earlyFaq",
    "faqSection",
    "directAnswer",
    "wordCount",
    "questionHeadings",
    "freshness",
    "author",
    "headingOrder",
    "imageAlt",
    "metaRobotsOk",
    "hreflang",
  ];
  const result = {} as PageSignals;
  for (const key of keys) result[key] = htmlSignalValue(key, ctx) as never;
  return result;
}

function extractSourceCanonicalHref(source: string): string {
  const patterns = [
    /rel\s*=\s*["']canonical["'][^>]*?href\s*=\s*["']([^"']+)["']/i,
    /href\s*=\s*["']([^"']+)["'][^>]*?rel\s*=\s*["']canonical["']/i,
    /\bcanonical\s*:\s*["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const href = pattern.exec(source)?.[1]?.trim();
    if (href) return href;
  }
  return "";
}

function sourceSignalValue(key: keyof PageSignals, source: string): PageSignals[keyof PageSignals] {
  const table: Record<string, () => unknown> = {
    title: () => sourceHas(source, [/<title[\s>]/i, /metadata\s*=|title\s*:/i]),
    description: () => sourceHas(source, [/name=["']description["']/i, /description\s*:/i]),
    canonical: () => sourceHas(source, [/rel=["']canonical["']/i, /canonical\s*:/i]),
    canonicalHref: () => extractSourceCanonicalHref(source),
    og: () => sourceHas(source, [/og:title/i, /og:description/i]),
    twitter: () => sourceHas(source, [/twitter:card/i, /twitter:title/i]),
    jsonLd: () => sourceHas(source, [/application\/ld\+json/i, /['"]@type['"]\s*:/i]),
    jsonLdTypes: () =>
      [...source.matchAll(/['"]@type['"]\s*:\s*['"]([^'"]+)['"]/gi)].map((match) => match[1]),
    // Source holds the constructor (usually JSON.stringify of an object),
    // not a rendered block, so the block count stays zero and validity is
    // judged on rendered HTML only.
    jsonLdBlocks: () => 0,
    jsonLdParseOk: () => true,
    faqJsonLd: () => /FAQPage/.test(source) && /acceptedAnswer/.test(source),
    favicon: () => sourceHas(source, [/rel\s*=\s*["'][^"']*\bicon\b/i, /icons\s*:/i]),
    viewport: () =>
      sourceHas(source, [/<meta[^>]*content=["'][^"']*width\s*=\s*device-width/i, /viewport\s*:/i]),
    imageSized: () => checkSourceImageSized(source),
    lang: () => /<html[^>]*\blang\s*=/i.test(source),
    h1: () => sourceHas(source, [/<h1[\s>]/i, /<h1>/i]),
    earlyFaq: () => /\bfaq\b|frequently asked questions/i.test(source.slice(0, 5000)),
    faqSection: () =>
      sourceHas(source, [/frequently asked questions/i, /<h[123][^>]*>\s*faqs?\s*</i]),
    directAnswer: () => sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<p[\s>]/i]),
    // Source files have no DOM. Count leftover tokens after extractSourceProse
    // (imports, attribute values, tags stripped) — not raw source. That
    // undercounts interpolated text, which is safe. The HTML path above
    // counts visible text and is the one that decides a URL audit. The paths
    // differ only in how they get the string they count.
    wordCount: () => countWords(extractSourceProse(source)),
    questionHeadings: () => /<h[23][^>]*>[^<]*\?/i.test(source),
    freshness: () =>
      sourceHas(source, [
        /date(Published|Modified)/i,
        /<time[\s>]/i,
        /(updated|published|last modified)[^.]{0,40}\b20\d{2}\b/i,
      ]),
    author: () =>
      sourceHas(source, [
        /name=["']author["']/i,
        /rel=["']author["']/i,
        /itemprop=["']author["']/i,
        /"@type"\s*:\s*"Person"/i,
        /"@type"\s*:\s*"Organization"/i,
        /"@type"\s*:\s*"Brand"/i,
      ]),
    headingOrder: () => sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<h2[\s>]/i]),
    imageAlt: () => !/<img(?![^>]*\balt=)[^>]*>/i.test(source),
    metaRobotsOk: () => !/noindex/i.test(source),
    hreflang: () => /hreflang/i.test(source),
  };
  return table[key]?.() as PageSignals[keyof PageSignals];
}

function checkSourceImageSized(source: string): boolean {
  const tags = [...source.matchAll(/<(img|Image)\b[^>]*>/gi)].map((match) => match[0]);
  // A fill-layout image sizes itself to its parent and takes no dimensions.
  const sized = tags.filter((tag) => !/\bfill[\s=/>]/i.test(tag));
  if (sized.length === 0) return true;
  return sized.every((tag) => /width\s*=/.test(tag) && /height\s*=/.test(tag));
}

function analyzeSource(source: string): PageSignals {
  const keys: Array<keyof PageSignals> = [
    "title",
    "description",
    "canonical",
    "canonicalHref",
    "og",
    "twitter",
    "jsonLd",
    "jsonLdTypes",
    "jsonLdBlocks",
    "jsonLdParseOk",
    "faqJsonLd",
    "favicon",
    "viewport",
    "imageSized",
    "lang",
    "h1",
    "earlyFaq",
    "faqSection",
    "directAnswer",
    "wordCount",
    "questionHeadings",
    "freshness",
    "author",
    "headingOrder",
    "imageAlt",
    "metaRobotsOk",
    "hreflang",
  ];
  const result = {} as PageSignals;
  for (const key of keys) result[key] = sourceSignalValue(key, source) as never;
  return result;
}

export function analyzePage(source: string, isHtml: boolean): PageSignals {
  return isHtml ? analyzeHtml(source) : analyzeSource(source);
}
