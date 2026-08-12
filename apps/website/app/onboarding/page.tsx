export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-lg py-16 px-5 space-y-4">
      <h1 className="text-2xl font-bold">Onboarding</h1>
      <p className="text-muted-foreground text-sm">
        Create a workspace from Settings → Workspaces, then explore the dashboard.
      </p>
      <a className="underline text-sm" href="/dashboard/settings/workspaces">
        Go to workspaces
      </a>
    </main>
  );
}
