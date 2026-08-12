import { describe, expect, it } from "vitest";
import * as schema from "../src/db/schema";

describe("wave2 domain schema exports", () => {
  const tables = [
    "workspaceTable",
    "workspaceMemberTable",
    "agentTable",
    "agentMemoryTable",
    "skillTable",
    "toolTable",
    "agentIntegrationTable",
    "threadTable",
    "messageTable",
    "itemTable",
    "webhookTable",
    "auditLogTable",
    "settingTable",
    "billingTable",
    "billingEventTable",
    "visitorSessionTable",
    "apiKeyTable",
    "outboxTable",
    "uploadTable",
    "noteTable",
  ] as const;

  for (const name of tables) {
    it(`exports ${name}`, () => {
      expect((schema as Record<string, unknown>)[name]).toBeTruthy();
    });
  }

  it("agent table has workspace + public key columns", () => {
    const cols = Object.keys(schema.agentTable);
    // drizzle table objects expose columns on the table object
    expect(schema.agentTable.workspaceId).toBeTruthy();
    expect(schema.agentTable.publicKey).toBeTruthy();
  });

  it("message denormalizes workspaceId for RLS-style filters", () => {
    expect(schema.messageTable.workspaceId).toBeTruthy();
    expect(schema.messageTable.threadId).toBeTruthy();
  });
});
