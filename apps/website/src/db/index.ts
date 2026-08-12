import { getCloudflareContext, initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import "server-only";

import type { CloudflareEnv } from "@/types/cloudflare-env";

import * as schema from "./schema";

/**
 * D1 -> Drizzle bridge. Pattern lifted from Content Rabbit (proven).
 *
 * `getCloudflareContext({ async: true })` resolves the Worker env bindings at
 * runtime on Workers, and during `next dev` via the OpenNext dev shim.
 */
export let db: DrizzleD1Database<typeof schema> | null = null;
// Raw (no app schema) instance for the Better Auth adapter, which expects its
// own tables and errors if passed our app schema.
export let dbRaw: DrizzleD1Database<Record<string, never>> | null = null;

let devInitDone = false;

async function getEnv(): Promise<CloudflareEnv> {
  let env = (await getCloudflareContext({ async: true })).env as CloudflareEnv;

  // During `next dev` the OpenNext dev context may not be initialized in some
  // Turbopack worker contexts; re-init once if the binding is missing.
  if (!env.DB && !devInitDone && process.env.NODE_ENV === "development") {
    const cwd = process.cwd();
    await initOpenNextCloudflareForDev({
      configPath: `${cwd}/cloudflare/app-worker/wrangler.jsonc`,
      persist: { path: `${cwd}/.wrangler/state` },
    });
    devInitDone = true;
    env = (await getCloudflareContext({ async: true })).env as CloudflareEnv;
  }

  return env;
}

export const getDB = async (): Promise<DrizzleD1Database<typeof schema>> => {
  if (db) return db;
  const env = await getEnv();
  if (!env.DB) throw new Error("D1 binding 'DB' not found");
  db = drizzle(env.DB, { schema });
  return db;
};

export const getDBRaw = async (): Promise<DrizzleD1Database<Record<string, never>>> => {
  if (dbRaw) return dbRaw;
  const env = await getEnv();
  if (!env.DB) throw new Error("D1 binding 'DB' not found");
  dbRaw = drizzle(env.DB);
  return dbRaw;
};
