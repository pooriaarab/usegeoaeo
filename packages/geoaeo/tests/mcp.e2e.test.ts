import { describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mcp = path.join(root, 'dist', 'mcp.js');

const INITIALIZE = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'geoaeo-e2e', version: '0.0.0' },
  },
});

interface JsonRpcReply {
  jsonrpc?: string;
  id?: number;
  result?: { serverInfo?: { name?: string } };
  error?: { message?: string };
}

// npm ships bins as symlinks into node_modules/.bin, so this spawns a symlink
// to dist/mcp.js — running the real path passes even when the bin is broken.
// stdin stays open until the reply line arrives, because a closed stdin can
// end the process before the server answers.
function requestInitialize(binPath: string): Promise<JsonRpcReply> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [binPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => done(new Error(`no reply within 10s. stderr: ${stderr}`)), 10_000);
    const done = (error?: Error, reply?: JsonRpcReply) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill();
      if (error) reject(error);
      else resolve(reply as JsonRpcReply);
    };
    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
      const newline = stdout.indexOf('\n');
      if (newline === -1) return;
      try {
        done(undefined, JSON.parse(stdout.slice(0, newline)) as JsonRpcReply);
      } catch (error) {
        done(error instanceof Error ? error : new Error(String(error)));
      }
    });
    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on('error', error => done(error));
    child.on('exit', code => done(new Error(`exited ${code} before replying. stderr: ${stderr}`)));
    child.stdin.on('error', () => {});
    child.stdin.write(`${INITIALIZE}\n`);
  });
}

describe('geoaeo-mcp bin end-to-end', () => {
  it('has a built mcp.js (run npm run build first)', () => {
    expect(existsSync(mcp)).toBe(true);
  });

  it('answers an initialize handshake when invoked through a symlink', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-mcp-bin-'));
    const link = path.join(dir, 'geoaeo-mcp');
    symlinkSync(mcp, link);
    try {
      const reply = await requestInitialize(link);
      expect(reply.jsonrpc).toBe('2.0');
      expect(reply.id).toBe(1);
      expect(reply.error).toBeUndefined();
      expect(reply.result?.serverInfo?.name).toBe('geoaeo');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
