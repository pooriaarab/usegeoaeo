import pkg from "../package.json";

export const PKG_NAME = pkg.name;
export const VERSION = pkg.version;
export const CONFIG_FILENAME = `${PKG_NAME}.config.ts`;

/** Paths no AI system should read. Shared by ai.txt and robots.txt. */
export const AI_EXCLUDED_PATHS = ["/api/", "/admin/", "/dashboard/", "/auth/"] as const;
