import Link from "next/link";

export const metadata = { title: "Dashboard · Cloudflare Master Template" };

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Multi-tenant product shell (Wave 3). Use workspaces API and settings to manage
          membership.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { href: "/dashboard/agents", title: "Agents", body: "Configure AI agents" },
          { href: "/dashboard/threads", title: "Threads", body: "Conversations" },
          { href: "/dashboard/settings/workspaces", title: "Workspaces", body: "Tenancy & members" },
          { href: "/dashboard/billing", title: "Billing", body: "Plan & usage" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors"
          >
            <div className="font-medium">{card.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{card.body}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
