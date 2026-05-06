"use client";

import { useState } from "react";

const COMPETENCIES = [
  { name: "Prompt Engineering", short: "PE", score: 78, trend: "+6", max: 100 },
  { name: "Model Evaluation", short: "ME", score: 71, trend: "+3", max: 100 },
  { name: "Data Analysis", short: "DA", score: 69, trend: "+4", max: 100 },
  { name: "AI Automation", short: "AA", score: 74, trend: "+8", max: 100 },
  { name: "Critical Thinking", short: "CT", score: 72, trend: "+2", max: 100 },
  { name: "ML Fundamentals", short: "ML", score: 65, trend: "+5", max: 100 },
];

const MOCK_ARTIFACTS = [
  { id: "a1", title: "AI-Powered Task Automation Pipeline", type: "Project", course: "AI Automation", competency: "AI Automation", score: 89, date: "2024-11-20", tags: ["CrewAI", "LangChain", "Automation"] },
  { id: "a2", title: "Prompt Engineering Portfolio — 50 Variants", type: "Assignment", course: "AI Fundamentals", competency: "Prompt Engineering", score: 82, date: "2024-11-15", tags: ["Prompting", "GPT-4", "Evaluation"] },
  { id: "a3", title: "Model Benchmarking Report: GPT-4 vs Claude", type: "Report", course: "ML Model Evaluation", competency: "Model Evaluation", score: 76, date: "2024-10-28", tags: ["Benchmarking", "RAGAS", "LLM Eval"] },
  { id: "a4", title: "Data Cleaning Pipeline — Indonesian E-Commerce", type: "Project", course: "Data Analysis", competency: "Data Analysis", score: 91, date: "2024-10-10", tags: ["Pandas", "Python", "ETL"] },
];

const MOCK_ENDORSEMENTS = [
  { id: "e1", from: "Dr. Rina Marlina", role: "Mentor", competency: "Prompt Engineering", message: "Exceptional understanding of advanced prompting techniques. Andi has demonstrated mastery beyond typical level.", date: "2024-11-18" },
  { id: "e2", from: "Sarah Putri", role: "Instructor", competency: "AI Automation", message: "Andi's automation project showed creative application of agentic AI. Top 5% of the cohort.", date: "2024-11-15" },
];

export default function StudentPortfolioPage() {
  const [tab, setTab] = useState<"overview" | "artifacts" | "reflections">("overview");
  const [selectedArtifact, setSelectedArtifact] = useState<typeof MOCK_ARTIFACTS[0] | null>(null);

  const avgScore = Math.round(COMPETENCIES.reduce((a, c) => a + c.score, 0) / COMPETENCIES.length);
  const totalArtifacts = MOCK_ARTIFACTS.length;
  const endorsements = MOCK_ENDORSEMENTS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
          <p className="text-slate-400 text-sm mt-1">Your competency snapshot and career-ready artifacts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Overall</div>
            <div className="text-xl font-bold text-emerald-400">{avgScore}</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Artifacts</div>
            <div className="text-xl font-bold text-white">{totalArtifacts}</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Endorsements</div>
            <div className="text-xl font-bold text-amber-400">{endorsements}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {(["overview", "artifacts", "reflections"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart — SVG */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4">Competency Radar</h2>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 300 260" className="w-full max-w-sm">
                {/* Background rings */}
                {[25, 50, 75, 100].map(r => (
                  <polygon key={r} points={COMPETENCIES.map((_, i) => {
                    const angle = (i * 2 * Math.PI / COMPETENCIES.length) - Math.PI / 2;
                    return `${150 + Math.cos(angle) * r * 0.9},${130 + Math.sin(angle) * r * 0.9}`;
                  }).join(" ")}
                    fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="1"
                  />
                ))}
                {/* Axis lines */}
                {COMPETENCIES.map((_, i) => {
                  const angle = (i * 2 * Math.PI / COMPETENCIES.length) - Math.PI / 2;
                  return <line key={i} x1="150" y1="130"
                    x2={150 + Math.cos(angle) * 90} y2={130 + Math.sin(angle) * 90}
                    stroke="rgba(100,116,139,0.2)" strokeWidth="1" />;
                })}
                {/* Data polygon */}
                <polygon points={COMPETENCIES.map((c, i) => {
                  const angle = (i * 2 * Math.PI / COMPETENCIES.length) - Math.PI / 2;
                  const r = c.score * 0.9;
                  return `${150 + Math.cos(angle) * r},${130 + Math.sin(angle) * r}`;
                }).join(" ")}
                  fill="rgba(16,185,129,0.15)" stroke="rgb(16,185,129)" strokeWidth="2"
                />
                {/* Labels */}
                {COMPETENCIES.map((c, i) => {
                  const angle = (i * 2 * Math.PI / COMPETENCIES.length) - Math.PI / 2;
                  const r = 110;
                  return (
                    <text key={c.name} x={150 + Math.cos(angle) * r} y={130 + Math.sin(angle) * r + 4}
                      textAnchor="middle" fontSize="10" fill="rgb(148,163,184)" fontWeight="500">
                      {c.short} {c.score}
                    </text>
                  );
                })}
                {/* Data points */}
                {COMPETENCIES.map((c, i) => {
                  const angle = (i * 2 * Math.PI / COMPETENCIES.length) - Math.PI / 2;
                  const r = c.score * 0.9;
                  return <circle key={c.name} cx={150 + Math.cos(angle) * r} cy={130 + Math.sin(angle) * r}
                    r="3" fill="rgb(16,185,129)" />;
                })}
              </svg>
            </div>
          </div>

          {/* Endorsements */}
          <div className="space-y-4">
            <h2 className="font-semibold text-white">Expert Endorsements</h2>
            {MOCK_ENDORSEMENTS.map(e => (
              <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {e.from.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{e.from}</div>
                    <div className="text-xs text-slate-500">{e.role} · {e.competency}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-xs italic leading-relaxed">"{e.message}"</p>
                <div className="text-xs text-slate-600 mt-2">{e.date}</div>
              </div>
            ))}
            <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
              Request Endorsement →
            </button>
          </div>
        </div>
      )}

      {/* Artifacts Tab */}
      {tab === "artifacts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ARTIFACTS.map(artifact => (
            <div key={artifact.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-all cursor-pointer group"
              onClick={() => setSelectedArtifact(artifact)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-emerald-400 font-medium">{artifact.type}</span>
                  <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{artifact.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">{artifact.score}</div>
                  <div className="text-xs text-slate-500">/100</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {artifact.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{artifact.course}</span>
                <span>{artifact.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reflections Tab */}
      {tab === "reflections" && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Keep a weekly reflection journal to build metacognition and track your growth.
          </p>
          <a href="/student/reflection" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            Open Reflection Journal →
          </a>
        </div>
      )}
    </div>
  );
}
