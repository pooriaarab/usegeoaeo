import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const PLACEHOLDER = "__PREVIEW_KV_ID__";

// JSONC allows comments and trailing commas; strip both while leaving string
// contents untouched. "//" inside a URL must not be rewritten, so this scans
// character by character instead of regexing.
function stripJsonc(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === "\\" ? 2 : 1;
      if (j >= text.length) throw new Error("Unterminated string in wrangler config");
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (c === "/" && text[i + 1] === "/") {
      const end = text.indexOf("\n", i + 2);
      i = end === -1 ? text.length : end;
    } else if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end === -1) throw new Error("Unterminated block comment in wrangler config");
      i = end + 2;
    } else if (c === "," && /^\s*[}\]]/.test(text.slice(i + 1))) {
      i += 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

// prepareCache accepts strict JSON only, so this renders a template with the
// single KV placeholder it substitutes. Keys not in its CONFIG_KEYS allowlist
// (env, routes, other bindings) never reach the Preview config.
export function previewSource(config) {
  const name = config?.env?.staging?.name;
  if (typeof name !== "string" || !name) throw new Error("wrangler config has no env.staging.name");
  const source = {};
  for (const key of ["main", "compatibility_date", "compatibility_flags", "minify", "assets", "observability", "placement"]) {
    if (config[key] !== undefined) source[key] = config[key];
  }
  source.name = name;
  source.workers_dev = false;
  source.preview_urls = false;
  source.kv_namespaces = [{ binding: "NEXT_INC_CACHE_KV", id: PLACEHOLDER }];
  source.vars = { ENVIRONMENT: "preview", WORKER_PREVIEW: "true" };
  return source;
}

function main() {
  const [sourcePath, outputPath] = process.argv.slice(2);
  if (!sourcePath || !outputPath) throw new Error("Usage: worker-preview-source.mjs <wrangler.jsonc> <output.json>");
  writeFileSync(outputPath, `${JSON.stringify(previewSource(JSON.parse(stripJsonc(readFileSync(sourcePath, "utf8")))), null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
