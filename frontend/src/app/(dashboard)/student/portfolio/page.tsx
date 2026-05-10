"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

interface Competency {
  name: string;
  short: string;
  score: number;
  trend: string;
  max: number;
}

interface Artifact {
  id: string;
  title: string;
  type: string;
  course: string;
  competency: string;
  score: number;
  date: string;
  tags: string[];
}

interface Endorsement {
  id: string;
  from: string;
  role: string;
  competency: string;
  message: string;
  date: string;
}

function normalizeCompetency(raw: Record<string, unknown>): Competency {
  return {
    name: (raw.name as string) ?? "",
    short: (raw.short as string) ?? ((raw.name as string) ?? "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    score: (raw.score as number) ?? 0,
    trend: (raw.trend as string) ?? "",
    max: (raw.max as number) ?? 100,
  };
}

function normalizeArtifact(raw: Record<string, unknown>): Artifact {
  return {
    id: (raw.id as string) ?? "",
    title: (raw.title as string) ?? "",
    type: (raw.type as string) ?? "",
    course: (raw.course as string) ?? (raw.course_title as string) ?? "",
    competency: (raw.competency as string) ?? "",
    score: (raw.score as number) ?? 0,
    date: (raw.date as string) ?? (raw.created_at as string) ?? "",
    tags: (raw.tags as string[]) ?? [],
  };
}

function normalizeEndorsement(raw: Record<string, unknown>): Endorsement {
  return {
    id: (raw.id as string) ?? "",
    from: (raw.from as string) ?? (raw.endorser_name as string) ?? "",
    role: (raw.role as string) ?? (raw.endorser_role as string) ?? "",
    competency: (raw.competency as string) ?? "",
    message: (raw.message as string) ?? "",
    date: (raw.date as string) ?? (raw.created_at as string) ?? "",
  };
}

export default function StudentPortfolioPage() {
  const { token } = useAuthStore();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "artifacts" | "reflections" | "failure-resume">("overview");
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/portfolio", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCompetencies(Array.isArray(data.competencies) ? data.competencies.map(normalizeCompetency) : []);
        setArtifacts(Array.isArray(data.artifacts) ? data.artifacts.map(normalizeArtifact) : []);
        setEndorsements(Array.isArray(data.endorsements) ? data.endorsements.map(normalizeEndorsement) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load portfolio:", err);
        setCompetencies([]);
        setArtifacts([]);
        setEndorsements([]);
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

  const avgScore = competencies.length > 0
    ? Math.round(competencies.reduce((a, c) => a + c.score, 0) / competencies.length)
    : 0;

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
            <div className="text-xl font-bold text-white">{artifacts.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-slate-400">Endorsements</div>
            <div className="text-xl font-bold text-amber-400">{endorsements.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {(["overview", "artifacts", "reflections", "failure-resume"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}>
            {t === "failure-resume" ? "Failure Resume" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart — SVG */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4">Competency Radar</h2>
            {competencies.length > 0 ? (
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 300 260" className="w-full max-w-sm">
                  {/* Background rings */}
                  {[25, 50, 75, 100].map(r => (
                    <polygon key={r} points={competencies.map((_, i) => {
                      const angle = (i * 2 * Math.PI / competencies.length) - Math.PI / 2;
                      return `${150 + Math.cos(angle) * r * 0.9},${130 + Math.sin(angle) * r * 0.9}`;
                    }).join(" ")}
                      fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="1"
                    />
                  ))}
                  {/* Axis lines */}
                  {competencies.map((_, i) => {
                    const angle = (i * 2 * Math.PI / competencies.length) - Math.PI / 2;
                    return <line key={i} x1="150" y1="130"
                      x2={150 + Math.cos(angle) * 90} y2={130 + Math.sin(angle) * 90}
                      stroke="rgba(100,116,139,0.2)" strokeWidth="1" />;
                  })}
                  {/* Data polygon */}
                  <polygon points={competencies.map((c, i) => {
                    const angle = (i * 2 * Math.PI / competencies.length) - Math.PI / 2;
                    const r = c.score * 0.9;
                    return `${150 + Math.cos(angle) * r},${130 + Math.sin(angle) * r}`;
                  }).join(" ")}
                    fill="rgba(16,185,129,0.15)" stroke="rgb(16,185,129)" strokeWidth="2"
                  />
                  {/* Labels */}
                  {competencies.map((c, i) => {
                    const angle = (i * 2 * Math.PI / competencies.length) - Math.PI / 2;
                    const r = 110;
                    return (
                      <text key={c.name} x={150 + Math.cos(angle) * r} y={130 + Math.sin(angle) * r + 4}
                        textAnchor="middle" fontSize="10" fill="rgb(148,163,184)" fontWeight="500">
                        {c.short} {c.score}
                      </text>
                    );
                  })}
                  {/* Data points */}
                  {competencies.map((c, i) => {
                    const angle = (i * 2 * Math.PI / competencies.length) - Math.PI / 2;
                    const r = c.score * 0.9;
                    return <circle key={c.name} cx={150 + Math.cos(angle) * r} cy={130 + Math.sin(angle) * r}
                      r="3" fill="rgb(16,185,129)" />;
                  })}
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No competency data available
              </div>
            )}
          </div>

          {/* Endorsements */}
          <div className="space-y-4">
            <h2 className="font-semibold text-white">Expert Endorsements</h2>
            {endorsements.map(e => (
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
                <p className="text-slate-400 text-xs italic leading-relaxed">&ldquo;{e.message}&rdquo;</p>
                <div className="text-xs text-slate-600 mt-2">{e.date}</div>
              </div>
            ))}
            {endorsements.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-500 text-sm">No endorsements yet</p>
              </div>
            )}
            <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
              Request Endorsement →
            </button>
          </div>
        </div>
      )}

      {/* Artifacts Tab */}
      {tab === "artifacts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifacts.map(artifact => (
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
          {artifacts.length === 0 && (
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-white font-semibold mb-2">No artifacts yet</h3>
              <p className="text-slate-400 text-sm">Complete assignments to build your portfolio</p>
            </div>
          )}
        </div>
      )}

      {/* Failure Resume Tab */}
      {tab === "failure-resume" && <FailureResumeTab />}
    </div>
  );
}

function FailureResumeTab() {
  const { token } = useAuthStore();
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ failureTitle: "", failureDescription: "", lessonsLearned: "", recoverySteps: "" });

  useEffect(() => {
    if (!token) return;
    fetch("/api/portfolio/failure-resume", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setEntries(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load failure resume:", err);
        setEntries([]);
        setLoading(false);
      });
  }, [token]);

  async function addEntry() {
    if (!token || !form.failureTitle.trim()) return;
    const res = await fetch("/api/portfolio/failure-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newEntry = await res.json();
      setEntries((prev) => [newEntry, ...prev]);
      setShowAdd(false);
      setForm({ failureTitle: "", failureDescription: "", lessonsLearned: "", recoverySteps: "" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Failure Resume</h2>
          <p className="text-slate-400 text-sm mt-1">
            Document your failures like your achievements. Growth mindset in action.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
        >
          {showAdd ? "Batal" : "+ Document Failure"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900 p-5 space-y-3">
          <input
            value={form.failureTitle}
            onChange={(e) => setForm({ ...form, failureTitle: e.target.value })}
            placeholder="What went wrong? (brief title)"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
          <textarea
            value={form.failureDescription}
            onChange={(e) => setForm({ ...form, failureDescription: e.target.value })}
            placeholder="What happened? Describe the failure..."
            rows={3}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
          <textarea
            value={form.lessonsLearned}
            onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })}
            placeholder="What did you learn? How will you approach it differently?"
            rows={3}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
          <textarea
            value={form.recoverySteps}
            onChange={(e) => setForm({ ...form, recoverySteps: e.target.value })}
            placeholder="What steps did you take to recover? What would you do differently?"
            rows={2}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
          <button
            onClick={addEntry}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            Save to Failure Resume
          </button>
        </div>
      )}

      {entries.length === 0 && !showAdd && (
        <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-500 text-lg mb-2">No failures documented yet</p>
          <p className="text-slate-600 text-sm">Failure is a feature, not a bug. Start documenting.</p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id as string} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white">{entry.failure_title as string}</h3>
              <span className="text-xs text-slate-500">
                {entry.created_at ? new Date(entry.created_at as string).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </span>
            </div>
            {typeof entry.failure_description === "string" && entry.failure_description && (
              <div className="mb-3">
                <p className="text-xs text-rose-400 font-medium uppercase tracking-wide mb-1">What Happened</p>
                <p className="text-slate-400 text-sm">{entry.failure_description}</p>
              </div>
            )}
            {typeof entry.lessons_learned === "string" && entry.lessons_learned && (
              <div className="mb-3">
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-wide mb-1">Lessons Learned</p>
                <p className="text-slate-300 text-sm">{entry.lessons_learned}</p>
              </div>
            )}
            {typeof entry.recovery_steps === "string" && entry.recovery_steps && (
              <div>
                <p className="text-xs text-amber-400 font-medium uppercase tracking-wide mb-1">Recovery Steps</p>
                <p className="text-slate-300 text-sm">{entry.recovery_steps}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}