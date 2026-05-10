"use client";
/**
 * VOKASI2 — Instructor Analytics Dashboard
 * PRD v2.3 §5.4 Analytics Dashboard
 * Wired to GET /api/analytics/instructor/failure-patterns
 */
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, BookOpen, TrendingUp, Award, AlertTriangle, Loader2,
} from "lucide-react";

/* ── API response types ── */
interface FailurePatternChallenge {
  challenge_id: string;
  challenge_title: string;
  difficulty: string;
  domain_tags: string[];
  total_submissions: number;
  evaluated_count: number;
  avg_overall_score: number | null;
  min_reflection_score: number | null;
}

interface TopTheme {
  themes: string;
  cnt: string;
}

interface FailurePatternsResponse {
  challenges: FailurePatternChallenge[];
  top_failure_themes: TopTheme[];
}

interface Course {
  id: string;
  title: string;
  [key: string]: unknown;
}

/* ── Component display types ── */
interface ChallengeRow {
  name: string;
  promptEngineering: number;  // avg_overall_score
  modelEvaluation: number;    // min_reflection_score
  dataAnalysis: number;       // computed from evaluated_count ratio
  overall: number;            // avg_overall_score
  trend?: number;
}

interface DifficultyDistribution {
  name: string;
  submissions: number;
  avgScore: number;
}

interface DomainDistribution {
  name: string;
  value: number;
  color: string;
}

const DOMAIN_COLORS = [
  "#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#3b82f6", "#10b981",
];

export default function InstructorAnalyticsPage() {
  const token = useAuthStore((s) => s.token);
  const [challenges, setChallenges] = useState<FailurePatternChallenge[]>([]);
  const [topThemes, setTopThemes] = useState<TopTheme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch failure patterns ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const courseParam = selectedCourse ? `?courseId=${selectedCourse}` : "";
    fetch(`/api/analytics/instructor/failure-patterns${courseParam}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: FailurePatternsResponse) => {
        setChallenges(data.challenges ?? []);
        setTopThemes(data.top_failure_themes ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load failure patterns:", err);
        setError("Unable to load analytics data. Please try again.");
        setLoading(false);
      });
  }, [token, selectedCourse]);

  /* ── Fetch courses for selector ── */
  useEffect(() => {
    if (!token) return;
    fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.courses ?? data.data ?? [];
        setCourses(list);
      })
      .catch((err) => console.error("Failed to load courses:", err));
  }, [token]);

  /* ── Derived data ── */
  const kpiData = useMemo(() => {
    const totalSubmissions = challenges.reduce((s, c) => s + (c.total_submissions ?? 0), 0);
    const totalEvaluated = challenges.reduce((s, c) => s + (c.evaluated_count ?? 0), 0);
    const scores = challenges.filter((c) => c.avg_overall_score !== null).map((c) => c.avg_overall_score as number);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { totalSubmissions, totalEvaluated, avgScore, challengeCount: challenges.length };
  }, [challenges]);

  const difficultyData: DifficultyDistribution[] = useMemo(() => {
    const grouped: Record<string, { submissions: number; scores: number[] }> = {};
    for (const c of challenges) {
      const key = c.difficulty ?? "unknown";
      if (!grouped[key]) grouped[key] = { submissions: 0, scores: [] };
      grouped[key].submissions += c.total_submissions ?? 0;
      if (c.avg_overall_score !== null) grouped[key].scores.push(c.avg_overall_score);
    }
    return Object.entries(grouped).map(([name, d]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      submissions: d.submissions,
      avgScore: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
    }));
  }, [challenges]);

  const domainData: DomainDistribution[] = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of challenges) {
      for (const tag of c.domain_tags ?? []) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
      }));
  }, [challenges]);

  const challengeRows: ChallengeRow[] = useMemo(() =>
    challenges.map((c) => ({
      name: c.challenge_title,
      promptEngineering: c.avg_overall_score !== null ? Math.round(c.avg_overall_score) : 0,
      modelEvaluation: c.min_reflection_score !== null ? Math.round(c.min_reflection_score) : 0,
      dataAnalysis: c.evaluated_count > 0 ? Math.round((c.evaluated_count / (c.total_submissions || 1)) * 100) : 0,
      overall: c.avg_overall_score !== null ? Math.round(c.avg_overall_score) : 0,
      trend: undefined,
    })),
  [challenges]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-[#0d9488]" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-zinc-700 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 rounded-md bg-[#0d9488] text-white text-sm hover:bg-[#0b7e74] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Empty state ── */
  if (challenges.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
            <p className="text-sm text-zinc-500 mt-1">Failure pattern analysis &amp; competency insights</p>
          </div>
          {courses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-zinc-300 text-sm bg-white"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="w-12 h-12 text-zinc-300 mb-3" />
          <p className="text-zinc-500 text-sm">No challenge data available yet.</p>
          <p className="text-zinc-400 text-xs mt-1">Data will appear once students begin submitting.</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Submissions", value: kpiData.totalSubmissions, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Challenges", value: kpiData.challengeCount, icon: BookOpen, color: "text-[#0d9488]", bg: "bg-teal-50" },
    { label: "Avg Score", value: `${kpiData.avgScore}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Evaluated", value: kpiData.totalEvaluated, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Failure pattern analysis &amp; competency insights</p>
        </div>
        {courses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-zinc-300 text-sm bg-white"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Top Failure Themes */}
      {topThemes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> Top Failure Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {topThemes.map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1.5">
                <span className="text-xs text-amber-700">{t.themes}</span>
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-600">
                  {t.cnt}x
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-500">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Submissions by Difficulty */}
        <Card>
          <CardHeader><CardTitle className="text-base">Submissions &amp; Average Score by Difficulty</CardTitle></CardHeader>
          <CardContent>
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="submissions" fill="#0d9488" name="Submissions" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#f59e0b" name="Avg Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">No difficulty data</div>
            )}
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Domain Focus Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            {domainData.length > 0 ? (
              <>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={domainData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" stroke="none">
                      {domainData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {domainData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-zinc-600 flex-1">{item.name}</span>
                      <span className="text-xs font-medium text-zinc-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-48 text-zinc-400 text-sm">No domain data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Challenge Performance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Challenge Performance Heatmap</CardTitle>
          <p className="text-xs text-zinc-500">Per-challenge scores &amp; evaluation metrics</p>
        </CardHeader>
        <CardContent>
          {challengeRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 px-3 font-semibold text-zinc-700">Challenge</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-700">Avg Score</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-700">Min Reflection</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-700">Eval Rate</th>
                    <th className="text-center py-2 px-2 font-semibold text-zinc-700">Overall</th>
                    <th className="text-left py-2 px-2 font-semibold text-zinc-700">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {challengeRows.map((row, idx) => {
                    const scoreColor = (v: number) =>
                      v >= 80 ? "bg-emerald-100 text-emerald-700" :
                      v >= 60 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700";
                    const diff = challenges[idx];
                    const diffBadge =
                      diff?.difficulty === "hard" ? "bg-red-100 text-red-700" :
                      diff?.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700";
                    return (
                      <tr key={challenges[idx]?.challenge_id ?? idx} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="py-2.5 px-3 font-medium text-zinc-700 max-w-[200px] truncate">{row.name}</td>
                        <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(row.promptEngineering)}`}>{row.promptEngineering}</span></td>
                        <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(row.modelEvaluation)}`}>{row.modelEvaluation}</span></td>
                        <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(row.dataAnalysis)}`}>{row.dataAnalysis}%</span></td>
                        <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${scoreColor(row.overall)}`}>{row.overall}</span></td>
                        <td>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${diffBadge}`}>
                            {diff?.difficulty ?? "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">No challenge data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
