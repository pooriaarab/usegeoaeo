import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // OpenNext on Cloudflare requires these
  experimental: {
    // Minify for worker bundle size
    optimizePackageImports: ["better-auth", "drizzle-orm"],
  },
};

export default nextConfig;
