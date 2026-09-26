import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { GENERATED_ARTIFACTS } from "../src/commands/gen.js";
import { JSON_LD_KINDS } from "../src/generators/jsonld.js";
import { createMcpServer, genHandler, MCP_GEN_ARTIFACTS, MCP_JSON_LD_KINDS } from "../src/mcp.js";

const fixture = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../examples/static-html",
);

type ToolResult = {
  content: Array<{ type: string; text: string }>;
  structuredContent?: { score?: number; target?: string; results?: unknown[] };
};

async function callMcpTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const server = createMcpServer();
  const client = new Client({ name: "geoaeo-test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  try {
    return (await client.callTool({ name, arguments: args })) as ToolResult;
  } finally {
    await client.close();
    await server.close();
  }
}

type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  additionalProperties?: unknown;
};

// A closed schema lets a client with a cached copy reject a response the
// server already produced, so every object level must stay open.
function assertOpenSchema(schema: JsonSchema, path: string): void {
  expect(schema.additionalProperties, `${path} must stay open`).not.toBe(false);
  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    assertOpenSchema(property, `${path}.${name}`);
  }
  if (schema.items !== undefined) assertOpenSchema(schema.items, `${path}[]`);
}

// Checks a callTool result against the schema listTools published, not a
// hardcoded copy: required fields are present and declared types match.
function assertMatchesPublishedSchema(value: unknown, schema: JsonSchema, path: string): void {
  if (schema.type === "array") {
    expect(Array.isArray(value), `${path} should be an array`).toBe(true);
    if (Array.isArray(value) && schema.items !== undefined) {
      value.forEach((item, index) =>
        assertMatchesPublishedSchema(item, schema.items as JsonSchema, `${path}[${index}]`),
      );
    }
    return;
  }
  if (schema.type === "object") {
    expect(typeof value, `${path} should be an object`).toBe("object");
    expect(value, `${path} should not be null`).not.toBeNull();
    const record = value as Record<string, unknown>;
    for (const name of schema.required ?? []) {
      expect(name in record, `${path} is missing required field ${name}`).toBe(true);
    }
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      if (name in record) assertMatchesPublishedSchema(record[name], property, `${path}.${name}`);
    }
    return;
  }
  if (schema.type === "string") expect(typeof value, `${path} should be a string`).toBe("string");
  if (schema.type === "number" || schema.type === "integer")
    expect(typeof value, `${path} should be a number`).toBe("number");
  if (schema.type === "boolean")
    expect(typeof value, `${path} should be a boolean`).toBe("boolean");
}

async function outputSchemaOf(client: Client, name: string): Promise<JsonSchema> {
  const { tools } = await client.listTools();
  const tool = tools.find((candidate) => candidate.name === name);
  expect(tool, `expected tool ${name} to be listed`).toBeDefined();
  const schema = (tool?.outputSchema ?? {}) as JsonSchema;
  expect(schema.type, `${name} should publish an object output schema`).toBe("object");
  return schema;
}

describe("createMcpServer", () => {
  it("keeps the gen artifact list and JSON-LD kinds equal to the CLI", () => {
    expect(MCP_GEN_ARTIFACTS).toEqual([...GENERATED_ARTIFACTS]);
    expect(MCP_JSON_LD_KINDS).toEqual([...JSON_LD_KINDS]);
  });

  it("returns a formatted audit report plus a numeric structured score", async () => {
    const result = await callMcpTool("audit", { target: fixture });
    const structured = result.structuredContent as { score: number; target: string };
    const text = result.content[0];
    expect(typeof structured.score).toBe("number");
    expect(text.type).toBe("text");
    if (text.type !== "text") throw new Error("expected a text content block");
    expect(text.text.startsWith(`${structured.target}: ${structured.score}/100`)).toBe(true);
  });

  it("returns a humanize count line plus a structured findings array", async () => {
    const result = await callMcpTool("humanize", { glob: "examples/static-html/README.md" });
    const text = result.content[0];
    expect(text.type).toBe("text");
    if (text.type !== "text") throw new Error("expected a text content block");
    expect(text.text).toMatch(/^\d+ files, \d+ findings$/);
    const structured = result.structuredContent as { results: unknown[] };
    expect(Array.isArray(structured.results)).toBe(true);
  });
});

describe("MCP tools over an in-memory transport", () => {
  async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
    const server = createMcpServer();
    const client = new Client({ name: "geoaeo-test-client", version: "0.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    try {
      return await run(client);
    } finally {
      await client.close();
      await server.close();
    }
  }

  interface ToolResult {
    content?: { type: string; text?: string }[];
    structuredContent?: unknown;
    isError?: boolean;
  }

  async function callTool(
    client: Client,
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    return (await client.callTool({ name, arguments: args })) as ToolResult;
  }

  async function callToolText(
    client: Client,
    name: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    const result = await callTool(client, name, args);
    return (result.content ?? [])
      .map((item) => (item.type === "text" ? (item.text ?? "") : ""))
      .join("");
  }

  async function withFixture<T>(run: (directory: string) => Promise<T>): Promise<T> {
    const directory = await mkdtemp(path.join(tmpdir(), "geoaeo-mcp-"));
    expect(path.resolve(directory)).not.toBe(process.cwd());
    try {
      return await run(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it("gen reads the site config from the directory argument", async () => {
    await withFixture(async (directory) => {
      await writeFile(
        path.join(directory, "geoaeo.config.mjs"),
        `export const siteConfig = {
          siteName: 'FixtureSite92',
          siteUrl: 'https://fixture92.example.com',
          description: 'A fixture site for MCP directory tests.',
          tools: [],
        };\n`,
      );
      const text = await withClient((client) =>
        callToolText(client, "gen", { artifact: "llms", directory }),
      );
      expect(text).toContain("FixtureSite92");
    });
  });

  it("reports fixed tools and session instructions on initialize", async () => {
    await withClient(async (client) => {
      expect(client.getServerCapabilities()?.tools?.listChanged).toBe(false);
      expect(client.getInstructions()).toBe(
        "Call only audit, gen, or humanize. Audit a local directory or an http(s) URL first. audit returns a report and writes no files. gen reads geoaeo.config.ts, .js, or .mjs and returns the artifact as text. It writes no file. humanize writes a file only when write is true and the text changes. Ask the user before you set write.",
      );
    });
  });

  it("publishes titles, annotations, and described fields for every tool", async () => {
    await withClient(async (client) => {
      const { tools } = await client.listTools();
      const byName = new Map(tools.map((tool) => [tool.name, tool]));
      expect(tools.map((tool) => tool.name).sort()).toEqual(["audit", "gen", "humanize"]);
      for (const tool of tools) {
        expect(typeof tool.title, `${tool.name} needs a title`).toBe("string");
        expect(typeof tool.description).toBe("string");
        const schema = tool.inputSchema as {
          properties?: Record<string, { description?: unknown }>;
        };
        for (const [field, property] of Object.entries(schema.properties ?? {})) {
          expect(typeof property.description, `${tool.name}.${field} needs a description`).toBe(
            "string",
          );
        }
      }
      expect(byName.get("audit")).toMatchObject({
        title: "Audit a site",
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
      });
      expect(byName.get("gen")).toMatchObject({
        title: "Generate an artifact",
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      });
      expect(byName.get("gen")?.description).toContain("does not write a file");
      expect(byName.get("humanize")).toMatchObject({
        title: "Humanize prose",
        annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
      });
      const humanizeSchema = byName.get("humanize")?.inputSchema as {
        properties?: Record<string, { description?: string }>;
      };
      expect(humanizeSchema.properties?.write?.description).toContain("in place");
    });
  });

  it("publishes open output schemas for audit and humanize", async () => {
    await withClient(async (client) => {
      const auditSchema = await outputSchemaOf(client, "audit");
      const humanizeSchema = await outputSchemaOf(client, "humanize");
      expect(auditSchema.required).toEqual(expect.arrayContaining(["target", "score", "checks"]));
      expect(humanizeSchema.required).toEqual(["results"]);
      assertOpenSchema(auditSchema, "audit");
      assertOpenSchema(humanizeSchema, "humanize");
    });
  });

  it("audit structuredContent validates against its published output schema", async () => {
    await withClient(async (client) => {
      const schema = await outputSchemaOf(client, "audit");
      const result = await callTool(client, "audit", { target: fixture });
      // The SDK validates structuredContent against outputSchema server-side,
      // so no error here already proves the declared schema accepts the report.
      expect(result.isError).not.toBe(true);
      assertMatchesPublishedSchema(result.structuredContent, schema, "audit");
    });
  });

  it("humanize structuredContent validates against its published output schema", async () => {
    await withFixture(async (directory) => {
      await writeFile(path.join(directory, "post.md"), "A seamless tool.\n");
      await withClient(async (client) => {
        const schema = await outputSchemaOf(client, "humanize");
        const result = await callTool(client, "humanize", { glob: "*.md", directory });
        expect(result.isError).not.toBe(true);
        assertMatchesPublishedSchema(result.structuredContent, schema, "humanize");
      });
    });
  });

  it("humanize scans files under the directory argument", async () => {
    await withFixture(async (directory) => {
      const file = path.join(directory, "post.md");
      await writeFile(file, "A seamless tool.\n");
      const result = await withClient((client) =>
        callTool(client, "humanize", { glob: "*.md", directory }),
      );
      const { results } = result.structuredContent as {
        results: { file: string; findings: { rule: string }[] }[];
      };
      expect(results).toHaveLength(1);
      expect(results[0]?.file).toBe(file);
      expect(results[0]?.findings.length).toBeGreaterThan(0);
      // The text channel is a count line since #93, so the file list is proof
      // the directory argument landed, not the summary sentence.
      const text = (result.content ?? []).map((item) => item.text ?? "").join("");
      expect(text).toBe("1 files, 1 findings");
    });
  });

  it("returns CONFIG_MISSING when the directory has no config", async () => {
    await withFixture(async (directory) => {
      const result = await withClient((client) =>
        callTool(client, "gen", { artifact: "llms", directory }),
      );
      const text = (result.content ?? []).map((item) => item.text ?? "").join("");
      expect(result.isError).toBe(true);
      expect(text).toBe(
        `No geoaeo.config.ts in ${directory}. Run geoaeo init in that directory, replace the placeholder facts, then call gen again.`,
      );
      expect(result.structuredContent).toEqual({
        status: "error",
        error: { code: "CONFIG_MISSING", message: "No geoaeo.config.ts" },
      });
    });
  });

  it("returns CONFIG_INVALID when the config file has no default export", async () => {
    await withFixture(async (directory) => {
      await writeFile(path.join(directory, "geoaeo.config.mjs"), "export const unused = 1;\n");
      const result = await withClient((client) =>
        callTool(client, "gen", { artifact: "llms", directory }),
      );
      const text = (result.content ?? []).map((item) => item.text ?? "").join("");
      expect(result.isError).toBe(true);
      expect(text).toBe(
        `geoaeo.config.mjs in ${directory} has no default export. Export a default config or siteConfig, then call gen again.`,
      );
      expect(result.structuredContent).toEqual({
        status: "error",
        error: { code: "CONFIG_INVALID", message: "No default export" },
      });
    });
  });

  it("rethrows a gen failure that is not a known config state", async () => {
    await withFixture(async (directory) => {
      await writeFile(
        path.join(directory, "geoaeo.config.mjs"),
        'throw new Error("disk exploded");\n',
      );
      await expect(genHandler({ artifact: "llms", directory })).rejects.toThrow("disk exploded");
    });
  });
});
