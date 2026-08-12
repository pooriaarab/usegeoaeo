import type { FaqConfig, SiteConfig } from '../config.js';
import { absoluteUrl } from '../config.js';

export type JsonLdKind =
  | 'software'
  | 'product'
  | 'faq'
  | 'breadcrumb'
  | 'organization'
  | 'website'
  | 'article'
  | 'howto'
  | 'person'
  | 'review';

export interface ArticleInput {
  headline?: string;
  description?: string;
  url?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
}

export interface HowToInput {
  name?: string;
  description?: string;
  steps?: string[];
}

export interface PersonInput {
  name?: string;
  jobTitle?: string;
  url?: string;
}

export interface ReviewInput {
  itemName?: string;
  authorName?: string;
  reviewBody?: string;
  ratingValue?: number;
}

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

export function organizationJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.siteName,
    description: config.description,
    url: config.siteUrl,
  };
}

export function webSiteJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    description: config.description,
    url: config.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function articleJsonLd(
  config: SiteConfig,
  article: ArticleInput = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline ?? config.siteName,
    description: article.description ?? config.description,
    url: article.url === undefined ? config.siteUrl : absoluteUrl(config.siteUrl, article.url),
    author: { '@type': 'Person', name: article.authorName ?? config.siteName },
    ...(article.datePublished === undefined ? {} : { datePublished: article.datePublished }),
    ...(article.dateModified === undefined ? {} : { dateModified: article.dateModified }),
  };
}

export function howToJsonLd(
  config: SiteConfig,
  howTo: HowToInput = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name ?? config.siteName,
    description: howTo.description ?? config.description,
    step: (howTo.steps ?? []).map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text,
    })),
  };
}

export function personJsonLd(
  config: SiteConfig,
  person: PersonInput = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name ?? config.siteName,
    ...(person.jobTitle === undefined ? {} : { jobTitle: person.jobTitle }),
    url: person.url === undefined ? config.siteUrl : absoluteUrl(config.siteUrl, person.url),
    worksFor: { '@type': 'Organization', name: config.siteName },
  };
}

export function reviewJsonLd(
  config: SiteConfig,
  review: ReviewInput = {}
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'Product', name: review.itemName ?? config.siteName },
    author: { '@type': 'Person', name: review.authorName ?? config.siteName },
    ...(review.reviewBody === undefined ? {} : { reviewBody: review.reviewBody }),
    ...(review.ratingValue === undefined
      ? {}
      : {
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.ratingValue,
            bestRating: 5,
            worstRating: 1,
          },
        }),
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
  if (kind === 'organization') return organizationJsonLd(config);
  if (kind === 'website') return webSiteJsonLd(config);
  if (kind === 'article') return articleJsonLd(config);
  if (kind === 'howto') return howToJsonLd(config);
  if (kind === 'person') return personJsonLd(config);
  if (kind === 'review') return reviewJsonLd(config);
  return softwareApplicationJsonLd(config);
}
