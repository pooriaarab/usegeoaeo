import type { load } from "cheerio";

export interface JsonLdFacts {
  types: string[];
  blocks: number;
  parseOk: boolean;
  faq: boolean;
}

function typeList(node: unknown): string[] {
  const type = (node as { "@type"?: string | string[] })?.["@type"];
  return type ? (Array.isArray(type) ? type : [type]) : [];
}

function hasSchemaContext(node: unknown): boolean {
  const context = (node as { "@context"?: unknown })?.["@context"];
  const values = Array.isArray(context) ? context : [context];
  return values.some((value) => typeof value === "string" && value.includes("schema.org"));
}

function nodeIsFaq(node: unknown): boolean {
  if (!typeList(node).includes("FAQPage")) return false;
  const mainEntity = (node as { mainEntity?: unknown })?.mainEntity;
  const items = Array.isArray(mainEntity) ? mainEntity : [mainEntity];
  return items.some(
    (item) =>
      typeList(item).includes("Question") &&
      (item as { acceptedAnswer?: unknown })?.acceptedAnswer !== undefined,
  );
}

function blockNodes(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  const graph = (parsed as { "@graph"?: unknown })?.["@graph"];
  if (Array.isArray(graph)) return graph;
  return [parsed];
}

export function extractJsonLd($: ReturnType<typeof load>): JsonLdFacts {
  const blocks = $('script[type="application/ld+json"]')
    .map((_, element) => $(element).text())
    .get();
  const facts: JsonLdFacts = { types: [], blocks: blocks.length, parseOk: true, faq: false };
  for (const value of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      facts.parseOk = false;
      continue;
    }
    // A @graph document carries one shared @context; a bare array needs
    // it on every node. Either way each node resolves against schema.org.
    const nodes = blockNodes(parsed);
    if (!hasSchemaContext(parsed) && !nodes.every(hasSchemaContext)) {
      facts.parseOk = false;
    }
    for (const node of nodes) {
      facts.types.push(...typeList(node));
      if (nodeIsFaq(node)) facts.faq = true;
    }
  }
  return facts;
}
