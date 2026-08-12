import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/create-api-handler";
import * as repo from "@/lib/skills/repository";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1).max(120),
  body: z.string().min(1),
  description: z.string().max(2000).optional(),
});

export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId }) => {
    const items = await repo.listByWorkspace(workspaceId);
    return NextResponse.json({ items });
  },
});

export const POST = createApiHandler({
  auth: "user",
  input: CreateSchema,
  handler: async ({ workspaceId, body, session }) => {
    const row = await repo.create(workspaceId, body, session?.userId);
    return NextResponse.json({ item: row }, { status: 201 });
  },
});
