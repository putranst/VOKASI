"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Script from "next/script";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError: (result: unknown) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

type PaymentState = "idle" | "loading" | "ready" | "success" | "pending" | "error" | "closed";

function BeasiswaPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cohortSlug = searchParams.get("cohort") ?? "beta-2026";
  const snapScriptLoaded = useRef(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  const [cohort, setCohort] = useState<{ id: number; current_price_usd: number; current_price_idr: number; name: string } | null>(null);
  const [mtClientKey, setMtClientKey] = useState(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
  const [mtEnv, setMtEnv] = useState((process.env.NEXT_PUBLIC_MIDTRANS_ENV ?? "sandbox").toLowerCase());
  const [orderId, setOrderId] = useState("");
  const [state, setState] = useState<PaymentState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [prepayReady, setPrepayReady] = useState(false);

  const waitForActivation = async (oid: string) => {
    const token = localStorage.getItem("token");
    for (let i = 0; i < 10; i++) {
      const r = await fetch(`${API_BASE}/api/v1/cohorts/${cohortSlug}/orders/${oid}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (r.ok) {
        const data = await r.json();
        const paid = Array.isArray(data.statuses) && data.statuses.some((s: string[]) => s?.[1] === "paid");
        if (paid) return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return false;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    setUserId(user.id);
    setUserEmail(user.email ?? "");
    setUserName(user.full_name || user.name || "");

    const ids = sessionStorage.getItem("selected_course_ids");
    if (ids) setSelectedCourseIds(JSON.parse(ids));
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v1/users/${user.id}/profile`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        const phase = profile?.onboarding_phase;
        if (phase !== "prepay_complete" && phase !== "postpay_in_progress" && phase !== "postpay_complete") {
          router.push("/onboarding");
          return;
        }
        setPrepayReady(true);
      })
      .catch(() => router.push("/onboarding"));

    // Fetch cohort data
    fetch(`${API_BASE}/api/v1/cohorts/${cohortSlug}`)
      .then((r) => r.json())
      .then((data) => {
        setCohort(data);
        if (data?.id) {
          sessionStorage.setItem("cohort_id", String(data.id));
        }
      })
      .catch(() => {});

    // Fetch Midtrans public config managed by admin settings
    fetch(`${API_BASE}/api/v1/integrations/midtrans-public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (!cfg) return;
        if (typeof cfg.client_key === "string") setMtClientKey(cfg.client_key);
        if (typeof cfg.env === "string") setMtEnv(cfg.env.toLowerCase());
      })
      .catch(() => {});
  }, []);

  const initiatePayment = async () => {
    if (!userId || selectedCourseIds.length !== 2) {
      setErrorMsg("Data tidak lengkap. Silakan ulangi proses dari awal.");
      return;
    }
    setState("loading");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v1/cohorts/${cohortSlug}/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          email: userEmail,
          full_name: userName,
          course_ids: selectedCourseIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409 && typeof err?.detail === "object") {
          const existingOrder = err.detail.order_id;
          throw new Error(`Masih ada pembayaran tertunda (Order: ${existingOrder}). Selesaikan transaksi sebelumnya terlebih dahulu.`);
        }
        throw new Error(typeof err?.detail === "string" ? err.detail : "Gagal membuat transaksi");
      }

      const data = await res.json();
      setOrderId(data.order_id);
      setState("ready");

      // Open Snap popup
      if (window.snap && data.snap_token && !data.snap_token.startsWith("mock-")) {
        window.snap.pay(data.snap_token, {
          onSuccess: () => {
            setState("success");
            sessionStorage.removeItem("selected_course_ids");
            waitForActivation(data.order_id).finally(() => {
              setTimeout(() => router.push("/onboarding/postpay"), 1200);
            });
          },
          onPending: () => setState("pending"),
          onError: () => {
            setState("error");
            setErrorMsg("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => setState("closed"),
        });
      } else {
        // Mock / dev mode
        setState("success");
        setTimeout(() => router.push("/onboarding/postpay"), 1500);
      }
    } catch (e: unknown) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
  };

  const snapSrc = mtEnv === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#061813] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Script
        src={snapSrc}
        data-client-key={mtClientKey}
        onLoad={() => { snapScriptLoaded.current = true; }}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-[#061813] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.24),transparent_35%),radial-gradient(circle_at_86%_10%,rgba(45,212,191,0.16),transparent_35%),linear-gradient(130deg,#04110e_0%,#052d24_50%,#03100d_100%)]" />
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Konfirmasi Pembayaran</h1>
            <p className="text-emerald-100/75 text-sm">Langkah terakhir sebelum akses belajar dibuka</p>
          </div>

          <div className="bg-white/95 rounded-2xl shadow-2xl border border-white/30 p-8 space-y-6 backdrop-blur-xl">
            {/* Order summary */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="text-sm text-emerald-700 font-medium mb-3">Ringkasan Pesanan</div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-700">
                  VOKASI Beta Scholarship<br />
                  <span className="text-xs text-gray-400">{cohortSlug} · 2 kursus pilihan</span>
                </span>
                <div className="text-right">
                  <div className="font-black text-[#1f2937] text-lg">
                    ${cohort?.current_price_usd ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Rp {cohort?.current_price_idr?.toLocaleString("id-ID") ?? "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-3">
                <ShieldCheck size={13} />
                Harga ini dikunci untuk akun kamu
              </div>
            </div>

            {/* Status display */}
            {state === "success" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="text-emerald-500" size={48} />
                <div className="text-center">
                  <p className="font-bold text-[#1f2937]">Pembayaran Berhasil!</p>
                  <p className="text-sm text-gray-500 mt-1">Kamu akan diarahkan ke dashboard…</p>
                </div>
              </div>
            )}

            {state === "pending" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Clock className="text-amber-500" size={48} />
                <div className="text-center">
                  <p className="font-bold text-[#1f2937]">Pembayaran Tertunda</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Selesaikan pembayaran sesuai instruksi. Kami akan mengaktifkan akses setelah dikonfirmasi.
                  </p>
                </div>
                <p className="text-xs text-gray-400">Order ID: {orderId}</p>
              </div>
            )}

            {state === "closed" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <AlertCircle className="text-gray-400" size={40} />
                <p className="text-sm text-gray-500 text-center">
                  Kamu menutup popup pembayaran. Klik tombol di bawah untuk melanjutkan.
                </p>
              </div>
            )}

            {(state === "error") && errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            {/* CTA button */}
            {state !== "success" && state !== "pending" && (
              <button
                onClick={initiatePayment}
                disabled={state === "loading" || !cohort || !prepayReady}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-base disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {state === "loading" ? (
                  <><Loader2 size={18} className="animate-spin" /> Memproses…</>
                ) : state === "closed" ? (
                  "Lanjutkan Pembayaran"
                ) : (
                  `Bayar $${cohort?.current_price_usd ?? "…"} via Midtrans`
                )}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center">
              Didukung oleh Midtrans · Transfer Bank, GoPay, OVO, QRIS, dan Kartu Kredit
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrapper with Suspense for useSearchParams
export default function BeasiswaPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#061813] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <BeasiswaPaymentContent />
    </Suspense>
  );
}
