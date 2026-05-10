"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, useAnalyticsStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Trophy,
  Box,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  Flame,
  ChevronRight,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CompetencyHeatmap } from "@/types";



// Map competency keys to Indonesian labels
const COMPETENCY_LABELS: Record<keyof CompetencyHeatmap, string> = {
  promptEngineering: "Prompt Engineering",
  modelEvaluation: "Evaluasi Model",
  dataEthics: "Etika Data",
  automation: "Otomasi",
  criticalThinking: "Berpikir Kritis",
  collaboration: "Kolaborasi",
  communication: "Komunikasi",
  toolFluency: "Tool Fluency",
  debugging: "Debugging",
  domainApplication: "Aplikasi Domain",
  continuousLearning: "Pembelajaran Kontinu",
  teachingOthers: "Mengajar Lain",
};

const COMPETENCY_COLORS: Record<keyof CompetencyHeatmap, string> = {
  promptEngineering: "#34d399",
  modelEvaluation: "#f59e0b",
  dataEthics: "#064e3b",
  automation: "#64748b",
  criticalThinking: "#f43f5e",
  collaboration: "#8b5cf6",
  communication: "#06b6d4",
  toolFluency: "#f59e0b",
  debugging: "#ef4444",
  domainApplication: "#10b981",
  continuousLearning: "#3b82f6",
  teachingOthers: "#ec4899",
};

function heatmapToChartData(heatmap: CompetencyHeatmap) {
  return Object.entries(heatmap).map(([key, value]) => ({
    competency: COMPETENCY_LABELS[key as keyof CompetencyHeatmap],
    shortKey: key,
    value: Math.round(value * 100) / 100,
    fullMark: 100,
  }));
}

// Mock data for demo purposes (when API is not yet built)

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { studentData, fetchStudentAnalytics, isLoading } = useAnalyticsStore();


  const chartData = heatmapToChartData(studentData?.competencyHeatmap || {});

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1f2937]">
          Selamat datang, {user?.fullName?.split(" ")[0] ?? "Pelajar"} 👋
        </h1>
        <p className="text-[#64748b] mt-1">
          Berikut resume kemampuan AI Anda. Lanjutkan membangun judgment dan
          critical thinking Anda.
        </p>
      </div>

      {/* Weekly Challenge Banner */}
      <Card className="border-[#34d399]/40 bg-gradient-to-r from-[#f0fdf4] to-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#34d399] text-[#064e3b] text-xs font-semibold">
                  Tantangan Minggu Ini
                </Badge>
                <Badge variant="outline" className="text-xs border-[#f59e0b] text-[#f59e0b]">
                  {studentData?.weeklyChallenge.difficulty}
                </Badge>
              </div>
              <h3 className="font-semibold text-[#1f2937] text-lg">
                {studentData?.weeklyChallenge.title}
              </h3>
              <p className="text-sm text-[#64748b] mt-1">
                {studentData?.weeklyChallenge.daysLeft} hari tersisa • Domain:{" "}
                {COMPETENCY_LABELS.promptEngineering}
              </p>
            </div>
            <Link href="/student/challenges">
              <Button className="bg-[#064e3b] hover:bg-[#065f3c] text-white shrink-0">
                Ikuti Tantangan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp,
            label: "Velocity Kompetensi",
            value: `+${studentData?.competencyVelocity}/bulan`,
            sub: "Target: +0.5",
            color: "text-[#34d399]",
            bg: "bg-[#f0fdf4]",
          },
          {
            icon: MessageSquare,
            label: "Depth Refleksi",
            value: `${studentData?.reflectionDepthScore}/10`,
            sub: "Target: 7/10",
            color: "text-[#f59e0b]",
            bg: "bg-[#fffbeb]",
          },
          {
            icon: Flame,
            label: "Streak Tantangan",
            value: `${studentData?.challengeStreak} minggu`,
            sub: "Pertahankan!",
            color: "text-[#f43f5e]",
            bg: "bg-[#fff1f2]",
          },
          {
            icon: Trophy,
            label: "Total Tantangan",
            value: "23",
            sub: "Selesai",
            color: "text-[#064e3b]",
            bg: "bg-[#f0fdf4]",
          },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <Card key={label} className="border-[#e2e8f0]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-xs font-medium text-[#64748b]">{label}</span>
              </div>
              <div className="text-2xl font-bold text-[#1f2937]">{value}</div>
              <p className="text-xs text-[#64748b] mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: Heatmap + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competency Heatmap */}
        <Card className="lg:col-span-2 border-[#e2e8f0]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1f2937]">
                Peta Kompetensi AI (12 Dimensi)
              </CardTitle>
              <Link
                href="/student/portfolio"
                className="text-xs text-[#064e3b] font-medium hover:underline flex items-center gap-1"
              >
                Detail <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="competency"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    tickCount={5}
                  />
                  <Radar
                    name="Kompetensi"
                    dataKey="value"
                    stroke="#064e3b"
                    fill="#064e3b"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#34d399", stroke: "#064e3b", strokeWidth: 1 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#1f2937",
                    }}
                    formatter={(value) => [`${value}/100`, "Skor"]}
                    labelFormatter={(label) => String(label)}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
              {Object.entries(COMPETENCY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COMPETENCY_COLORS[key as keyof CompetencyHeatmap] }}
                  />
                  <span className="text-xs text-[#64748b] truncate">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-[#e2e8f0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1f2937]">
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  icon: Trophy,
                  label: "Masuk Arena Tantangan",
                  href: "/student/challenges",
                  color: "text-[#064e3b]",
                  bg: "bg-[#f0fdf4]",
                },
                {
                  icon: Box,
                  label: "Buka Sandbox",
                  href: "/student/sandbox",
                  color: "text-[#64748b]",
                  bg: "bg-[#f8fafc]",
                },
                {
                  icon: MessageSquare,
                  label: "Chat dengan AI Tutor",
                  href: "/tutor",
                  color: "text-[#f59e0b]",
                  bg: "bg-[#fffbeb]",
                },
                {
                  icon: FolderOpen,
                  label: "Lihat Portfolio",
                  href: "/student/portfolio",
                  color: "text-[#34d399]",
                  bg: "bg-[#f0fdf4]",
                },
              ].map(({ icon: Icon, label, href, color, bg }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer group">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm font-medium text-[#1f2937] flex-1">
                      {label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#64748b] transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="border-[#e2e8f0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1f2937]">
                Submission Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentData?.recentSubmissions.map(({ id, challengeTitle, score, date }) => (
                <div key={id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1f2937] truncate">
                      {challengeTitle}
                    </p>
                    <p className="text-xs text-[#64748b]">{date}</p>
                  </div>
                  <Badge
                    className={`ml-2 ${
                      score >= 80
                        ? "bg-[#f0fdf4] text-[#064e3b]"
                        : score >= 60
                        ? "bg-[#fffbeb] text-[#f59e0b]"
                        : "bg-[#fff1f2] text-[#f43f5e]"
                    }`}
                  >
                    {score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
