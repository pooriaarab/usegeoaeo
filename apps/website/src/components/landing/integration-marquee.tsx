/**
 * The strip of MCP harnesses geoaeo runs inside.
 * Uses one inline terminal glyph per entry -- no external requests.
 * A static flush-left row: the page carries exactly one authored motion
 * (the red square in the hero), so nothing scrolls here.
 */

function PromptLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 7 5 5-5 5" />
      <path d="M12 19h7" />
    </svg>
  );
}

const integrations = [
  { name: "Claude Code", Logo: PromptLogo },
  { name: "Cursor", Logo: PromptLogo },
  { name: "Windsurf", Logo: PromptLogo },
  { name: "Codex", Logo: PromptLogo },
  { name: "Gemini CLI", Logo: PromptLogo },
  { name: "Copilot", Logo: PromptLogo },
  { name: "Continue", Logo: PromptLogo },
];

export function IntegrationMarquee() {
  return (
    <section className="py-10 sm:py-14 px-5">
      <div className="mx-auto max-w-6xl border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-6">
          Works inside your coding agent via geoaeo-mcp over stdio
        </p>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-12">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-2.5 shrink-0 text-muted-foreground"
            >
              <integration.Logo className="size-5 sm:size-6" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {integration.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
