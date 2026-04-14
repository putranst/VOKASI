"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile"
      subtitle="Manage basic account data from the authenticated session."
    >
      <AuthGuard>
        {({ user, signOut }) => (
          <section className="grid two-col">
            <article className="card">
              <h2>Account</h2>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </article>
            <article className="card">
              <h2>Security</h2>
              <p>This starter uses bearer token auth in local storage.</p>
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
