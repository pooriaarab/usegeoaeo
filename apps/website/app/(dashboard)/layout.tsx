import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold">
          Template
        </Link>
        <nav className="flex gap-3 text-sm text-muted-foreground">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/agents">Agents</Link>
          <Link href="/dashboard/threads">Threads</Link>
          <Link href="/dashboard/settings">Settings</Link>
          <Link href="/dashboard/billing">Billing</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
