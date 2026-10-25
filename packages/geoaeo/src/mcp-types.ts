export type RegisterTool = (
  name: string,
  config: {
    title: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema?: unknown;
    annotations: Record<string, boolean>;
  },
  handler: (...args: never[]) => unknown,
) => void;
