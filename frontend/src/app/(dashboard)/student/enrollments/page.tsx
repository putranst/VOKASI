"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";

interface EnrollmentData {
  id: string;
  course: string;
  instructor: string;
  institution: string;
  progress: number;
  status: string;
  modules: number;
  completedModules: number;
  avgScore: number;
  competencyBreakdown: { name: string; score: number }[];
  lastActivity: string;
  certificate: boolean;
  // API snake_case fields
  course_title?: string;
  instructor_name?: string;
  institution_name?: string;
  module_count?: number;
  completed_modules?: number;
  course_status?: string;
  enrolled_at?: string;
}

function normalizeEnrollment(raw: EnrollmentData): EnrollmentData {
  const completedModules = raw.completedModules ?? raw.completed_modules ?? 0;
  const totalModules = raw.modules ?? raw.module_count ?? 0;
  const progress = raw.progress ?? (totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);
  return {
    id: raw.id,
    course: raw.course ?? raw.course_title ?? "",
    instructor: raw.instructor ?? raw.instructor_name ?? "",
    institution: raw.institution ?? raw.institution_name ?? "",
    progress,
    status: raw.status ?? raw.course_status ?? "enrolled",
    modules: totalModules,
    completedModules,
    avgScore: raw.avgScore ?? 0,
    competencyBreakdown: raw.competencyBreakdown ?? [],
    lastActivity: raw.lastActivity ?? raw.enrolled_at ?? "",
    certificate: raw.certificate ?? false,
  };
}

const DOMAIN_COLORS: Record<string, string> = {
  "AI Fundamentals — Batch 3": "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  "Prompt Engineering Mastery": "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  "ML Model Evaluation & Benchmarking": "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }} />
    </div>
  );
}

export default function EnrollmentsPage() {
  const { token } = useAuthStore();
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "enrolled" | "completed">("all");
  const [selected, setSelected] = useState<EnrollmentData | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEnrollments(Array.isArray(data) ? data.map(normalizeEnrollment) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load enrollments:", err);
        setEnrollments([]);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  const filtered = enrollments.filter(e => filter === "all" || e.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <p className="text-slate-400 text-sm mt-1">Track your enrollments, progress, and certificates</p>
      </div>

      <div className="flex gap-2">
        {(["all", "enrolled", "completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              filter === f ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-70">
              {f === "all" ? enrollments.length : enrollments.filter(e => e.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.map(course => (
            <div key={course.id}
              className={`bg-slate-900 border rounded-xl p-5 bg-gradient-to-br ${DOMAIN_COLORS[course.course] ?? "border-slate-700"} hover:border-emerald-500/40 transition-all cursor-pointer group`}
              onClick={() => setSelected(course)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{course.course}</h3>
                  <p className="text-slate-400 text-sm">{course.instructor} · {course.institution}</p>
                </div>
                {course.certificate && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                    🜂 Certificate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1"><ProgressBar value={course.progress} /></div>
                <span className="text-sm font-medium text-slate-300 w-12 text-right">{course.progress}%</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{course.completedModules}/{course.modules} modules</span>
                <span>·</span>
                <span>Avg Score: {course.avgScore}</span>
                <span>·</span>
                <span>Active {course.lastActivity}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No courses found
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selected ? (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4">{selected.course}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-slate-400 text-xs">Progress</div>
                    <div className="text-xl font-bold text-white">{selected.progress}%</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-slate-400 text-xs">Avg Score</div>
                    <div className="text-xl font-bold text-white">{selected.avgScore}</div>
                  </div>
                </div>

                {/* Competency Breakdown */}
                {selected.competencyBreakdown.length > 0 && (
                  <div>
                    <h4 className="text-sm text-slate-400 mb-2">Competency Progress</h4>
                    <div className="space-y-2">
                      {selected.competencyBreakdown.map(c => (
                        <div key={c.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">{c.name}</span>
                            <span className="text-slate-400">{c.score}/100</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                              style={{ width: `${c.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Link href={`/student/arena`}
                    className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg text-center transition-colors">
                    Continue Learning →
                  </Link>
                  <Link href={`/student/portfolio`}
                    className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg text-center transition-colors">
                    View Portfolio
                  </Link>
                  {selected.certificate && (
                    <Link href={`/student/certificates`}
                      className="w-full px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium rounded-lg text-center transition-colors border border-amber-500/30">
                      🜂 View Certificate
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-sm text-center">Select a course to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}