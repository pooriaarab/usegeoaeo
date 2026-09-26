import { afterEach, describe, expect, it } from "vitest";
import { auditTarget, type AuditCheck } from "../src/audit.js";

const target = "http://127.0.0.1:4141";
const originalFetch = globalThis.fetch;

const barePage = '<!doctype html><html lang="en"><body><p>local</p></body></html>';
const taggedPage =
  '<html><head><title>Prod</title><meta property="og:title" content="x">' +
  '<script type="application/ld+json">{"@type":"Organization"}</script></head><body></body></html>';

const foreignSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://production.example/docs</loc></url>
<url><loc>https://production.example/checklist</loc></url>
<url><loc>https://[unparseable</loc></url>
</urlset>`;

const sameOriginSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${target}</loc></url>
<url><loc>${target}/docs</loc></url>
<url><loc>${target}/checklist</loc></url>
</urlset>`;

function check(checks: AuditCheck[], id: string): AuditCheck {
  const found = checks.find((item) => item.id === id);
  if (!found) throw new Error(`${id} check missing`);
  return found;
}

function stubFetch(handler: (url: string) => Response): { requested: string[] } {
  const requested: string[] = [];
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = String(input);
    requested.push(url);
    return handler(url);
  };
  return { requested };
}

function notFound(): Response {
  return new Response("", { status: 404 });
}

function htmlPage(title: string): string {
  return `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1></body></html>`;
}

function expectAllOnTarget(requested: string[]): void {
  expect(requested.length).toBeGreaterThan(0);
  for (const url of requested) {
    // fetch() rejects an unparseable URL before a request can go anywhere.
    if (URL.canParse(url)) expect(new URL(url).origin).toBe(target);
  }
}

describe("sitemap urls resolve onto the target origin", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("audits a foreign-origin sitemap on the target, never off it", async () => {
    const { requested } = stubFetch((url) => {
      if (url === `${target}/sitemap.xml`) return new Response(foreignSitemap);
      if (URL.canParse(url) && new URL(url).origin === target) return new Response(barePage);
      return new Response(taggedPage); // a bug fetching the sitemap's own origin would score this
    });
    const report = await auditTarget(target);
    expectAllOnTarget(requested);
    expect(report.pages).toEqual([target, `${target}/docs`, `${target}/checklist`]);
    // The tagged page lives on production.example; nothing local carries og or JSON-LD.
    expect(check(report.checks, "open-graph").passed).toBe(false);
    expect(check(report.checks, "json-ld").passed).toBe(false);
  });

  it("fetches a same-origin sitemap exactly as before", async () => {
    const { requested } = stubFetch((url) => {
      if (url === `${target}/sitemap.xml`) return new Response(sameOriginSitemap);
      if (url === target || url === `${target}/`) return new Response(htmlPage("Home"));
      if (url === `${target}/docs`) return new Response(htmlPage("Docs"));
      if (url === `${target}/checklist`) return new Response(htmlPage("Checklist"));
      return notFound();
    });
    const report = await auditTarget(target);
    expectAllOnTarget(requested);
    // Same list the verbatim fetch produced: home once, then each <loc> in order.
    expect(report.pages).toEqual([target, `${target}/docs`, `${target}/checklist`]);
    expect(check(report.checks, "title").passed).toBe(true);
  });

  it("probes markdown mirrors on the target origin", async () => {
    const { requested } = stubFetch((url) => {
      if (url === `${target}/sitemap.xml`) return new Response(foreignSitemap);
      if (url === `${target}/docs.md`) return new Response("# Docs mirror");
      if (URL.canParse(url) && new URL(url).origin === target) return new Response(barePage);
      return notFound();
    });
    const report = await auditTarget(target);
    expectAllOnTarget(requested);
    expect(requested).toContain(`${target}/docs.md`);
    expect(check(report.checks, "markdown").passed).toBe(true);
  });
});

function withResponseUrl(response: Response, url: string): Response {
  Object.defineProperty(response, "url", { value: url });
  return response;
}

describe("redirects that change response.url", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("discards a response that redirected off the target host", async () => {
    const { requested } = stubFetch((url) => {
      if (url === `${target}/sitemap.xml`) return notFound();
      if (url === target)
        return withResponseUrl(new Response(taggedPage), "https://production.example/");
      return notFound();
    });
    const report = await auditTarget(target);
    expectAllOnTarget(requested);
    // The redirect landed on production.example, so the target has no pages at all.
    expect(report.pages).toEqual([]);
    expect(check(report.checks, "open-graph").passed).toBe(false);
    expect(check(report.checks, "json-ld").passed).toBe(false);
  });

  it("keeps a same-host scheme-upgrade redirect", async () => {
    const { requested } = stubFetch((url) => {
      if (url === `${target}/sitemap.xml`) return notFound();
      if (url === target)
        return withResponseUrl(new Response(htmlPage("Home")), "https://127.0.0.1:4141/");
      return notFound();
    });
    const report = await auditTarget(target);
    expectAllOnTarget(requested);
    expect(report.pages).toEqual([target]);
    expect(check(report.checks, "title").passed).toBe(true);
  });
});
