import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        <li>
          <Link className="underline" href="/dashboard/settings/workspaces">
            Workspaces
          </Link>
        </li>
        <li>
          <Link className="underline" href="/dashboard/settings/api-keys">
            API keys
          </Link>
        </li>
        <li>
          <Link className="underline" href="/dashboard/settings/audit-logs">
            Audit logs
          </Link>
        </li>
      </ul>
    </div>
  );
}
