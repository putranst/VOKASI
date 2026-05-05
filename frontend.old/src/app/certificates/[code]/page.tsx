"use client";

/**
 * LE-006: Public Verifiable Certificate Page
 * Route: /certificates/[code]
 *
 * Publicly accessible — no auth required.
 * Shows certificate details and a verification badge.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Award, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CertData {
  valid: boolean;
  cert_code: string;
  student_name: string;
  course_title: string;
  issued_at: string;
  course_id: number;
}

export default function CertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/puck/certificate/${code}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`${res.status}`);
        setCert(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (code) load();
  }, [code]);

  const issuedDate = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="text-center max-w-sm">
          <XCircle className="mx-auto mb-5 h-14 w-14 text-red-300" />
          <h1 className="text-xl font-bold text-zinc-800">Sertifikat Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Kode sertifikat <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">{code}</code> tidak valid atau belum diterbitkan.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            ← Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl">

        {/* ── Verification badge ── */}
        <div className="mb-8 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 w-fit mx-auto">
          <ShieldCheck size={15} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Terverifikasi oleh VOKASI</span>
        </div>

        {/* ── Certificate card ── */}
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-xl ring-1 ring-zinc-100">

          {/* Decorative top band */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />

          <div className="px-10 pt-10 pb-8">
            {/* Logo + title */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">VOKASI Learning</p>
                <p className="text-xs text-zinc-400">Sertifikat Penyelesaian</p>
              </div>
            </div>

            {/* Award icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200 shadow-sm">
                <Award size={36} className="text-amber-500" />
              </div>
            </div>

            {/* Certificate text */}
            <div className="text-center mb-8">
              <p className="text-sm text-zinc-500 mb-2">Dengan bangga diberikan kepada</p>
              <h1 className="text-[34px] font-bold tracking-[-0.02em] text-zinc-900 leading-tight mb-3">
                {cert.student_name}
              </h1>
              <p className="text-sm text-zinc-500 mb-2">atas keberhasilan menyelesaikan</p>
              <h2 className="text-xl font-semibold text-zinc-800 mb-1">
                {cert.course_title}
              </h2>
              <p className="text-sm text-zinc-400">{issuedDate}</p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-100" />

            {/* Verification row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 mb-1">Kode Verifikasi</p>
                <code className="rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-xs text-zinc-700 select-all">
                  {cert.cert_code}
                </code>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                <CheckCircle size={13} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Valid</span>
              </div>
            </div>
          </div>

          {/* Decorative bottom watermark */}
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100/40 to-violet-100/40" />
        </div>

        {/* ── Actions ── */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cetak / Simpan PDF
          </button>
          <Link
            href={`/courses/${cert.course_id}`}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Lihat Kursus <ExternalLink size={13} />
          </Link>
        </div>

        {/* ── Verify link ── */}
        <p className="mt-5 text-center text-xs text-zinc-400">
          Verifikasi publik:{" "}
          <span className="font-mono">{typeof window !== "undefined" ? window.location.href : ""}</span>
        </p>
      </div>
    </div>
  );
}
