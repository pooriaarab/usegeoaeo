import { markdownResponse } from "../../src/utils/markdown-http";
export { markdownOptions as OPTIONS } from "../../src/utils/markdown-http";

import { designContext } from "../../src/generated/design-context.generated";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(designContext, "/design.md");
}
