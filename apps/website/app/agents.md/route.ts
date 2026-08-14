import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-static";

function readRootAgentsMd(): string {
  const candidates = [
    join(process.cwd(), "AGENTS.md"),
    join(process.cwd(), "..", "..", "AGENTS.md"),
  ];
  for (const file of candidates) {
    try {
      return readFileSync(file, "utf8");
    } catch {
      // try the next monorepo-relative location
    }
  }
  throw new Error("root AGENTS.md not found");
}

export function GET() {
  return new Response(readRootAgentsMd(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
