"use client";
import { useState } from "react";

const MOCK_STUDENT = [
  { id:"r1", mentorName:"Dr. Rina Marlina", course:"AI Fundamentals — Batch 3", message:"I want to master prompt engineering for job interviews at fintech companies.", goals:"Learn few-shot, chain-of-thought, and evaluation metrics in 4 weeks.", status:"accepted", respondedAt:"2024-11-20", avatar:"RM" },
  { id:"r2", mentorName:"Sarah Putri", course:"AI Fundamentals — Batch 3", message:"I'm struggling with the ethical reasoning challenges.", goals:"Develop a framework for evaluating AI deployment decisions.", status:"pending", respondedAt:null, avatar:"SP" },
];

const MOCK_MENTOR = [
  { id:"r3", studentName:"Andi Wijaya", course:"AI Fundamentals — Batch 3", message:"I want to improve my data analysis skills for my capstone project.", goals:"Master Pandas, visualization, and statistical reasoning in 6 weeks.", status:"pending", respondedAt:null, avatar:"AW" },
  { id:"r4", studentName:"Dewi Lestari", course:"Prompt Engineering Mastery", message:"Can you help me understand how to evaluate LLM outputs systematically?", goals:"Build an evaluation checklist for my research project.", status:"accepted", respondedAt:"2024-11-19", avatar:"DL" },
];

const ST_COLORS = { accepted:"bg-emerald-900/50 text-emerald-300", rejected:"bg-red-900/50 text-red-300", pending:"bg-amber-900/50 text-amber-300" };

export default function RequestsPage() {
  const [view, setView] = useState<"student" | "mentor">("student");
  const requests = view === "student" ? MOCK_STUDENT : MOCK_MENTOR;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mentorship Requests</h1>
        <p className="text-slate-400 text-sm mt-1">Track your mentor connections</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setView("student")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view==="student" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-transparent"}`}>
          My Requests
        </button>
        <button onClick={() => setView("mentor")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view==="mentor" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-transparent"}`}>
          Incoming Requests
        </button>
      </div>

      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${view==="student"?"bg-emerald-500/20 text-emerald-400":"bg-purple-500/20 text-purple-400"}`}>{r.avatar}</div>
                <div>
                  <div className="font-medium text-white">{view==="student" ? `Mentor: ${r.mentorName}` : `Student: ${r.studentName}`}</div>
                  <div className="text-slate-500 text-xs">{r.course}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ST_COLORS[r.status as keyof typeof ST_COLORS]}`}>{r.status}</span>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{view==="student"?"Your message":"Student's message"}</div>
                <p className="text-slate-300 text-sm">{r.message}</p>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Goals</div>
                <p className="text-slate-300 text-sm">{r.goals}</p>
              </div>
              {r.respondedAt && (
                <div className="text-xs text-slate-500">Responded: {r.respondedAt}</div>
              )}
              {view === "mentor" && r.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">Accept</button>
                  <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Decline</button>
                </div>
              )}
              {view === "student" && r.status === "accepted" && (
                <button className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30 mt-2">
                  Message Mentor →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
