import { assertAllowedPath, PathOutsideAllowedRootsError } from "./allowed-roots.js";

export function pathToolError(error: PathOutsideAllowedRootsError) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: error.message }],
    structuredContent: {
      status: "error",
      error: { code: error.code, message: error.message },
    },
  };
}

export async function pathBoundError(
  input: string,
  roots: readonly string[] | undefined,
  allowHttpUrl = false,
) {
  try {
    await assertAllowedPath(input, roots, allowHttpUrl);
    return undefined;
  } catch (error) {
    if (error instanceof PathOutsideAllowedRootsError) return pathToolError(error);
    throw error;
  }
}
