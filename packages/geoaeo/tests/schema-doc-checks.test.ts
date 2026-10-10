import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { auditTarget, type AuditCheck } from "../src/audit.js";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function check(report: { checks: AuditCheck[] }, id: string): AuditCheck {
  const found = report.checks.find((item) => item.id === id);
  if (!found) throw new Error(`${id} check missing`);
  return found;
}

async function auditHtml(head: string, body: string, attrs: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "geoaeo-schema-doc-"));
  dirs.push(dir);
  const page = `<!DOCTYPE html><html ${attrs}><head>${head}</head>`;
  writeFileSync(path.join(dir, "index.html"), `${page}<body>${body}</body></html>`);
  return auditTarget(dir);
}

async function auditSource(pageSource: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "geoaeo-schema-doc-"));
  dirs.push(dir);
  const appDir = path.join(dir, "app");
  mkdirSync(appDir, { recursive: true });
  writeFileSync(path.join(appDir, "page.tsx"), pageSource);
  return auditTarget(dir);
}

const block = (json: string) => `<script type="application/ld+json">${json}</script>`;
const org = block(`{"@context":"https://schema.org","@type":"Organization"}`);
const graph = block(`{"@context":"https://schema.org","@graph":[{"@type":"X"}]}`);
const broken = block(`{"@context": not json`);
const noCtx = block(`{"@type":"Organization"}`);
const faqOk = block(
  `{"@context":"https://schema.org","@type":"FAQPage",` +
    `"mainEntity":[{"@type":"Question","acceptedAnswer":{}}]}`,
);
const faqWeak = block(`{"@context":"https://schema.org","@type":"FAQPage",` + `"mainEntity":[]}`);
const viewport = `<meta name="viewport" content="width=device-width">`;
const icon = `<link rel="icon" href="/f.svg">`;
const plainCopy = "<h1>Hi</h1><p>Plain copy.</p>";
const faqCopy = "<h1>Hi</h1><h2>Frequently asked questions</h2>";
const sizedImg = `<img src="/a.png" alt="a" width="4" height="4">`;
const bareImg = `<img src="/a.png" alt="a">`;
const fillImg = `<img src="/a.png" alt="a" data-nimg="fill">`;
const faqSrc = `"<h2>Frequently asked questions</h2>", "@type": "FAQPage",` + ` acceptedAnswer: {}`;

// [name, head, check id, passed]
const stdCases: Array<[string, string, string, boolean]> = [
  ["linked icon", icon, "favicon", true],
  ["no linked icon", "", "favicon", false],
  ["device-width viewport", viewport, "viewport", true],
  ["no viewport tag", "", "viewport", false],
  ["declared language", "", "lang", true],
  ["sized image", "", "image-size", true],
  ["unsized image", "", "image-size", false],
  ["Next.js fill image", "", "image-size", true],
  ["no images", "", "image-size", true],
  ["valid block", org, "schema-valid", true],
  ["unparseable block", broken, "schema-valid", false],
  ["block with no context", noCtx, "schema-valid", false],
  ["shared graph context", graph, "schema-valid", true],
  ["no blocks", "", "schema-valid", true],
  ["no FAQ copy", org, "faq-schema", true],
  ["incidental FAQ mention", org, "faq-schema", true],
  ["quoted phrase in prose", org, "faq-schema", true],
  ["bare FAQ heading without schema", org, "faq-schema", false],
  ["bare FAQ heading with schema", faqOk, "faq-schema", true],
  ["Organization counts as author", org, "author", true],
];

const stdBodies: Record<string, string> = {
  "sized image": sizedImg,
  "unsized image": bareImg,
  "Next.js fill image": fillImg,
  "incidental FAQ mention": "<p>Configure pages: ['pricing', 'faq'].</p>",
  "quoted phrase in prose": `<p>Audit looks for an early "FAQ" / "frequently asked questions" signal.</p>`,
  "bare FAQ heading without schema": "<h2>FAQ</h2><p>Q and A below.</p>",
  "bare FAQ heading with schema": "<h2>FAQ</h2><p>Q and A below.</p>",
};

describe("schema and document checks on rendered HTML", () => {
  for (const [name, head, id, passed] of stdCases) {
    it(`${passed ? "passes" : "fails"} ${id}: ${name}`, async () => {
      const report = await auditHtml(head, stdBodies[name] ?? plainCopy, `lang="en"`);
      expect(check(report, id).passed).toBe(passed);
    });
  }

  it("fails lang with no language declared", async () => {
    const report = await auditHtml("", plainCopy, "");
    expect(check(report, "lang").passed).toBe(false);
  });

  it("passes faq-schema when FAQ copy pairs with FAQPage", async () => {
    const report = await auditHtml(faqOk, faqCopy, `lang="en"`);
    expect(check(report, "faq-schema").passed).toBe(true);
  });

  it("fails faq-schema on FAQ copy with no FAQPage", async () => {
    const report = await auditHtml(org, faqCopy, `lang="en"`);
    expect(check(report, "faq-schema").passed).toBe(false);
  });

  it("fails faq-schema on FAQPage with no answers", async () => {
    const report = await auditHtml(faqWeak, faqCopy, `lang="en"`);
    expect(check(report, "faq-schema").passed).toBe(false);
  });
});

// [name, source, check id, passed]
const srcCases: Array<[string, string, string, boolean]> = [
  ["icons field", `icons: { icon: "/f.svg" }`, "favicon", true],
  ["viewport export", `export const viewport: V = {}`, "viewport", true],
  ["html lang", `<html lang="en">`, "lang", true],
  ["sized Image", `<Image width={4} height={4} />`, "image-size", true],
  ["bare img", `<img src="/a.png" />`, "image-size", false],
  ["fill image", `<Image fill />`, "image-size", true],
  ["FAQ pairing", faqSrc, "faq-schema", true],
  ["incidental mention", `pages: ['pricing', 'faq']`, "faq-schema", true],
  ["constructed JSON-LD", `"@context": "https://schema.org"`, "schema-valid", true],
];

describe("schema and document checks on framework source", () => {
  for (const [name, source, id, passed] of srcCases) {
    it(`${passed ? "passes" : "fails"} ${id}: ${name}`, async () => {
      const report = await auditSource(source);
      expect(check(report, id).passed).toBe(passed);
    });
  }
});
