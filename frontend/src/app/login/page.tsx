"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/components/AppShell";
import { loginRequest, saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@vokasi.dev");
  const [password, setPassword] = useState("student123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => loading || !email.trim() || !password.trim(),
    [loading, email, password],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isDisabled) return;

    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest(email.trim(), password);
      saveSession(result.access_token, result.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Login"
      subtitle="Sign in with demo credentials to test auth and dashboard flow."
    >
      <section className="card" style={{ maxWidth: 560 }}>
        <h2>Demo Credentials</h2>
        <p>Email: student@vokasi.dev | Password: student123</p>
        <p>Email: instructor@vokasi.dev | Password: instructor123</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="btn btn-primary" disabled={isDisabled}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
