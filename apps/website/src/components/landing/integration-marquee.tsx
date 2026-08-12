"use client";

/**
 * Auto-scrolling integration logo strip.
 * Uses inline SVG paths -- no external requests.
 * Duplicated twice for seamless infinite scroll via CSS animation.
 */

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function SlackLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.163 0a2.528 2.528 0 012.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.163 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.315A2.528 2.528 0 0124 15.163a2.528 2.528 0 01-2.522 2.523h-6.315z" />
    </svg>
  );
}

function StripeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function FigmaLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 8.943h-4.588c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.943H8.148zm4.587 15.057h-4.588c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.039H8.148zm11.194-3.02c0 2.476-2.014 4.49-4.49 4.49h-3.117V8.942h3.117c2.476 0 4.49 2.015 4.49 4.491v.037zm-4.49 3.02c1.665 0 3.019-1.355 3.019-3.02s-1.355-3.019-3.019-3.019h-3.117v6.039h3.117z" />
    </svg>
  );
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

function NotionLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.56 2.45c-.42-.326-.98-.7-2.055-.607L3.71 2.846c-.466.046-.56.28-.374.466zm.793 3.08v13.906c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.934-.56.934-1.167V6.355c0-.606-.233-.933-.747-.886l-15.177.887c-.56.046-.747.326-.747.932zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.934-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.232V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.31-1.026c1.636-.14 2.055-.047 3.082.7l4.249 2.986c.7.514.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726L5.83 23.783c-.98.047-1.448-.093-1.962-.746L.78 19.666c-.56-.7-.793-1.213-.793-1.822V2.762c0-.793.373-1.54 1.95-1.727z" />
    </svg>
  );
}

function LinearLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.224 14.577l8.199 8.199a11.11 11.11 0 01-8.199-8.199zM.071 11.66a11.15 11.15 0 001.418 5.573L11.233 7.49A11.15 11.15 0 005.66.071L.071 11.66zm6.884-9.837a11.15 11.15 0 00-2.07 1.36L17.818 16.115a11.15 11.15 0 001.36-2.07L6.955 1.823zm3.817-1.327L21.504 11.23A11.063 11.063 0 0022.928 7.7L16.3 1.072a11.063 11.063 0 00-5.528 1.424zm7.276.826l5.121 5.121a11.2 11.2 0 00-5.121-5.121z" />
    </svg>
  );
}

function TwilioLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.381 0 0 5.381 0 12s5.381 12 12 12 12-5.381 12-12S18.619 0 12 0zm0 20.8c-4.857 0-8.8-3.943-8.8-8.8S7.143 3.2 12 3.2s8.8 3.943 8.8 8.8-3.943 8.8-8.8 8.8zm3.6-11.24a1.96 1.96 0 11-3.92 0 1.96 1.96 0 013.92 0zm0 4.88a1.96 1.96 0 11-3.92 0 1.96 1.96 0 013.92 0zm-4.88 0a1.96 1.96 0 11-3.92 0 1.96 1.96 0 013.92 0zm0-4.88a1.96 1.96 0 11-3.92 0 1.96 1.96 0 013.92 0z" />
    </svg>
  );
}

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.741.254a6.046 6.046 0 00-5.765 4.175 5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0014.258 24a6.046 6.046 0 005.77-4.175 5.985 5.985 0 003.997-2.9 6.046 6.046 0 00-.743-7.104z" />
    </svg>
  );
}

function SentryLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.91 2.505c-.873-1.53-3.053-1.53-3.926 0L7.862 6.16a8.683 8.683 0 014.126 7.39h-2.71a5.97 5.97 0 00-2.84-5.088L4.39 12.26a3.26 3.26 0 011.572 2.79H2.19a.49.49 0 01-.425-.245.503.503 0 010-.497l1.164-2.04a2.246 2.246 0 00-.6-.46L1.167 13.85a2.022 2.022 0 000 1.996 2.022 2.022 0 001.75 1.004h4.537a4.775 4.775 0 00-2.287-4.07l1.123-1.97a6.736 6.736 0 013.228 5.79h1.49a.255.255 0 00.208-.12l.07-.122a8.432 8.432 0 00-4.016-7.18l1.468-2.576a10.93 10.93 0 015.21 9.327h1.49a.255.255 0 00.208-.12l.07-.122c.348-.606.606-1.26.758-1.94h2.256a.488.488 0 00.424-.245.5.5 0 000-.497l-4.044-7.09z" />
    </svg>
  );
}

function CloudflareLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 16.8h-9.2a.9.9 0 01-.15-1.78l.12-.02a4.4 4.4 0 01-.02-.45 4.35 4.35 0 018.2-2.02 3.15 3.15 0 013.55 3.02c0 .12 0 .24-.02.35a2.55 2.55 0 01.72 4.9H16.5z" />
    </svg>
  );
}

function ResendLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.023 0H21.97C23.09 0 24 .91 24 2.023v19.954A2.025 2.025 0 0121.977 24H2.023A2.023 2.023 0 010 21.977V2.023C0 .907.91 0 2.023 0zm4.95 17.05h2.507v-4.57h2.29l2.645 4.57h2.86l-2.975-4.953c1.57-.58 2.507-1.96 2.507-3.753 0-2.507-1.697-3.854-4.57-3.854H6.973v12.56zm2.506-6.856V6.78h2.41c1.39 0 2.177.672 2.177 1.707s-.788 1.707-2.177 1.707h-2.41z" />
    </svg>
  );
}

const integrations = [
  { name: "GitHub", Logo: GitHubLogo },
  { name: "Slack", Logo: SlackLogo },
  { name: "Stripe", Logo: StripeLogo },
  { name: "Linear", Logo: LinearLogo },
  { name: "Figma", Logo: FigmaLogo },
  { name: "Vercel", Logo: VercelLogo },
  { name: "Notion", Logo: NotionLogo },
  { name: "OpenAI", Logo: OpenAILogo },
  { name: "Sentry", Logo: SentryLogo },
  { name: "Cloudflare", Logo: CloudflareLogo },
  { name: "Resend", Logo: ResendLogo },
  { name: "Twilio", Logo: TwilioLogo },
];

export function IntegrationMarquee() {
  return (
    <section className="py-10 sm:py-14 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 mb-6">
        <p className="text-sm text-muted-foreground text-center">
          Integrates with the tools your team already uses
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
