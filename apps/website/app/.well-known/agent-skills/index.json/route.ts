import { NextResponse } from "next/server";

import { agentSkillsIndex } from "../../../../src/generated/agent-skills.generated";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(agentSkillsIndex);
}
