export const dynamic = "force-static";

const checklistMd = `# GEO/AEO checklist

Canonical checklist for making an app discoverable and quotable by AI answer engines and agents. Use it as the target state for any site. \`geoaeo audit\` maps to the items marked Covered on the full page; items marked Not covered yet are product gaps, not implicit features.

1. Crawlability
2. Semantic HTML
3. Structured data
4. llms.txt
5. Markdown mirrors
6. WebMCP
7. Answerability
8. Citability
9. Sitemap and robots
10. Open Graph
11. Internationalization
12. Prose quality

The page also maps each item to the audit score and closes with a recommended fix loop and the non-goals.

HTML version: https://usegeoaeo.com/checklist
`;

export function GET() {
  return new Response(checklistMd, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
