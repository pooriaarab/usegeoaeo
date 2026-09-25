import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GENERATED_ARTIFACTS } from '../src/commands/gen.js';
import { JSON_LD_KINDS } from '../src/generators/jsonld.js';
import { createMcpServer, MCP_GEN_ARTIFACTS, MCP_JSON_LD_KINDS } from '../src/mcp.js';

const fixture = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../examples/static-html');

type ToolResult = {
  content: Array<{ type: string; text: string }>;
  structuredContent?: { score?: number; target?: string; results?: unknown[] };
};

async function callMcpTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const server = createMcpServer();
  const client = new Client({ name: 'geoaeo-test', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  try {
    return (await client.callTool({ name, arguments: args })) as ToolResult;
  } finally {
    await client.close();
    await server.close();
  }
}

describe('createMcpServer', () => {
  it('registers the audit, gen, and humanize tools without throwing', () => {
    expect(() => createMcpServer()).not.toThrow();
  });

  it('keeps the gen artifact list and JSON-LD kinds equal to the CLI', () => {
    expect(MCP_GEN_ARTIFACTS).toEqual([...GENERATED_ARTIFACTS]);
    expect(MCP_JSON_LD_KINDS).toEqual([...JSON_LD_KINDS]);
  });

  it('returns a formatted audit report plus a numeric structured score', async () => {
    const result = await callMcpTool('audit', { target: fixture });
    const structured = result.structuredContent as { score: number; target: string };
    const text = result.content[0];
    expect(typeof structured.score).toBe('number');
    expect(text.type).toBe('text');
    if (text.type !== 'text') throw new Error('expected a text content block');
    expect(text.text.startsWith(`${structured.target}: ${structured.score}/100`)).toBe(true);
  });

  it('returns a humanize count line plus a structured findings array', async () => {
    const result = await callMcpTool('humanize', { glob: 'examples/static-html/README.md' });
    const text = result.content[0];
    expect(text.type).toBe('text');
    if (text.type !== 'text') throw new Error('expected a text content block');
    expect(text.text).toMatch(/^\d+ files, \d+ findings$/);
    const structured = result.structuredContent as { results: unknown[] };
    expect(Array.isArray(structured.results)).toBe(true);
  });
});
