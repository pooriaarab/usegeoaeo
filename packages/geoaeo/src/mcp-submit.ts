import { z } from "zod";
import { submitIndexNow } from "./submit.js";
import type { RegisterTool } from "./mcp-types.js";

const submitHostSchema = z
  .string()
  .optional()
  .describe("Host that owns the URLs, without a scheme. Defaults to the first URL's host.");
const submitKeySchema = z
  .string()
  .describe("IndexNow key the site serves at https://<host>/<key>.txt. 8 to 128 hex characters.");
const submitKeyLocationSchema = z
  .string()
  .optional()
  .describe("Absolute URL of the key file. Defaults to https://<host>/<key>.txt.");
const submitUrlsSchema = z
  .array(z.string())
  .min(1)
  .describe("Absolute http(s) URLs to announce. Every one must sit on the host.");

export function registerSubmitTool(registerTool: RegisterTool) {
  registerTool(
    "submit",
    {
      title: "Announce URLs to IndexNow",
      description:
        "Post URLs to IndexNow so Bing, Yandex, Naver, Seznam, and Yep recrawl them. Needs the key the site already serves at https://<host>/<key>.txt. This calls a third party; ask the user first.",
      inputSchema: {
        urls: submitUrlsSchema,
        key: submitKeySchema,
        host: submitHostSchema,
        keyLocation: submitKeyLocationSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (input: { urls: string[]; key: string; host?: string; keyLocation?: string }) => {
      const result = await submitIndexNow({
        host: input.host ?? new URL(input.urls[0]).hostname,
        key: input.key,
        keyLocation: input.keyLocation,
        urls: input.urls,
      });
      return {
        content: [
          {
            type: "text",
            text: `sent ${result.sent} URL(s) in ${result.batches} batch(es), last status ${result.status}`,
          },
        ],
        structuredContent: result,
      };
    },
  );
}
