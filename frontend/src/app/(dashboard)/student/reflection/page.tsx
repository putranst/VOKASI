"use client";

import { useState } from "react";

const MOCK_ENTRIES = [
  {
    id: "1", week: "Week 4 — Nov 25, 2024",
    challenges: "I struggled with zero-shot vs few-shot prompting concepts. My first attempts at the challenge were too vague.",
    learnings: "Learned that specificity in prompts dramatically affects output quality. Few-shot examples guide the model toward the right format and reasoning pattern.",
    growth: "Prompt Engineering: 62 → 71 (+9)",
    course: "AI Fundamentals — Batch 3",
    submittedAt: "2024-11-26",
  },
  {
    id: "2", week: "Week 3 — Nov 18, 2024",
    challenges: "Had difficulty understanding evaluation metrics like ROUGE and BLEU scores for text generation tasks.",
    learnings: "ROUGE focuses on recall (what reference content appears in the generation) while BLEU focuses on precision. Neither captures semantic quality well — that's why LLM-based evaluation is better.",
    growth: "Model Evaluation: 58 → 64 (+6)",
    course: "AI Fundamentals — Batch 3",
    submittedAt: "2024-11-19",
  },
  {
    id: "3", week: "Week 2 — Nov 11, 2024",
    challenges: "Time management during the 3-hour challenge window. I panicked when the first approach didn't work.",
    learnings: "The Socratic Chat tutor helped me break down the problem. I should always start with the rubric criteria before diving into the solution.",
    growth: "Critical Thinking: 65 → 69 (+4)",
    course: "AI Fundamentals — Batch 3",
    submittedAt: "2024-11-12",
  },
];

const WEEKLY_PROMPTS = [
  "What was the most challenging concept this week and why?",
  "Which competency grew the most? What contributed to that growth?",
  "Describe a failure or mistake and what you learned from it.",
  "How did you apply AI tools to overcome a real problem?",
  "What will you focus on improving next week?",
];

export default function ReflectionJournalPage() {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ week: "", challenge: "", learning: "", nextWeek: "" });
  const [entries] = useState(MOCK_ENTRIES);

  const handleSubmit = () => {
    setShowNew(false);
    setForm({ week: "", challenge: "", learning: "", nextWeek: "" });
  };

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
