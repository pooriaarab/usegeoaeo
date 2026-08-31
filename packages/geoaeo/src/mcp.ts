#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod/v3';
import { auditTarget } from './audit.js';
import { VERSION, PKG_NAME } from './constants.js';
import { generateArtifact } from './commands/gen.js';
import { humanizeGlob } from './commands/humanize.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: PKG_NAME, version: VERSION });
  server.registerTool(
    'audit',
    {
      description: 'Audit a live URL or local site directory for GEO and AEO gaps.',
      inputSchema: { target: z.string() },
    },
    async ({ target }) => ({
      content: [{ type: 'text', text: JSON.stringify(await auditTarget(target), null, 2) }],
    })
  );
  server.registerTool(
    'gen',
    {
      description: 'Generate one GEO or AEO artifact from the local site config.',
      inputSchema: {
        artifact: z.enum(['llms', 'llms-full', 'jsonld', 'webmcp', 'sitemap', 'robots']),
        type: z.enum(['software', 'product', 'faq', 'breadcrumb']).optional(),
      },
    },
    async ({ artifact, type }) => ({
      content: [{ type: 'text', text: await generateArtifact(artifact, process.cwd(), type ?? 'software') }],
    })
  );
  server.registerTool(
    'humanize',
    {
      description: 'Find AI-writing tells in prose files. Set write to update them.',
      inputSchema: { glob: z.string(), write: z.boolean().optional() },
    },
    async ({ glob, write }) => {
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
