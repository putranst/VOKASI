"use client";

/**
 * AM-004: Student Profile + Learning History
 * Route: /profile
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award, BookOpen, Loader2, LogOut, Flame, Star,
  FileText, ChevronRight, CheckCircle, Clock, User,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    career_pathway_id: string | null;
    joined_at: string | null;
  };
  stats: {
    courses_in_progress: number;
    courses_completed: number;
    certificates_earned: number;
    reflections_written: number;
  };
  puck_courses: Array<{
    course_id: number;
    course_title: string;
    total_blocks: number;
    completed_blocks: number;
    pct: number;
    last_activity: string | null;
  }>;
  certificates: Array<{
    cert_code: string;
    course_title: string;
    issued_at: string | null;
  }>;
  streak: {
    current_streak: number;
    longest_streak: number;
    total_xp: number;
    this_week: boolean[];
  } | null;
  reflection_count: number;
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 leading-none">{value}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userObj = stored ? JSON.parse(stored) : null;
      const userId: number = userObj?.id ?? 0;
      if (!userId) { router.push("/login"); return; }

      try {
        const res = await fetch(`${API_BASE}/api/v1/users/${userId}/profile`);
        if (!res.ok) throw new Error(`${res.status}`);
        setProfile(await res.json());
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "vokasi_auth=; Max-Age=0; path=/";
    document.cookie = "vokasi_role=; Max-Age=0; path=/";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="font-semibold text-zinc-800">Gagal memuat profil</p>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <button onClick={() => router.push("/")} className="mt-4 text-sm text-zinc-600 underline">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, puck_courses, certificates, streak } = profile;
  const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-6 h-[52px]">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900">
              <span className="text-[11px] font-bold text-white">V</span>
            </div>
            VOKASI
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500">Profil</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/courses" className="text-xs text-zinc-500 hover:text-zinc-800">Kursus</Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <LogOut size={12} /> Keluar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">

        {/* ── Hero card ── */}
        <div className="flex items-center gap-5 rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 truncate">{user.name}</h1>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                user.role === "admin" ? "bg-red-100 text-red-700" :
                user.role === "instructor" ? "bg-violet-100 text-violet-700" :
                "bg-zinc-100 text-zinc-600"
              }`}>
                <User size={10} /> {user.role}
              </span>
              {user.joined_at && (
                <span className="text-[11px] text-zinc-400">
                  Bergabung {new Date(user.joined_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          {streak && (
            <div className="shrink-0 text-center">
              <div className="flex items-center gap-1 text-amber-500">
                <Flame size={18} className="fill-amber-400" />
                <span className="text-2xl font-bold text-zinc-900">{streak.current_streak}</span>
              </div>
              <p className="text-[10px] text-zinc-400">hari beruntun</p>
            </div>
          )}
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<BookOpen size={18} className="text-blue-600" />}
            label="Kursus aktif"
            value={stats.courses_in_progress}
            color="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle size={18} className="text-emerald-600" />}
            label="Kursus selesai"
            value={stats.courses_completed}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<Award size={18} className="text-amber-500" />}
            label="Sertifikat"
            value={stats.certificates_earned}
            color="bg-amber-50"
          />
          <StatCard
            icon={<FileText size={18} className="text-teal-600" />}
            label="Refleksi ditulis"
            value={stats.reflections_written}
            color="bg-teal-50"
          />
        </div>

        {/* ── Weekly streak ── */}
        {streak && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-900">Streak Belajar</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>Terpanjang: <strong className="text-zinc-700">{streak.longest_streak} hari</strong></span>
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <strong className="text-zinc-700">{streak.total_xp} XP</strong>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className={`h-8 w-full rounded-lg ${
                    streak.this_week[i]
                      ? "bg-amber-400"
                      : "bg-zinc-100"
                  }`} />
                  <span className="text-[10px] text-zinc-400">{day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Puck course progress ── */}
        {puck_courses.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4">
              <BookOpen size={15} className="text-zinc-500" />
              <h2 className="text-sm font-bold text-zinc-900">Progress Kursus</h2>
              <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                {puck_courses.length}
              </span>
            </div>
            <ul className="divide-y divide-zinc-100">
              {puck_courses.map((c) => (
                <li key={c.course_id}>
                  <Link
                    href={`/courses/${c.course_id}/learn/puck`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{c.course_title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              c.pct === 100 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-zinc-500">
                          {c.completed_blocks}/{c.total_blocks} blok
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {c.pct === 100 ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">Selesai</span>
                      ) : (
                        <span className="text-xs font-bold text-zinc-700">{c.pct}%</span>
                      )}
                      <ChevronRight size={14} className="text-zinc-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Certificates ── */}
        {certificates.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4">
              <Award size={15} className="text-amber-500" />
              <h2 className="text-sm font-bold text-zinc-900">Sertifikat</h2>
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                {certificates.length}
              </span>
            </div>
            <ul className="divide-y divide-zinc-100">
              {certificates.map((cert) => (
                <li key={cert.cert_code}>
                  <Link
                    href={`/certificates/${cert.cert_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                      <Award size={16} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{cert.course_title}</p>
                      {cert.issued_at && (
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(cert.issued_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ Valid</span>
                      <ChevronRight size={14} className="text-zinc-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Empty state ── */}
        {puck_courses.length === 0 && certificates.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
            <h2 className="text-base font-semibold text-zinc-700">Belum ada aktivitas</h2>
            <p className="mt-1 text-sm text-zinc-400">Mulai belajar kursus untuk melihat progress di sini.</p>
            <Link
              href="/courses"
              className="mt-5 inline-block rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Jelajahi Kursus →
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
