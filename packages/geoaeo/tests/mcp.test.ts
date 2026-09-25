import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
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

describe('MCP tools over an in-memory transport', () => {
  async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
    const server = createMcpServer();
    const client = new Client({ name: 'geoaeo-test-client', version: '0.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    try {
      return await run(client);
    } finally {
      await client.close();
      await server.close();
    }
  }

  async function callToolText(client: Client, name: string, args: Record<string, unknown>): Promise<string> {
    const result = (await client.callTool({ name, arguments: args })) as { content?: { type: string; text?: string }[] };
    return (result.content ?? []).map(item => (item.type === 'text' ? (item.text ?? '') : '')).join('');
  }

  async function withFixture<T>(run: (directory: string) => Promise<T>): Promise<T> {
    const directory = await mkdtemp(path.join(tmpdir(), 'geoaeo-mcp-'));
    expect(path.resolve(directory)).not.toBe(process.cwd());
    try {
      return await run(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it('gen reads the site config from the directory argument', async () => {
    await withFixture(async directory => {
      await writeFile(
        path.join(directory, 'geoaeo.config.mjs'),
        `export const siteConfig = {
          siteName: 'FixtureSite92',
          siteUrl: 'https://fixture92.example.com',
          description: 'A fixture site for MCP directory tests.',
          tools: [],
        };\n`
      );
      const text = await withClient(client => callToolText(client, 'gen', { artifact: 'llms', directory }));
      expect(text).toContain('FixtureSite92');
    });
  });

  it('humanize scans files under the directory argument', async () => {
    await withFixture(async directory => {
      const file = path.join(directory, 'post.md');
      await writeFile(file, 'A seamless tool.\n');
      const text = await withClient(client => callToolText(client, 'humanize', { glob: '*.md', directory }));
      const summary = JSON.parse(text) as { file: string; findings: { rule: string }[] }[];
      expect(summary).toHaveLength(1);
      expect(summary[0]?.file).toBe(file);
      expect(summary[0]?.findings.length).toBeGreaterThan(0);
    });
  });
});
