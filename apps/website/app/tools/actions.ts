"use server";

import {
  auditTarget,
  formatAuditReport,
  generateLlms,
  generateJsonLd,
  defineConfig,
  type JsonLdKind,
} from "geoaeo";

export interface AuditResult {
  ok: boolean;
  score?: number;
  report?: string;
  error?: string;
}

export async function auditUrl(url: string): Promise<AuditResult> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return { ok: false, error: "Enter a full URL, including https://" };
  }
  try {
    const report = await auditTarget(trimmed);
    return { ok: true, score: report.score, report: formatAuditReport(report) };
  } catch {
    return { ok: false, error: "Could not fetch that site. Check the URL and try again." };
  }
}

function buildConfig(input: { siteName: string; siteUrl: string; description: string }) {
  return defineConfig({
    siteName: input.siteName || "Your site",
    siteUrl: input.siteUrl || "https://example.com",
    description: input.description || "",
    tools: [],
  });
}

export async function genLlms(input: {
  siteName: string;
  siteUrl: string;
  description: string;
}): Promise<string> {
  return generateLlms(buildConfig(input));
}

export async function genJsonLd(
  input: { siteName: string; siteUrl: string; description: string },
  kind: JsonLdKind
): Promise<string> {
  return `${JSON.stringify(generateJsonLd(buildConfig(input), kind), null, 2)}\n`;
}
