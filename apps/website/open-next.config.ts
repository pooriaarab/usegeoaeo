import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// Marketing site: KV incremental cache only. Add the D1 tag cache + DO queue back
// when the site needs on-demand revalidation (tags) or accounts.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
