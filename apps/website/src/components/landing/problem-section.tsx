import { FileText, Braces, FileCode } from "lucide-react";

const problems = [
  {
    icon: FileText,
    title: "No llms.txt",
    description:
      "Language models index sites without a map. Without llms.txt or llms-full.txt, crawlers miss key docs, product specs, and pricing.",
  },
  {
    icon: Braces,
    title: "No structured data",
    description:
      "Without schema.org JSON-LD, answer engines guess entity types, FAQ pairs, and software details instead of citing verified facts.",
  },
  {
    icon: FileCode,
    title: "No Markdown mirrors",
    description:
      "Client-side JavaScript and bloated HTML burn context tokens. Agents truncate pages before finding the answer.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            The problem
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
            Why sites stay invisible to answer engines
          </h2>
          <p className="text-muted-foreground text-fluid-sm sm:text-base">
            Traditional search indexes links. AI answer engines synthesize direct answers
            from structured, machine-readable artifacts—and skip sites that lack them.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group relative p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors"
            >
              <div className="size-9 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/[0.06] transition-colors">
                <p.icon className="size-[18px] text-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
