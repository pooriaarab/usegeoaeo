export interface CloudflareEnv {
  DB: D1Database;
  NEXT_TAG_CACHE_D1: D1Database;
  NEXT_INC_CACHE_KV: KVNamespace;
  FLAGS: KVNamespace;
  UPLOADS: R2Bucket;
  ASSETS: Fetcher;
  OUTBOX_QUEUE: Queue<unknown>;
  ENVIRONMENT: string;
  EMAIL_FROM: string;
  EMAIL_REPLY_TO: string;
  BETTER_AUTH_SECRET?: string;
  RESEND_API_KEY?: string;
  CRON_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
}

export async function getFlag<T = boolean>(
  kv: KVNamespace,
  name: string,
  defaultValue: T
): Promise<T> {
  const key = `flag:${name}`;
  const value = await kv.get(key);
  if (value === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

export async function setFlag<T = boolean>(
  kv: KVNamespace,
  name: string,
  value: T
): Promise<void> {
  const key = `flag:${name}`;
  const valueStr = typeof value === "string" ? value : JSON.stringify(value);
  await kv.put(key, valueStr);
}
