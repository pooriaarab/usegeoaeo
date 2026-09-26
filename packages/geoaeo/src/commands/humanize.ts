import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { humanizeFile, type HumanizeResult } from "../humanize.js";

const TEXT_EXTENSIONS = new Set([".md", ".mdx", ".tsx", ".jsx", ".txt"]);

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(file)));
    else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(file);
  }
  return files;
}

function globRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escaped.replaceAll("**", "§").replaceAll("*", "[^/]*").replaceAll("§", ".*")}$`,
  );
}

export async function expandTextGlob(
  pattern: string,
  directory = process.cwd(),
): Promise<string[]> {
  const files = await filesIn(directory);
  const relativeFiles = files.map((file) => ({
    file,
    relative: path.relative(directory, file).replaceAll("\\", "/"),
  }));
  const matcher = globRegExp(pattern.replaceAll("\\", "/"));
  return relativeFiles
    .filter(
      (item) =>
        matcher.test(item.relative) ||
        (!pattern.includes("/") && matcher.test(path.basename(item.relative))),
    )
    .map((item) => item.file);
}

export async function humanizeGlob(
  pattern: string,
  options: { directory?: string; write?: boolean } = {},
): Promise<Map<string, HumanizeResult>> {
  const directory = options.directory ?? process.cwd();
  const files = await expandTextGlob(pattern, directory);
  const results = new Map<string, HumanizeResult>();
  for (const file of files) results.set(file, await humanizeFile(file, options.write ?? false));
  return results;
}

export async function countTextFiles(directory = process.cwd()): Promise<number> {
  const target = await stat(directory);
  return target.isDirectory() ? (await filesIn(directory)).length : 0;
}
