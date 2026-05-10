"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

interface ReflectionEntry {
  id: string;
  week: string;
  challenges: string;
  learnings: string;
  growth: string;
  course: string;
  submittedAt: string;
  // API snake_case fields
  challenge?: string;
  learning?: string;
  course_name?: string;
  submitted_at?: string;
}

function normalizeEntry(raw: ReflectionEntry): ReflectionEntry {
  return {
    id: raw.id,
    week: raw.week ?? "",
    challenges: raw.challenges ?? raw.challenge ?? "",
    learnings: raw.learnings ?? raw.learning ?? "",
    growth: raw.growth ?? "",
    course: raw.course ?? raw.course_name ?? "",
    submittedAt: raw.submittedAt ?? raw.submitted_at ?? "",
  };
}

const WEEKLY_PROMPTS = [
  "What was the most challenging concept this week and why?",
  "Which competency grew the most? What contributed to that growth?",
  "Describe a failure or mistake and what you learned from it.",
  "How did you apply AI tools to overcome a real problem?",
  "What will you focus on improving next week?",
];

export default function ReflectionJournalPage() {
  const { token } = useAuthStore();
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ week: "", challenge: "", learning: "", nextWeek: "" });

  useEffect(() => {
    if (!token) return;
    fetch("/api/reflections", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data.map(normalizeEntry) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load reflections:", err);
        setEntries([]);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = () => {
    setShowNew(false);
    setForm({ week: "", challenge: "", learning: "", nextWeek: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reflection Journal</h1>
          <p className="text-slate-400 text-sm mt-1">Weekly guided reflections — build metacognition and track growth</p>
        </div>
        {!showNew && (
          <button onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            + New Reflection
          </button>
        )}
      </div>

      {/* New Entry Form */}
      {showNew && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-emerald-400">New Weekly Reflection</h2>
            <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white text-sm">Cancel</button>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Week / Date Range</label>
            <input type="text" value={form.week} onChange={e => setForm({ ...form, week: e.target.value })}
              placeholder="e.g. Week 5 — Dec 2, 2024"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>

          {WEEKLY_PROMPTS.map((prompt, i) => (
            <div key={i}>
              <label className="block text-sm text-slate-400 mb-2">{prompt}</label>
              <textarea
                value={[form.challenge, form.learning, form.nextWeek][i]}
                onChange={e => {
                  const updated = [...[form.challenge, form.learning, form.nextWeek]];
                  updated[i] = e.target.value;
                  setForm({ ...form, challenge: updated[0] ?? "", learning: updated[1] ?? "", nextWeek: updated[2] ?? "" });
                }}
                rows={3}
                placeholder="Write your reflection..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Growth Evidence (optional)</label>
            <input type="text" placeholder="e.g. Prompt Engineering: 71 → 78 (+7)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          </div>

          <button onClick={handleSubmit}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
            Submit Reflection
          </button>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/30">
              <div>
                <h3 className="font-semibold text-white">{entry.week}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{entry.course} · Submitted {entry.submittedAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Growth</div>
                  <div className="text-emerald-400 text-sm font-medium font-mono">{entry.growth}</div>
                </div>
                <button className="text-slate-400 hover:text-emerald-400 text-lg">◈</button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="text-rose-400">✕</span> Challenges Faced
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">{entry.challenges}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Key Learnings
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">{entry.learnings}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}