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
  /** Default true. false disallows training crawlers and keeps answer engines allowed. */
  allowTrainingCrawlers?: boolean;
  /** Contact line for ai.txt. Defaults to siteUrl. */
  contact?: string;
  /** ISO date for ai.txt and llms-full.txt. Defaults to the build date. */
  lastUpdated?: string;
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
    allowTrainingCrawlers: config.allowTrainingCrawlers ?? true,
  };
}

export function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, "");
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.replace(/^\/+/, ""), `${normalizeSiteUrl(siteUrl)}/`).toString();
}
