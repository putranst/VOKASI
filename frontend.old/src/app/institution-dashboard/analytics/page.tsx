"use client";

/**
 * AM-003: Institution-wide Analytics Dashboard
 * Route: /institution-dashboard/analytics
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2, BookOpen, Users, CheckCircle, FileText,
  Award, MessageSquare, ChevronLeft, Loader2, Trophy,
  TrendingUp, RefreshCw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Totals {
  courses: number;
  unique_learners: number;
  block_completions: number;
  reflections: number;
  certificates: number;
  discussion_posts: number;
}

interface BlockTypeEntry {
  block_type: string;
  count: number;
}

interface CourseEntry {
  course_id: number;
  course_title: string;
  learner_count: number;
  completed_blocks: number;
  total_blocks: number;
  completion_rate: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  completed_blocks: number;
}

interface AnalyticsData {
  totals: Totals;
  block_type_histogram: BlockTypeEntry[];
  per_course: CourseEntry[];
  leaderboard: LeaderboardEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BLOCK_COLORS: Record<string, string> = {
  ModuleHeader: "bg-zinc-800",
  RichContent: "bg-blue-600",
  VideoBlock: "bg-red-500",
  SocraticChat: "bg-indigo-600",
  QuizBuilder: "bg-amber-500",
  CodeSandbox: "bg-zinc-600",
  PeerReviewRubric: "bg-pink-500",
  ReflectionJournal: "bg-teal-600",
  Assignment: "bg-orange-500",
  DiscussionSeed: "bg-violet-600",
};

const BLOCK_ICONS: Record<string, string> = {
  ModuleHeader: "🏷",
  RichContent: "📄",
  VideoBlock: "🎬",
  SocraticChat: "🤖",
  QuizBuilder: "✅",
  CodeSandbox: "💻",
  PeerReviewRubric: "👥",
  ReflectionJournal: "📔",
  Assignment: "📋",
  DiscussionSeed: "💬",
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InstitutionAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/institution/analytics`);
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const maxBlockCount = data
    ? Math.max(...data.block_type_histogram.map((b) => b.count), 1)
    : 1;

  const maxLearnerCount = data
    ? Math.max(...data.per_course.map((c) => c.learner_count), 1)
    : 1;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/institution-dashboard")}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={15} />
            Dashboard
          </button>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2">
            <BarChart2 size={15} className="text-blue-600" />
            <span className="text-sm font-bold text-zinc-900">Institution Analytics</span>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-zinc-400" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            Failed to load analytics: {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Platform Overview
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard icon={BookOpen}      label="Puck Courses"       value={data.totals.courses}           color="bg-zinc-800" />
                <StatCard icon={Users}         label="Unique Learners"    value={data.totals.unique_learners}   color="bg-blue-600" />
                <StatCard icon={CheckCircle}   label="Block Completions"  value={data.totals.block_completions} color="bg-emerald-600" />
                <StatCard icon={FileText}      label="Reflections"        value={data.totals.reflections}       color="bg-teal-600" />
                <StatCard icon={Award}         label="Certificates"       value={data.totals.certificates}      color="bg-amber-500" />
                <StatCard icon={MessageSquare} label="Discussion Posts"   value={data.totals.discussion_posts}  color="bg-violet-600" />
              </div>
            </section>

            {/* ── Block-type histogram + leaderboard (side by side) ──────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Block-type popularity */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <TrendingUp size={15} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-zinc-900">Block Type Usage</h2>
                  <span className="ml-auto text-[10px] text-zinc-400">across all courses</span>
                </div>
                {data.block_type_histogram.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-400">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.block_type_histogram.map((item) => {
                      const pct = Math.round((item.count / maxBlockCount) * 100);
                      const color = BLOCK_COLORS[item.block_type] ?? "bg-zinc-400";
                      return (
                        <div key={item.block_type}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                              <span>{BLOCK_ICONS[item.block_type] ?? "📦"}</span>
                              {item.block_type}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500">{item.count}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100">
                            <div
                              className={`h-2 rounded-full transition-all ${color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Learner leaderboard */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Trophy size={15} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-zinc-900">Top Learners</h2>
                  <span className="ml-auto text-[10px] text-zinc-400">by blocks completed</span>
                </div>
                {data.leaderboard.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-400">No learner activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.leaderboard.map((entry) => (
                      <div
                        key={entry.user_id}
                        className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-2.5"
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          entry.rank === 1 ? "bg-amber-400 text-white" :
                          entry.rank === 2 ? "bg-zinc-300 text-zinc-700" :
                          entry.rank === 3 ? "bg-orange-400 text-white" :
                          "bg-zinc-100 text-zinc-500"
                        }`}>
                          {entry.rank}
                        </span>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                          {entry.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="flex-1 truncate text-xs font-medium text-zinc-800">{entry.name}</span>
                        <span className="text-xs font-semibold text-zinc-500">
                          {entry.completed_blocks} blok
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ── Per-course table ────────────────────────────────────────── */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <BarChart2 size={15} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-zinc-900">Course Activity</h2>
                <span className="ml-auto text-[10px] text-zinc-400">top 10 by learners</span>
              </div>
              {data.per_course.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-400">No course activity yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        <th className="pb-2 text-left">Course</th>
                        <th className="pb-2 text-right">Learners</th>
                        <th className="pb-2 text-right">Blocks done</th>
                        <th className="pb-2 text-right">Completion</th>
                        <th className="pb-2 pl-6 text-left w-40">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {data.per_course.map((c) => {
                        const barPct = Math.round((c.learner_count / maxLearnerCount) * 100);
                        return (
                          <tr key={c.course_id} className="group hover:bg-zinc-50/60 transition-colors">
                            <td className="py-3 pr-4 font-medium text-zinc-800 max-w-[220px] truncate">
                              {c.course_title}
                            </td>
                            <td className="py-3 text-right text-zinc-600">{c.learner_count}</td>
                            <td className="py-3 text-right text-zinc-600">
                              {c.completed_blocks}/{c.total_blocks * c.learner_count || "—"}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`font-semibold ${c.completion_rate >= 70 ? "text-emerald-600" : c.completion_rate >= 40 ? "text-amber-600" : "text-zinc-500"}`}>
                                {c.completion_rate}%
                              </span>
                            </td>
                            <td className="py-3 pl-6">
                              <div className="h-1.5 w-full rounded-full bg-zinc-100">
                                <div
                                  className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
