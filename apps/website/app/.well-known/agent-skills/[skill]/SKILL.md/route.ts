import { markdownResponse } from "../../../../../src/utils/markdown-http";
export { markdownOptions as OPTIONS } from "../../../../../src/utils/markdown-http";

import { skillMarkdown } from "../../../../../src/generated/agent-skills.generated";

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(skillMarkdown).map((skill) => ({ skill }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ skill: string }> },
) {
  const { skill } = await context.params;
  if (!Object.hasOwn(skillMarkdown, skill)) {
    return new Response("Not Found", { status: 404 });
  }
  const markdown = skillMarkdown[skill];
  return markdownResponse(markdown, `/.well-known/agent-skills/${skill}/SKILL.md`);
}
