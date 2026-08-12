import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8788",
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command:
          "bunx wrangler dev -c cloudflare/app-worker/wrangler.jsonc --local --port 8788",
        url: "http://localhost:8788/api/v1/health",
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
