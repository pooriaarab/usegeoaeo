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
