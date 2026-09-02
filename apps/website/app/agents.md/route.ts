import { agentsMd } from "../../src/generated/agents-md.generated";

export const dynamic = "force-static";

export function GET() {
  return new Response(agentsMd, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
