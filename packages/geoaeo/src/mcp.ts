#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { auditTarget } from './audit.js';
import { formatAuditReport } from './audit/format.js';
import { VERSION, PKG_NAME } from './constants.js';
import { generateArtifact, GENERATED_ARTIFACTS, type GeneratedArtifact } from './commands/gen.js';
import { JSON_LD_KINDS, type JsonLdKind } from './generators/index.js';
import { humanizeGlob } from './commands/humanize.js';

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

async function genHandler({ artifact, type, directory }: {
  artifact: GeneratedArtifact;
  type?: JsonLdKind;
  directory?: string;
}) {
  return { content: [{ type: 'text', text: await generateArtifact(artifact, directory, type ?? 'software') }] };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: PKG_NAME, version: VERSION });
  // The SDK's registerTool types its inputSchema against a bundled zod version that this
  // package's zod (v4) does not structurally match, so we erase the type here to call it.
  // That erasure also removes the compiler's link between each inputSchema and its handler
  // params below: keep the handler's destructured keys and types in sync with inputSchema by hand.
  const registerTool = server.registerTool.bind(server) as unknown as (
    name: string,
    config: { title: string; description: string; inputSchema: Record<string, unknown>; annotations: Record<string, boolean> },
    handler: (...args: never[]) => unknown,
  ) => void;
  registerTool(
    'audit',
    {
      title: 'Audit a site',
      description: 'Audit a live URL or local site directory for GEO and AEO gaps. Reads the target and returns a report; it changes no files. Fetches over the network when the target is a URL.',
      inputSchema: { target: targetSchema },
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
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    humanizeHandler
  );
  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
}

if (import.meta.url === `file://${process.argv[1]}`) startMcpServer().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
