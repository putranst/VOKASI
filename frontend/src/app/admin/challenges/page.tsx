"use client";
import { useState } from "react";

const MOCK = [
  { id:"c1", title:"Optimize a prompt for a local e-commerce chatbot that reduces hallucination about inventory.", domain:"Prompt Engineering", difficulty:"medium", type:"open-ended", avgScore:74, submissions:234, status:"published" },
  { id:"c2", title:"Red-team a prompt: Find 3 ways to make this medical advice bot give dangerous output.", domain:"Prompt Engineering", difficulty:"hard", type:"adversarial", avgScore:68, submissions:189, status:"published" },
  { id:"c3", title:"Given two sentiment analysis models, evaluate which is more robust to sarcasm in Bahasa Indonesia.", domain:"Model Evaluation", difficulty:"medium", type:"comparison", avgScore:71, submissions:156, status:"published" },
  { id:"c4", title:"A CV-screening model rejects 80% of female applicants. Diagnose the bias and propose a fix.", domain:"AI Ethics", difficulty:"hard", type:"case-study", avgScore:62, submissions:98, status:"published" },
  { id:"c5", title:"Build a no-code workflow that categorizes customer complaints and drafts responses.", domain:"AI Automation", difficulty:"medium", type:"project", avgScore:79, submissions:145, status:"draft" },
  { id:"c6", title:"Your startup facial recognition has 15% higher error rate for dark-skinned individuals.", domain:"AI Ethics", difficulty:"hard", type:"simulation", avgScore:65, submissions:87, status:"published" },
  { id:"c7", title:"Evaluate which LLM performs better for Indonesian legal document summarization.", domain:"Model Evaluation", difficulty:"medium", type:"comparison", avgScore:76, submissions:112, status:"published" },
  { id:"c8", title:"Create a Python script that extracts structured data from unstructured PDF invoices.", domain:"AI Automation", difficulty:"medium", type:"coding", avgScore:82, submissions:201, status:"published" },
];

const DC: Record<string, string> = { easy:"bg-emerald-900/50 text-emerald-300", medium:"bg-amber-900/50 text-amber-300", hard:"bg-red-900/50 text-red-300" };
const SC: Record<string, string> = { published:"bg-emerald-900/50 text-emerald-300", draft:"bg-slate-700 text-slate-300" };
const DOMAINS = [...new Set(MOCK.map(c => c.domain))];

export default function AdminChallengesPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("all");
  const [diff, setDiff] = useState("all");
  const f = MOCK.filter(c => (domain === "all" || c.domain === domain) && (diff === "all" || c.difficulty === diff) && c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Challenge Bank</h1><p className="text-slate-400 text-sm mt-1">{MOCK.length} challenges across {DOMAINS.length} domains</p></div>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">+ New Challenge</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search challenges..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={domain} onChange={e => setDomain(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Domains</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={diff} onChange={e => setDiff(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
      </div>
      <div className="space-y-3">
        {f.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DC[c.difficulty]}`}>{c.difficulty}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-xs">{c.domain}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-xs">{c.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SC[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{c.title}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Avg: <span className="text-slate-300">{c.avgScore}/100</span></span>
                  <span>Subs: <span className="text-slate-300">{c.submissions}</span></span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">Edit</button>
                <button className={`px-3 py-1.5 text-xs rounded-md ${c.status === "published" ? "bg-red-900/50 hover:bg-red-900 text-red-300" : "bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300"}`}>
                  {c.status === "published" ? "Archive" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
