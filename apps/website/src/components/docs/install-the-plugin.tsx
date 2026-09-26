/**
 * Plugin install lead-in for Claude Code, Cursor, and Codex.
 * JSON or TOML paste stays the fallback for the other harnesses.
 */
type PluginHarness = "shared" | "claude-code" | "cursor" | "codex";

const slashCommands = `/plugin marketplace add pooriaarab/usegeoaeo
/plugin install geoaeo@geoaeo`;

const codexCommands = `codex plugin marketplace add pooriaarab/usegeoaeo
codex plugin add geoaeo@geoaeo`;

export function InstallThePlugin({ harness }: { harness: PluginHarness }) {
  const commands = harness === "codex" ? codexCommands : slashCommands;
  return (
    <>
      <h2>Install the plugin</h2>
      <PluginIntro harness={harness} />
      <pre>
        <code>{commands}</code>
      </pre>
      <p>
        The plugin starts <code>npx geoaeo mcp</code> over stdio. MCP tools are <code>audit</code>,{" "}
        <code>gen</code>, and <code>humanize</code>.
      </p>
      <PluginFallback harness={harness} />
    </>
  );
}

function PluginIntro({ harness }: { harness: PluginHarness }) {
  if (harness === "codex") {
    return (
      <p>
        Codex uses the same marketplace as <code>/plugin marketplace add pooriaarab/usegeoaeo</code>. Run these
        commands in your terminal:
      </p>
    );
  }
  if (harness === "shared") {
    return <p>In Claude Code, Cursor, or Codex:</p>;
  }
  const name = harness === "claude-code" ? "Claude Code" : "Cursor";
  return <p>Run these two commands in {name}:</p>;
}

function PluginFallback({ harness }: { harness: PluginHarness }) {
  if (harness === "shared") {
    return (
      <p>Windsurf, Gemini CLI, Continue, and Copilot have no plugin dialect. Use the JSON fallback below.</p>
    );
  }
  if (harness === "codex") {
    return <p>The TOML paste below is the fallback if you want to wire the server by hand.</p>;
  }
  return <p>JSON paste below is the fallback if you want to wire the server by hand.</p>;
}
