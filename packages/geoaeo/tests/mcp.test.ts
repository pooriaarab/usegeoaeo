import { describe, expect, it } from 'vitest';
import { createMcpServer } from '../src/mcp.js';

describe('createMcpServer', () => {
  it('registers the audit, gen, and humanize tools without throwing', () => {
    expect(() => createMcpServer()).not.toThrow();
  });
});
