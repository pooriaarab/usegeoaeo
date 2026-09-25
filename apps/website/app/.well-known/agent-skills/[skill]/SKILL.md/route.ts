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
  const markdown = skillMarkdown[skill];
  if (!markdown) return new Response("Not Found", { status: 404 });
  return new Response(markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
