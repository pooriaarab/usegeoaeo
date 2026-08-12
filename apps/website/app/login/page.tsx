import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="wrap">
      <h1>Create account</h1>
      <Suspense fallback={<p className="muted">Loading sign-in…</p>}>
        <LoginForm />
      </Suspense>
      <p className="muted">
        Scaffold uses email/password only. OAuth and other providers activate when their env vars are set.
      </p>
    </main>
  );
}
