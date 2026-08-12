import type { FaqConfig, SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

export type JsonLdKind = 'software' | 'product' | 'faq' | 'breadcrumb';

export function softwareApplicationJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.siteName,
    description: config.description,
    url: config.siteUrl,
    applicationCategory: 'WebApplication',
    offers: (config.plans ?? []).map(plan => ({
      '@type': 'Offer',
      name: plan.name,
      ...(plan.price === undefined ? {} : { price: String(plan.price) }),
      priceCurrency: plan.priceCurrency ?? 'USD',
    })),
  };
}

export function productJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.siteName,
    description: config.description,
    url: config.siteUrl,
    brand: { '@type': 'Brand', name: config.siteName },
  };
}

export function faqJsonLd(items: FaqConfig[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateJsonLd(config: SiteConfig, kind: JsonLdKind = 'software'): Record<string, unknown> {
  if (kind === 'product') return productJsonLd(config);
  if (kind === 'faq') return faqJsonLd(config.faq ?? []);
  if (kind === 'breadcrumb') {
    return breadcrumbJsonLd([
      { name: config.siteName, url: config.siteUrl },
      ...(config.tools.length ? [{ name: config.tools[0].name, url: absoluteUrl(config.siteUrl, config.tools[0].url) }] : []),
    ]);
  }
  return softwareApplicationJsonLd(config);
}

