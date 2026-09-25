import { serverCardJson } from "../../../../src/generated/server-card.generated";

export const dynamic = "force-static";

export function GET() {
  return new Response(serverCardJson, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
