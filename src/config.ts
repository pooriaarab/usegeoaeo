export interface ToolConfig {
  name: string;
  url: string;
  description: string;
}

export interface PlanConfig {
  name: string;
  description?: string;
  price?: string | number;
  priceCurrency?: string;
}

export interface FaqConfig {
  question: string;
  answer: string;
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  description: string;
  platforms?: string[];
  tools: ToolConfig[];
  plans?: PlanConfig[];
  faq?: FaqConfig[];
  pages?: string[];
}

export function defineConfig(config: SiteConfig): SiteConfig {
  return {
    ...config,
    siteUrl: normalizeSiteUrl(config.siteUrl),
    platforms: config.platforms ?? [],
    tools: config.tools ?? [],
    plans: config.plans ?? [],
    faq: config.faq ?? [],
    pages: config.pages ?? [],
  };
}

export function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.replace(/^\/+/, ''), `${normalizeSiteUrl(siteUrl)}/`).toString();
}

