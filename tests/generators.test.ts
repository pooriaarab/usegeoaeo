import { describe, expect, it } from 'vitest';
import { defineConfig } from '../src/config.js';
import {
  articleJsonLd,
  faqJsonLd,
  generateJsonLd,
  generateLlms,
  generateLlmsFull,
  generateRobots,
  generateSitemap,
  generateWebmcp,
  howToJsonLd,
  personJsonLd,
  reviewJsonLd,
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

  it('generates Organization JSON-LD', () => {
    const output = generateJsonLd(config, 'organization');
    expect(output['@type']).toBe('Organization');
    expect(output.name).toBe('Reply Kit');
    expect(output.url).toBe('https://reply.example');
  });

  it('generates WebSite JSON-LD with a SearchAction', () => {
    const output = generateJsonLd(config, 'website');
    expect(output['@type']).toBe('WebSite');
    expect(output.name).toBe('Reply Kit');
    const action = output.potentialAction as Record<string, unknown>;
    expect(action['@type']).toBe('SearchAction');
    expect((action.target as Record<string, unknown>).urlTemplate).toBe(
      'https://reply.example/search?q={search_term_string}'
    );
  });

  it('generates Article JSON-LD', () => {
    const output = articleJsonLd(config, {
      headline: 'Ship faster replies',
      authorName: 'Ada',
      datePublished: '2026-01-01',
    });
    expect(output['@type']).toBe('Article');
    expect(output.headline).toBe('Ship faster replies');
    expect(output.datePublished).toBe('2026-01-01');
    expect((output.author as Record<string, unknown>).name).toBe('Ada');
  });

  it('generates HowTo JSON-LD', () => {
    const output = howToJsonLd(config, {
      name: 'Draft a reply',
      steps: ['Open the post', 'Pick a tone'],
    });
    expect(output['@type']).toBe('HowTo');
    expect(output.name).toBe('Draft a reply');
    expect((output.step as Array<Record<string, unknown>>)[0]).toEqual({
      '@type': 'HowToStep',
      position: 1,
      text: 'Open the post',
    });
  });

  it('generates Person JSON-LD', () => {
    const output = personJsonLd(config, { name: 'Ada Lovelace', jobTitle: 'Engineer' });
    expect(output['@type']).toBe('Person');
    expect(output.name).toBe('Ada Lovelace');
    expect(output.jobTitle).toBe('Engineer');
    expect((output.worksFor as Record<string, unknown>)['@type']).toBe('Organization');
  });

  it('generates Review JSON-LD', () => {
    const output = reviewJsonLd(config, {
      authorName: 'Ada',
      ratingValue: 4,
      reviewBody: 'Saves an hour a day.',
    });
    expect(output['@type']).toBe('Review');
    expect((output.itemReviewed as Record<string, unknown>).name).toBe('Reply Kit');
    const rating = output.reviewRating as Record<string, unknown>;
    expect(rating['@type']).toBe('Rating');
    expect(rating.ratingValue).toBe(4);
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

