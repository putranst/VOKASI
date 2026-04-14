"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Track progress, recent activity, and upcoming learning tasks."
    >
      <AuthGuard>
        {({ user, signOut }) => (
          <section className="grid two-col">
            <article className="card">
              <h2>Welcome, {user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </article>
            <article className="card">
              <h2>Session Controls</h2>
              <p>Authenticated successfully against `/api/v1/users/me`.</p>
              <button type="button" className="btn btn-secondary" onClick={signOut}>
                Sign Out
              </button>
            </article>
          </section>
        )}
      </AuthGuard>
    </AppShell>
  );
}
