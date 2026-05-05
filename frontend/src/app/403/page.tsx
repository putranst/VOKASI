"use client";

import { ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="text-center max-w-sm px-6">
        <ShieldX className="mx-auto mb-5 h-14 w-14 text-red-300" />
        <h1 className="text-2xl font-bold text-zinc-800">403 — Akses Ditolak</h1>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          Kamu tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika kamu yakin ini adalah kesalahan.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            ← Kembali
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
