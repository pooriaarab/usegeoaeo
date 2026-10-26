"use server";

import { defineConfig } from "geoaeo/config";
import { generateLlms } from "geoaeo/llms";
import { generateJsonLd, type JsonLdKind } from "geoaeo/jsonld";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface AuditResult {
  score: number;
  report: string;
}

export interface SiteFactsInput {
  siteName: string;
  siteUrl: string;
  description: string;
}

/** Site facts shared by the generators below. Internal: not a server action. */
function buildConfig(input: SiteFactsInput) {
  return defineConfig({
    siteName: input.siteName || "Your site",
    siteUrl: input.siteUrl || "https://example.com",
    description: input.description || "",
    tools: [],
  });
}

/** Audit a live URL. The SSRF-guarded engine needs Node builtins, so it is imported lazily and returns a clear error on the Worker instead of an unhandled rejection. On a Node host the audit runs normally. */
export async function auditUrl(url: string): Promise<ActionResult<AuditResult>> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: "Enter a full URL, including https://" };
  }
  let engine: typeof import("geoaeo/audit");
  try {
    engine = await import("geoaeo/audit");
  } catch {
    return {
      ok: false,
      error:
        "Live audits need Node and are unavailable on this host. Run `npx geoaeo audit <url>` locally instead.",
    };
  }
  try {
    const report = await engine.auditTarget(trimmed);
    return { ok: true, data: { score: report.score, report: engine.formatAuditReport(report) } };
  } catch {
    return { ok: false, error: "Could not fetch that site. Check the URL and try again." };
  }
}

export async function genLlms(input: SiteFactsInput): Promise<ActionResult<string>> {
  try {
    return { ok: true, data: generateLlms(buildConfig(input)) };
  } catch {
    return { ok: false, error: "Could not generate llms.txt." };
  }
}

export async function genJsonLd(
  input: SiteFactsInput,
  kind: JsonLdKind,
): Promise<ActionResult<string>> {
  try {
    const doc = generateJsonLd(buildConfig(input), kind);
    return { ok: true, data: `${JSON.stringify(doc, null, 2)}\n` };
  } catch {
    return { ok: false, error: "Could not generate JSON-LD." };
  }
}
