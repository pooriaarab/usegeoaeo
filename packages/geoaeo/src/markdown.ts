export interface MarkdownPage {
  title: string;
  summary?: string;
  /** The canonical HTML URL this markdown mirrors. */
  canonical: string;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated?: string;
  body: string;
  related?: Array<{ title: string; url: string }>;
}

export interface MarkdownResponseOptions {
  /** True when the client asked for markdown through Accept, so the response varies on it. */
  negotiated?: boolean;
}

/** Roughly four characters to a token, which is the estimate agents use to budget a fetch. */
export function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}

export function generateMarkdownPage(page: MarkdownPage): string {
  const lines = [`# ${page.title}`, ""];
  if (page.summary) lines.push(`> ${page.summary}`, "");
  lines.push(`Canonical: ${page.canonical}`);
  if (page.lastUpdated) lines.push(`Last updated: ${page.lastUpdated}`);
  lines.push("", page.body.trim(), "");
  if (page.related?.length) {
    lines.push("## Related", "");
    for (const item of page.related) lines.push(`- [${item.title}](${item.url})`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * The headers a markdown mirror needs: it stays out of the index, it names the
 * HTML page as canonical, and it tells an agent how big the fetch was.
 */
export function markdownHeaders(
  page: MarkdownPage,
  options: MarkdownResponseOptions = {},
): Headers {
  const headers = new Headers({
    "content-type": "text/markdown; charset=utf-8",
    "x-markdown-tokens": String(estimateTokens(generateMarkdownPage(page))),
    "x-robots-tag": "noindex, follow",
    "content-location": page.canonical,
    "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "access-control-allow-origin": "*",
  });
  if (options.negotiated) headers.set("vary", "Accept");
  if (page.lastUpdated) headers.set("last-modified", page.lastUpdated);
  return headers;
}

export function markdownResponse(
  page: MarkdownPage,
  options: MarkdownResponseOptions = {},
): Response {
  return new Response(generateMarkdownPage(page), { headers: markdownHeaders(page, options) });
}
