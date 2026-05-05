"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { clearSession, fetchMe, loadSession, type UserPublic } from "@/lib/auth";

type AuthGuardRenderProps = {
  user: UserPublic;
  signOut: () => void;
};

export default function AuthGuard({
  children,
  loginPath = "/login",
}: {
  children: (props: AuthGuardRenderProps) => ReactNode;
  loginPath?: string;
}) {
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
        if (!cancelled) {
          clearSession();
          setUser(null);
          setError(err instanceof Error ? err.message : "Failed to load account");
        }
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

  function signOut(): void {
    clearSession();
    setUser(null);
    setError(null);
  }

  if (loading) {
    return (
      <section className="card">
        <p>Loading session...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="card">
        <h2>You are not signed in</h2>
        <p>{error ?? "Please login to continue."}</p>
        <Link href={loginPath} className="btn btn-primary">
          Go to Login
        </Link>
      </section>
    );
  }

  return <>{children({ user, signOut })}</>;
}
