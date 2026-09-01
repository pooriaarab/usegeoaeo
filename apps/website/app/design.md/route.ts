import { designContext } from "../../src/generated/design-context.generated";

export const dynamic = "force-static";

export function GET() {
  return new Response(designContext, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
