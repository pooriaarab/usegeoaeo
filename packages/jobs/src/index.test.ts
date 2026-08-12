import { describe, expect, test } from "bun:test";
import { sendJob, type QueueJobMessage } from "./index";

describe("Jobs Helpers", () => {
  test("sendJob throws if message has no id", async () => {
    const mockQueue = {
      send: async () => {},
    } as any;

    const invalidMsg = {
      type: "job.demo",
      payload: { message: "no id" },
      createdAt: new Date().toISOString(),
    } as any;

    expect(sendJob(mockQueue, invalidMsg)).rejects.toThrow(
      "Idempotency key 'id' is required for all queue messages."
    );
  });

  test("sendJob sends correctly when id is present", async () => {
    let sentMessage: any = null;
    const mockQueue = {
      send: async (msg: any) => {
        sentMessage = msg;
      },
    } as any;

    const validMsg: QueueJobMessage = {
      type: "job.demo",
      id: "job_123",
      payload: { message: "with id" },
      createdAt: new Date().toISOString(),
    };

    await sendJob(mockQueue, validMsg);
    expect(sentMessage).toEqual(validMsg);
  });
});
