/**
 * The capability list every /docs/harnesses/* guide opens with.
 *
 * All seven guides carried a byte-identical copy. Keeping one copy means the
 * command and tool lists cannot drift apart between harnesses, which the
 * never-invent-capabilities rule in CLAUDE.md depends on.
 */
export function HarnessWhatYouGet() {
  return (
    <>
      <h2>What you get</h2>
      <ul>
        <li>
          CLI bins: <code>geoaeo</code> and <code>geoaeo-mcp</code>
        </li>
        <li>
          CLI commands: <code>audit</code>, <code>init</code>, <code>gen</code>,{" "}
          <code>humanize</code>, <code>mcp</code>. No other commands exist.
        </li>
        <li>
          MCP server command: <code>npx -y geoaeo mcp</code> over stdio
        </li>
        <li>
          MCP tools: <code>audit</code>, <code>gen</code>, <code>humanize</code>
        </li>
      </ul>
    </>
  );
}
