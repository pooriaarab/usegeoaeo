import { describe, expect, it } from 'vitest';
import { defineConfig } from '../src/config.js';
import { generateHreflang, generateMdmirror, generateOgimage, generateRss } from '../src/generators/index.js';

const config = defineConfig({
  siteName: 'Reply Kit',
  siteUrl: 'https://reply.example',
  description: 'Draft replies for social posts.',
  platforms: ['X', 'LinkedIn'],
  tools: [{ name: 'Rate calculator', url: '/tools/rate', description: 'Calculate interaction rate.' }],
  plans: [{ name: 'Pro', price: 9, description: 'Higher limits.' }],
  faq: [{ question: 'Does it post automatically?', answer: 'No. You review each draft.' }],
  pages: ['pricing'],
});

describe('extra artifact generators', () => {
  it('generates an OG image SVG with title and site name', () => {
    const output = generateOgimage(config);
    expect(output).toContain('<svg');
    expect(output).toContain('Reply Kit');
  });

  it('generates an RSS 2.0 feed from site pages', () => {
    const output = generateRss(config);
    expect(output).toContain('<rss version="2.0">');
    expect(output).toContain('<title>Reply Kit</title>');
    expect(output).toContain('https://reply.example/pricing');
  });

  it('generates hreflang alternate link tags', () => {
    const output = generateHreflang(config);
    expect(output).toContain('rel="alternate"');
    expect(output).toContain('hreflang="en"');
    expect(output).toContain('https://reply.example/');
  });

  it('generates a markdown mirror from title and body', () => {
    const output = generateMdmirror(config);
    expect(output).toContain('# Reply Kit');
    expect(output).toContain('Draft replies for social posts.');
  });
});
