"use client";

/**
 * Auto-scrolling strip of the MCP harnesses geoaeo runs inside.
 * Uses one inline terminal glyph per entry -- no external requests.
 * Duplicated twice for seamless infinite scroll via CSS animation.
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
  { name: "GitHub Copilot", Logo: PromptLogo },
  { name: "Continue", Logo: PromptLogo },
];

export function IntegrationMarquee() {
  return (
    <section className="py-10 sm:py-14 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 mb-6">
        <p className="text-sm text-muted-foreground text-center">
          Works inside the AI coding agents your team already uses
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[0, 1].map((set) => (
            <div
              key={set}
              className="flex shrink-0 items-center gap-8 sm:gap-12 px-4 sm:px-6"
            >
              {integrations.map((integration) => (
                <div
                  key={`${set}-${integration.name}`}
                  className="flex items-center gap-2.5 shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <integration.Logo className="size-5 sm:size-6" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {integration.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
