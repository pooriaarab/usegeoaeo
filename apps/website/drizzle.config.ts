import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  // D1 is SQLite-backed. drizzle-kit generates migrations we apply via wrangler.
});
