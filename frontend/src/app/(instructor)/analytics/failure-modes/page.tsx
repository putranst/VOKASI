"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { AlertTriangle, TrendingDown, BookOpen, Users, BarChart2 } from "lucide-react";

interface FailurePattern {
  challenge_title: string;
  domain_tags: string[];
  failure_count: number;
  revision_count: number;
  bias_related: number;
  prompt_related: number;
  hallucination_related: number;
  ethics_related: number;
  technical_error_related: number;
}

interface StudentResilience {
  user_id: string;
  full_name: string;
  anonymous_handle: string;
  total_submissions: number;
  revision_requests: number;
  revision_rate: number;
  reflection_count: number;
  failure_resume_count: number;
}

export default function InstructorFailureModesPage() {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [data, setData] = useState<{
    failurePatterns: FailurePattern[];
    topKeywords: { keyword: string; count: number }[];
    studentResilience: StudentResilience[];
    categoryFailureRates: { domain_tags: string[]; failures: number; failure_rate: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCourses(d.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title })));
      });
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCourse) return;
    setLoading(true);
    fetch(`/api/analytics/instructor/${selectedCourse}/failure-modes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [token, selectedCourse]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1f2937] flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          Failure Mode Analytics
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Identifikasi pola kegagalan umum di kelasmu untuk干预 yang tepat waktu.
          Failure Resume students yang aktif menunjukkan growth mindset.
        </p>
      </div>

      {/* Course selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[#1f2937]">Kursus:</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
        >
          <option value="">Pilih kursus...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {!selectedCourse && (
        <div className="text-center py-16 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
          <TrendingDown className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Pilih kursus untuk melihat pola kegagalan</p>
        </div>
      )}

      {loading && selectedCourse && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]" />
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Failure by category */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(data.categoryFailureRates as { domain_tags: string[]; failures: number; failure_rate: number }[]).map((cat, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">
                    {(cat.domain_tags as string[]).join(", ")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-rose-600">{cat.failure_rate}%</p>
                <p className="text-xs text-zinc-500">{cat.failures} submissions gagal</p>
              </div>
            ))}
          </div>

          {/* Top failure keywords */}
          {data.topKeywords.length > 0 && (
            <section className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Kata Kunci Failure yang Sering Muncul
              </h2>
              <div className="flex flex-wrap gap-2">
                {(data.topKeywords as { keyword: string; count: number }[]).map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-sm"
                  >
                    {kw.keyword} <span className="font-bold ml-1">{kw.count}x</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Failure patterns by challenge */}
          <section>
            <h2 className="font-semibold text-[#1f2937] mb-3">Pola Failure per Challenge</h2>
            <div className="space-y-3">
              {(data.failurePatterns as FailurePattern[]).map((fp, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-[#1f2937]">{fp.challenge_title}</p>
                      <div className="flex gap-1 mt-1">
                        {(fp.domain_tags as string[]).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-rose-600">{fp.failure_count}</p>
                      <p className="text-xs text-zinc-500">total failures</p>
                    </div>
                  </div>

                  {/* Failure breakdown */}
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {[
                      { label: "Bias", count: fp.bias_related },
                      { label: "Prompt", count: fp.prompt_related },
                      { label: "Hallucination", count: fp.hallucination_related },
                      { label: "Ethics", count: fp.ethics_related },
                      { label: "Tech Error", count: fp.technical_error_related },
                    ].map(({ label, count }) => (
                      <div key={label} className="text-center">
                        <p className="text-sm font-bold text-zinc-700">{count}</p>
                        <p className="text-xs text-zinc-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Student resilience */}
          <section>
            <h2 className="font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Student Resilience Scores
            </h2>
            <p className="text-sm text-zinc-500 mb-3">
              Students dengan Failure Resume aktif menunjukkan growth mindset. Revision rate tinggi bukan hal buruk — itu menunjukkan usaha dan迭代.
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Student</th>
                    <th className="text-center px-3 py-3 font-medium text-zinc-600">Submissions</th>
                    <th className="text-center px-3 py-3 font-medium text-zinc-600">Revision Rate</th>
                    <th className="text-center px-3 py-3 font-medium text-zinc-600">Reflections</th>
                    <th className="text-center px-3 py-3 font-medium text-zinc-600">Failure Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.studentResilience as StudentResilience[]).map((sr, i) => {
                    const revisionRate = Number(sr.revision_rate ?? 0);
                    return (
                      <tr key={i} className="border-b border-zinc-100 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1f2937]">
                            {sr.anonymous_handle ?? sr.full_name}
                          </p>
                        </td>
                        <td className="text-center px-3 py-3 text-zinc-600">{sr.total_submissions}</td>
                        <td className="text-center px-3 py-3">
                          <span className={`font-medium ${
                            revisionRate > 50 ? "text-rose-600" :
                            revisionRate > 20 ? "text-amber-600" : "text-emerald-600"
                          }`}>
                            {revisionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center px-3 py-3 text-zinc-600">{sr.reflection_count}</td>
                        <td className="text-center px-3 py-3">
                          {sr.failure_resume_count > 0 ? (
                            <span className="text-emerald-600 font-medium">✓ {sr.failure_resume_count} entries</span>
                          ) : (
                            <span className="text-zinc-400 text-xs">Belum ada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
