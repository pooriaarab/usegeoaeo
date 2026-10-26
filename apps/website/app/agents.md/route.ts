import { markdownResponse } from "../../src/utils/markdown-http";
export { markdownOptions as OPTIONS } from "../../src/utils/markdown-http";

import { agentsMd } from "../../src/generated/agents-md.generated";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(agentsMd, "/agents.md");
}
