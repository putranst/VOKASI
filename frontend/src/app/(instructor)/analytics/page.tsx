"use client";
/**
 * VOKASI2 — Instructor Analytics Dashboard
 * PRD v2.3 §5.4 Analytics Dashboard
 */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Users, BookOpen, TrendingUp, Award, Clock } from "lucide-react";

const MOCK_STUDENT_PROGRESS = [
  { name: "Ahmad R.", promptEngineering: 85, modelEvaluation: 72, dataAnalysis: 68, overall: 75 },
  { name: "Siti M.",   promptEngineering: 91, modelEvaluation: 88, dataAnalysis: 79, overall: 86 },
  { name: "Budi W.",   promptEngineering: 63, modelEvaluation: 55, dataAnalysis: 71, overall: 63 },
  { name: "Dewi K.",   promptEngineering: 78, modelEvaluation: 82, dataAnalysis: 85, overall: 82 },
  { name: "Rizki A.",  promptEngineering: 88, modelEvaluation: 75, dataAnalysis: 80, overall: 81 },
];

const MOCK_WEEKLY_ACTIVITY = [
  { week: "W1", submissions: 12, avgScore: 68 },
  { week: "W2", submissions: 24, avgScore: 72 },
  { week: "W3", submissions: 18, avgScore: 75 },
  { week: "W4", submissions: 31, avgScore: 78 },
  { week: "W5", submissions: 28, avgScore: 82 },
];

const MOCK_COMPETENCY_DISTRIBUTION = [
  { name: "Prompt Engineering", value: 35, color: "#0d9488" },
  { name: "Model Evaluation",   value: 20, color: "#6366f1" },
  { name: "Data Analysis",     value: 18, color: "#f59e0b" },
  { name: "Other",             value: 27, color: "#94a3b8" },
];

export default function InstructorAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Cohort performance & competency insights</p>
        </div>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Total Students", value: "48", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Courses", value: "6", icon: BookOpen, color: "text-[#0d9488]", bg: "bg-teal-50" },
          { label: "Avg Score", value: "76%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Completions", value: "14", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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
        {/* Weekly Submissions + Avg Score */}
        <Card>
          <CardHeader><CardTitle className="text-base">Weekly Submissions &amp; Average Score</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_WEEKLY_ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="submissions" fill="#0d9488" name="Submissions" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={2} name="Avg Score" dot={{ r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competency Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Competency Focus Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={MOCK_COMPETENCY_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" stroke="none">
                  {MOCK_COMPETENCY_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {MOCK_COMPETENCY_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-zinc-600 flex-1">{item.name}</span>
                  <span className="text-xs font-medium text-zinc-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Competency Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Competency Heatmap</CardTitle>
          <p className="text-xs text-zinc-500">Per-student competency scores (0–100)</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 font-semibold text-zinc-700">Student</th>
                  <th className="text-center py-2 px-2 font-semibold text-zinc-700">Prompt Eng.</th>
                  <th className="text-center py-2 px-2 font-semibold text-zinc-700">Model Eval.</th>
                  <th className="text-center py-2 px-2 font-semibold text-zinc-700">Data Analysis</th>
                  <th className="text-center py-2 px-2 font-semibold text-zinc-700">Overall</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENT_PROGRESS.map((s) => {
                  const scoreColor = (v: number) =>
                    v >= 80 ? "bg-emerald-100 text-emerald-700" :
                    v >= 60 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700";
                  return (
                    <tr key={s.name} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-2.5 px-3 font-medium text-zinc-700">{s.name}</td>
                      <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(s.promptEngineering)}`}>{s.promptEngineering}</span></td>
                      <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(s.modelEvaluation)}`}>{s.modelEvaluation}</span></td>
                      <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-medium ${scoreColor(s.dataAnalysis)}`}>{s.dataAnalysis}</span></td>
                      <td className="text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${scoreColor(s.overall)}`}>{s.overall}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">+{Math.floor(Math.random() * 10 + 2)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}