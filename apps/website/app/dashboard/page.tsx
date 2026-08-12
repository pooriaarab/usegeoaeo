import { headers } from "next/headers";
import Link from "next/link";
import { getAuth } from "@/server/auth";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  
  if (!session) {
    return (
      <main className="wrap" style={{ textAlign: "center", paddingTop: "80px" }}>
        <div className="card" style={{ padding: "40px 20px" }}>
          <h2>Protected Dashboard</h2>
          <p className="muted" style={{ marginBottom: "24px" }}>
            You need to be signed in to access the full capabilities of the template dashboard.
          </p>
          <Link className="btn" href="/login">
            Sign in or Register
          </Link>
          <div style={{ marginTop: "20px" }}>
            <Link className="muted" href="/">Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return <DashboardClient user={session.user} />;
}
