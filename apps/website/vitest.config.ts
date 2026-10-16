import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Tests import the library source so a missing dist build does not skip them.
      geoaeo: path.resolve(__dirname, "../../packages/geoaeo/src/index.ts"),
    },
  },
});
