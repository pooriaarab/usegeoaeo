import { describe, expect, it } from 'vitest';
import { defineConfig } from '../src/config.js';
import {
  faqJsonLd,
  generateJsonLd,
  generateLlms,
  generateLlmsFull,
  generateRobots,
  generateSitemap,
  generateWebmcp,
} from '../src/generators/index.js';

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

describe('artifact generators', () => {
  it('generates the short llms map', () => {
    const output = generateLlms(config);
    expect(output).toContain('# Reply Kit');
    expect(output).toContain('[Rate calculator](https://reply.example/tools/rate)');
  });

  it('generates the full llms map with FAQ content', () => {
    const output = generateLlmsFull(config);
    expect(output).toContain('## Common questions');
    expect(output).toContain('Q: Does it post automatically?');
  });

  it('generates the WebMCP manifest shape', () => {
    const manifest = generateWebmcp(config);
    expect(manifest.tools[0]).toEqual({
      name: 'Rate calculator',
      description: 'Calculate interaction rate.',
      url: 'https://reply.example/tools/rate',
    });
    expect(manifest.resources.map(resource => resource.name)).toEqual(['llms', 'llms-full']);
  });

  it('generates SoftwareApplication JSON-LD', () => {
    const output = generateJsonLd(config);
    expect(output['@type']).toBe('SoftwareApplication');
    expect(output.offers).toEqual([{ '@type': 'Offer', name: 'Pro', price: '9', priceCurrency: 'USD' }]);
  });

  it('generates FAQ JSON-LD', () => {
    const output = faqJsonLd(config.faq ?? []);
    expect(output['@type']).toBe('FAQPage');
    expect((output.mainEntity as Array<Record<string, unknown>>)[0].name).toBe('Does it post automatically?');
  });

  it('generates a sitemap XML document', () => {
    const output = generateSitemap(config);
    expect(output).toContain('<urlset');
    expect(output).toContain('<loc>https://reply.example/pricing</loc>');
  });

  it('generates robots with a real sitemap line', () => {
    expect(generateRobots(config)).toContain('Sitemap: https://reply.example/sitemap.xml');
  });
});

