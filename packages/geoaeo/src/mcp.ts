#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { auditTarget } from './audit.js';
import { VERSION, PKG_NAME } from './constants.js';
import { generateArtifact, GENERATED_ARTIFACTS, type GeneratedArtifact } from './commands/gen.js';
import { JSON_LD_KINDS, type JsonLdKind } from './generators/index.js';
import { humanizeGlob } from './commands/humanize.js';

// Built from the shared arrays so a new artifact or kind cannot land in one face only.
const genArtifactSchema = z.enum(GENERATED_ARTIFACTS);
const genTypeSchema = z.enum(JSON_LD_KINDS);
export const MCP_GEN_ARTIFACTS = genArtifactSchema.options;
export const MCP_JSON_LD_KINDS = genTypeSchema.options;

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: PKG_NAME, version: VERSION });
  // The SDK's registerTool types its inputSchema against a bundled zod version that this
  // package's zod (v4) does not structurally match, so we erase the type here to call it.
  // That erasure also removes the compiler's link between each inputSchema and its handler
  // params below: keep the handler's destructured keys and types in sync with inputSchema by hand.
  const registerTool = server.registerTool.bind(server) as unknown as (
    name: string,
    config: { description: string; inputSchema: Record<string, unknown> },
    handler: (...args: never[]) => unknown,
  ) => void;
  registerTool(
    'audit',
    {
      description: 'Audit a live URL or local site directory for GEO and AEO gaps.',
      inputSchema: { target: z.string() },
    },
    async ({ target }: { target: string }) => ({
      content: [{ type: 'text', text: JSON.stringify(await auditTarget(target), null, 2) }],
    })
  );
  registerTool(
    'gen',
    {
      description: 'Generate one GEO or AEO artifact from the local site config.',
      inputSchema: {
        artifact: genArtifactSchema,
        type: genTypeSchema.optional(),
      },
    },
    async ({ artifact, type }: {
      artifact: GeneratedArtifact;
      type?: JsonLdKind;
    }) => ({
      content: [{ type: 'text', text: await generateArtifact(artifact, process.cwd(), type ?? 'software') }],
    })
  );
  registerTool(
    'humanize',
    {
      description: 'Find AI-writing tells in prose files. Set write to update them.',
      inputSchema: { glob: z.string(), write: z.boolean().optional() },
    },
    async ({ glob, write }: { glob: string; write?: boolean }) => {
      const results = await humanizeGlob(glob, { write });
      const summary = [...results.entries()].map(([file, result]) => ({ file, findings: result.findings }));
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    }
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
