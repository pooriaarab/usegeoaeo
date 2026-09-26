#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { auditTarget, type AuditCheck, type AuditReport } from './audit.js';
import { formatAuditReport } from './audit/format.js';
import { VERSION, PKG_NAME, CONFIG_FILENAME } from './constants.js';
import { generateArtifact, GENERATED_ARTIFACTS, type GeneratedArtifact } from './commands/gen.js';
import { ConfigLoadError } from './commands/load-config.js';
import { JSON_LD_KINDS, type JsonLdKind } from './generators/index.js';
import { humanizeGlob } from './commands/humanize.js';
import type { HumanizeFinding } from './humanize.js';

// Built from the shared arrays so a new artifact or kind cannot land in one face only.
const genArtifactSchema = z.enum(GENERATED_ARTIFACTS);
const genTypeSchema = z.enum(JSON_LD_KINDS);
const directorySchema = z.string().optional().describe('Absolute path to the site root. Defaults to the MCP server\'s working directory, which is usually not the project you mean — pass it explicitly.');
const targetSchema = z.string().describe('A local directory or an absolute http(s) URL.');
const globSchema = z.string().describe('Glob pattern matching the prose files to scan. Reads the matches; changes nothing unless write is true.');
const writeSchema = z.boolean().optional().describe('Default false. true rewrites matching files in place. Set true only after the user asked to change files.');
const artifactSchema = genArtifactSchema.describe('Which GEO or AEO artifact to generate. It is returned as text; no file is written.');
const artifactTypeSchema = genTypeSchema.optional().describe('Applies only when artifact is jsonld.');
export const MCP_GEN_ARTIFACTS = genArtifactSchema.options;
export const MCP_JSON_LD_KINDS = genTypeSchema.options;

const MCP_INSTRUCTIONS = [
  'Call only audit, gen, or humanize.',
  'Audit a local directory or an http(s) URL first.',
  'audit returns a report and writes no files.',
  'gen reads geoaeo.config.ts, .js, or .mjs and returns the artifact as text.',
  'It writes no file.',
  'humanize writes a file only when write is true and the text changes.',
  'Ask the user before you set write.',
].join(' ');

// Output schemas for the structuredContent channel. Each schema is annotated
// with the library type it describes, so a change to AuditReport,
// AuditCheck, or HumanizeFinding breaks this build instead of silently
// diverging the published schema. Every object is loose: the audit report
// grows new checks by design, and a closed schema would let a client holding
// a cached copy reject a response the server already produced.
const auditCheckSchema: z.ZodType<AuditCheck> = z.looseObject({
  id: z.string().describe('Stable check id.'),
  label: z.string().describe('Short human-readable check name.'),
  passed: z.boolean().describe('Whether the target passed this check.'),
  weight: z.number().describe('Points this check contributes to the 0-100 score.'),
  details: z.string().describe('What was found, in one line.'),
});
const auditOutputSchema: z.ZodType<AuditReport> = z.looseObject({
  target: z.string().describe('The audited directory or URL.'),
  score: z.number().describe('Overall score from 0 to 100.'),
  checks: z.array(auditCheckSchema).describe('One entry per audit check.'),
  pages: z.array(z.string()).describe('Page URLs covered by the audit.'),
  topFixes: z.array(z.string()).describe('Highest-impact fixes first.'),
});
const humanizeFindingSchema: z.ZodType<HumanizeFinding> = z.looseObject({
  rule: z.string().describe('Rule id, e.g. ai-vocabulary.'),
  before: z.string().describe('The matched text.'),
  after: z.string().describe('The replacement text.'),
});
const humanizeOutputSchema = z.looseObject({
  results: z.array(z.looseObject({
    file: z.string().describe('Absolute path of the scanned file.'),
    findings: z.array(humanizeFindingSchema).describe('Findings in this file.'),
  })).describe('One entry per scanned file.'),
});

async function auditHandler({ target }: { target: string }) {
  const report = await auditTarget(target);
  // Text is the same report the CLI prints. structuredContent is the object
  // an agent can read without parsing a JSON blob.
  return {
    content: [{ type: 'text', text: formatAuditReport(report) }],
    structuredContent: report,
  };
}

async function humanizeHandler({ glob, write, directory }: { glob: string; write?: boolean; directory?: string }) {
  const results = await humanizeGlob(glob, { write, directory });
  const summary = [...results.entries()].map(([file, result]) => ({ file, findings: result.findings }));
  const findingCount = summary.reduce((count, item) => count + item.findings.length, 0);
  // MCP structuredContent must be an object, so the findings array lives under results.
  return {
    content: [{ type: 'text', text: `${summary.length} files, ${findingCount} findings` }],
    structuredContent: { results: summary },
  };
}

function configToolError(error: ConfigLoadError, directory: string | undefined) {
  const root = directory ?? error.directory;
  if (error.code === 'CONFIG_MISSING') {
    return {
      isError: true,
      content: [{ type: 'text', text: `No ${CONFIG_FILENAME} in ${root}. Run geoaeo init in that directory, replace the placeholder facts, then call gen again.` }],
      structuredContent: { status: 'error', error: { code: 'CONFIG_MISSING', message: `No ${CONFIG_FILENAME}` } },
    };
  }
  return {
    isError: true,
    content: [{ type: 'text', text: `${error.filename} in ${root} has no default export. Export a default config or siteConfig, then call gen again.` }],
    structuredContent: { status: 'error', error: { code: 'CONFIG_INVALID', message: 'No default export' } },
  };
}

// Known config states return a tool result. Every other failure stays a throw.
export async function genHandler({ artifact, type, directory }: {
  artifact: GeneratedArtifact;
  type?: JsonLdKind;
  directory?: string;
}) {
  try {
    const text = await generateArtifact(artifact, directory, type ?? 'software');
    return { content: [{ type: 'text', text }] };
  } catch (error) {
    if (error instanceof ConfigLoadError) return configToolError(error, directory);
    throw error;
  }
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: PKG_NAME, version: VERSION }, {
    capabilities: { tools: { listChanged: false } },
    instructions: MCP_INSTRUCTIONS,
  });
  // The SDK's registerTool types its inputSchema against a bundled zod version that this
  // package's zod (v4) does not structurally match, so we erase the type here to call it.
  // That erasure also removes the compiler's link between each inputSchema and its handler
  // params below: keep the handler's destructured keys and types in sync with inputSchema by hand.
  const registerTool = server.registerTool.bind(server) as unknown as (
    name: string,
    config: { title: string; description: string; inputSchema: Record<string, unknown>; outputSchema?: unknown; annotations: Record<string, boolean> },
    handler: (...args: never[]) => unknown,
  ) => void;
  registerTool(
    'audit',
    {
      title: 'Audit a site',
      description: 'Audit a live URL or local site directory for GEO and AEO gaps. Reads the target and returns a report; it changes no files. Fetches over the network when the target is a URL.',
      inputSchema: { target: targetSchema },
      outputSchema: auditOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    },
    auditHandler
  );
  registerTool(
    'gen',
    {
      title: 'Generate an artifact',
      description: 'Generate one GEO or AEO artifact from the local site config. Returns the artifact as text; it does not write a file.',
      inputSchema: { artifact: artifactSchema, type: artifactTypeSchema, directory: directorySchema },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    genHandler
  );
  registerTool(
    'humanize',
    {
      title: 'Humanize prose',
      description: 'Find AI-writing tells in prose files. Reports findings without changing files by default; with write true it rewrites matching files in place, so ask the user first.',
      inputSchema: { glob: globSchema, write: writeSchema, directory: directorySchema },
      outputSchema: humanizeOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    humanizeHandler
  );
  // registerTool merges tools.listChanged back to true. These three tools never change.
  server.server.registerCapabilities({ tools: { listChanged: false } });
  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
}

// npm installs a bin as a symlink (node_modules/.bin/geoaeo-mcp -> ../geoaeo/dist/mcp.js).
// Node reports argv[1] as the invoked symlink and import.meta.url as the real file, so a
// raw string compare is never true for an installed user — the process exited silently.
// Compare resolved real paths instead, which also absorbs macOS /tmp vs /private/tmp.
// This module is additionally bundled into dist/cli.js, where import.meta.url points at
// cli.js — so argv[1] is checked against the sibling mcp.js file, not this bundle's URL.
function invokedAsEntrypoint(): boolean {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    const mcpEntry = fileURLToPath(new URL('./mcp.js', import.meta.url));
    return realpathSync(invoked) === realpathSync(mcpEntry);
  } catch {
    return false;
  }
}

if (invokedAsEntrypoint()) startMcpServer().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
