"use client";

/**
 * AM-002: Client-side Role Guard
 *
 * Wraps protected pages to enforce role access via the AuthContext
 * (covers the localStorage-auth path that Edge middleware cannot reach).
 *
 * Usage:
 *   <RoleGuard allowedRoles={["instructor", "admin"]}>
 *     <YourPage />
 *   </RoleGuard>
 */

import React, { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import type { VokasiRole } from "@/lib/roles";
import { roleAllowed } from "@/lib/roles";
import { ShieldX, LogIn, Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  /** Empty array = any authenticated user. */
  allowedRoles: VokasiRole[];
  /** Override redirect path for unauthenticated users. */
  loginPath?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  loginPath = "/login",
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const rule = { allowedRoles };
  const isAuthorized = user ? roleAllowed(user.role, rule) : false;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = typeof window !== "undefined" ? window.location.pathname : "";
      router.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, loginPath, router]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <LogIn className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
          <p className="font-semibold text-zinc-700">Silakan masuk terlebih dahulu</p>
          <p className="mt-1 text-sm text-zinc-500">Kamu akan diarahkan ke halaman login…</p>
        </div>
      </div>
    );
  }

  // ── Wrong role ─────────────────────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center max-w-sm">
          <ShieldX className="mx-auto mb-4 h-12 w-12 text-red-300" />
          <h1 className="text-xl font-bold text-zinc-800">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Halaman ini hanya dapat diakses oleh:{" "}
            <span className="font-semibold text-zinc-700">
              {allowedRoles.join(", ")}
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Role kamu saat ini: <span className="font-medium">{user.role}</span>
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
