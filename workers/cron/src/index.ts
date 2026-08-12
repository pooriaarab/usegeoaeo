/**
 * Cron Worker. Does NOT do work directly. It calls back into the Next.js app
 * over authenticated HTTP so scheduled jobs run inside the OpenNext runtime
 * with full access to D1/Queues/Drizzle. Pattern lifted from Content Rabbit.
 *
 * Secret: set via `wrangler secret put CRON_SECRET --env production` (this
 * worker) and the same value as an app secret/env var.
 */
interface Env {
  APP_URL: string;
  ENVIRONMENT: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const start = Date.now();
        try {
          const res = await fetch(`${env.APP_URL}/api/v1/cron/health`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.CRON_SECRET}`,
              "Content-Type": "application/json",
              "X-Cron-Pattern": controller.cron,
              "X-Scheduled-Time": controller.scheduledTime.toString(),
            },
          });
          console.log(
            JSON.stringify({
              level: res.ok ? "info" : "error",
              route: "/api/v1/cron/health",
              status: res.status,
              cron: controller.cron,
              responseMs: Date.now() - start,
            }),
          );
          if (!res.ok) {
            throw new Error(`cron callback failed: HTTP ${res.status}`);
          }
        } catch (err) {
          console.error("[cron] failed", err);
          throw err;
        }
      })(),
    );
  },

  // Manual trigger for local testing.
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/__test") {
      // Never expose a manual cron trigger in production. In development it
      // still requires the same shared secret as the app callback.
      if (env.ENVIRONMENT === "production") return new Response("Not found", { status: 404 });
      if (request.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
      }
      await this.scheduled?.(
        {
          cron: "* * * * *",
          type: "scheduled",
          scheduledTime: Date.now(),
          noRetry() {},
        } as ScheduledController,
        env,
        ctx,
      );
      return new Response("cron test fired - check logs");
    }
    return new Response("cron worker. GET /__test to fire manually.");
  },
};
