/**
 * Cloudflare Env bindings type.
 *
 * Generated bindings live in `.wrangler/types/worker-configuration.d.ts`
 * (run `bun run cf-typegen`). This hand-written interface documents the
 * bindings the app depends on so the auth/db layers can import a stable type
 * before the generated file exists.
 */
export interface CloudflareEnv {
  // App relational data (D1)
  DB: D1Database;
  // OpenNext tag-cache (D1)
  NEXT_TAG_CACHE_D1: D1Database;
  // OpenNext incremental cache (KV)
  NEXT_INC_CACHE_KV: KVNamespace;
  // Feature flags (KV)
  FLAGS: KVNamespace;
  // Uploads bucket (R2)
  UPLOADS: R2Bucket;
  // Static assets
  ASSETS: Fetcher;
  // Outbox queue (transactional-outbox pattern from the spike)
  OUTBOX_QUEUE: Queue<unknown>;
  /** Cloudflare Email Service (wrangler send_email binding named EMAIL) */
  EMAIL?: {
    send(message: {
      to: string | string[];
      from: string | { email: string; name?: string };
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
    }): Promise<{ messageId?: string } | void>;
  };
  // Vars
  ENVIRONMENT: string;
  EMAIL_FROM: string;
  EMAIL_REPLY_TO: string;
  // Secrets (.dev.vars / wrangler secret) - optional in scaffold
  BETTER_AUTH_SECRET?: string;
  /** @deprecated prefer EMAIL binding (Cloudflare Email Service) */
  RESEND_API_KEY?: string;
  CRON_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
}

declare global {
  interface ProcessEnv {
    ENVIRONMENT?: string;
    BETTER_AUTH_SECRET?: string;
    NEXT_PUBLIC_BETTER_AUTH_URL?: string;
  }
}
