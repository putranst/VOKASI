"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function PostPaymentOnboardingPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const complete = async () => {
    setError("");
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userRaw);
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/onboarding/postpay/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: user.id, consent_completed: agreed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Gagal menyelesaikan onboarding");
      }
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071a16] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white/95 rounded-2xl p-8 border border-white/30">
        <h1 className="text-2xl font-black text-[#1f2937] mb-2">Onboarding Lanjutan</h1>
        <p className="text-sm text-gray-600 mb-6">
          Pembayaran sudah dikonfirmasi. Selesaikan langkah ini untuk mengaktifkan akses penuh.
        </p>
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
            <span>Saya siap mengikuti orientasi dan menyelesaikan jalur belajar VOKASI.</span>
          </label>
        </div>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <button
          disabled={!agreed || loading}
          onClick={complete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Memproses…</> : <><CheckCircle2 size={16} /> Selesaikan Onboarding</>}
        </button>
      </div>
    </div>
  );
}
