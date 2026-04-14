"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import { clearSession, fetchMe, loadSession, UserPublic } from "@/lib/auth";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize(): Promise<void> {
      const { token, user: storedUser } = loadSession();
      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cancelled && storedUser) {
        setUser(storedUser);
      }

      try {
        const freshUser = await fetchMe(token);
        if (!cancelled) {
          setUser(freshUser);
          setError(null);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setError(err instanceof Error ? err.message : "Failed to load account");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Track progress, recent activity, and upcoming learning tasks."
    >
      {loading ? (
        <section className="card">
          <p>Loading session...</p>
        </section>
      ) : !user ? (
        <section className="card">
          <h2>You are not signed in</h2>
          <p>{error ?? "Please login to see your dashboard."}</p>
          <Link href="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </section>
      ) : (
        <section className="grid two-col">
          <article className="card">
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </article>
          <article className="card">
            <h2>Session Controls</h2>
            <p>Authenticated successfully against `/api/v1/users/me`.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                clearSession();
                setUser(null);
              }}
            >
              Sign Out
            </button>
          </article>
        </section>
      )}
    </AppShell>
  );
}
