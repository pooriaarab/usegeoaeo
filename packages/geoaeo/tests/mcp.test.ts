import { describe, expect, it } from 'vitest';
import { GENERATED_ARTIFACTS } from '../src/commands/gen.js';
import { JSON_LD_KINDS } from '../src/generators/jsonld.js';
import { createMcpServer, MCP_GEN_ARTIFACTS, MCP_JSON_LD_KINDS } from '../src/mcp.js';

describe('createMcpServer', () => {
  it('registers the audit, gen, and humanize tools without throwing', () => {
    expect(() => createMcpServer()).not.toThrow();
  });

  it('keeps the gen artifact list and JSON-LD kinds equal to the CLI', () => {
    expect(MCP_GEN_ARTIFACTS).toEqual([...GENERATED_ARTIFACTS]);
    expect(MCP_JSON_LD_KINDS).toEqual([...JSON_LD_KINDS]);
  });
});
