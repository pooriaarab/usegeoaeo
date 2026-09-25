import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { auditTarget } from '../src/audit.js';
import { blockedAgents } from '../src/audit/robots-policy.js';
import { defineConfig } from '../src/config.js';
import { AI_AGENTS, generateRobots } from '../src/generators/robots.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function auditRobots(robotsTxt: string) {
  const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-ai-crawlers-'));
  mkdirSync(path.join(dir, 'public'), { recursive: true });
  writeFileSync(path.join(dir, 'public', 'robots.txt'), robotsTxt);
  return auditTarget(dir);
}

describe('robots policy parser', () => {
  it('applies the * group to an agent with no block of its own', () => {
    expect(blockedAgents('User-agent: *\nDisallow: /\n', AI_AGENTS)).toEqual(AI_AGENTS);
  });

  it('lets a specific group override the * group', () => {
    const txt = 'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n';
    expect(blockedAgents(txt, ['GPTBot', 'ClaudeBot'])).toEqual(['ClaudeBot']);
  });

  it('treats an equal-length Allow as cancelling a Disallow', () => {
    const txt = 'User-agent: GPTBot\nDisallow: /\nAllow: /\n';
    expect(blockedAgents(txt, ['GPTBot'])).toEqual([]);
  });

  it('shares one group across several User-agent lines', () => {
    const txt = 'User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n';
    expect(blockedAgents(txt, AI_AGENTS)).toEqual(['GPTBot', 'ClaudeBot']);
  });

  it('ignores a bare Disallow and a Disallow of a path that is not /', () => {
    const txt = 'User-agent: GPTBot\nDisallow:\nDisallow: /admin\n';
    expect(blockedAgents(txt, ['GPTBot'])).toEqual([]);
  });

  it('matches agent names case-insensitively and supports wildcard paths', () => {
    const txt = 'user-agent: gptbot\ndisallow: /*\n';
    expect(blockedAgents(txt, AI_AGENTS)).toEqual(['GPTBot']);
  });
});

describe('ai-crawlers audit check', () => {
  it('fails when a fixture robots.txt blocks named AI crawlers', async () => {
    const report = await auditTarget(path.join(here, 'fixtures', 'blocks-ai'));
    const robots = report.checks.find(check => check.id === 'robots');
    const aiCrawlers = report.checks.find(check => check.id === 'ai-crawlers');
    expect(robots?.passed).toBe(true);
    expect(aiCrawlers?.passed).toBe(false);
    expect(aiCrawlers?.details).toBe('Blocked: GPTBot, ClaudeBot, PerplexityBot, Google-Extended.');
  });

  it('passes on the output of generateRobots()', async () => {
    const config = defineConfig({
      siteName: 'Round Trip',
      siteUrl: 'https://roundtrip.example',
      description: 'Audit fixture.',
      tools: [],
    });
    const report = await auditRobots(generateRobots(config));
    const robots = report.checks.find(check => check.id === 'robots');
    const aiCrawlers = report.checks.find(check => check.id === 'ai-crawlers');
    expect(robots?.passed).toBe(true);
    expect(aiCrawlers?.passed).toBe(true);
    expect(aiCrawlers?.details).toBe('No named AI crawler is disallowed from /.');
  });
});
