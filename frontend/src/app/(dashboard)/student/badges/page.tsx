"use client";
import { useState } from "react";

const EARNED = [
  { id:"m1", name:"Brain Founder", icon:"🜂", color:"from-amber-500/20 to-yellow-500/20", border:"border-amber-500/30", desc:"Completed your first challenge", earned:"2024-10-15" },
  { id:"m2", name:"Resilience Streak", icon:"◈", color:"from-red-500/20 to-orange-500/20", border:"border-red-500/30", desc:"7-day reflection streak", earned:"2024-11-01" },
  { id:"b1", name:"Prompt Engineer", icon:"◈", color:"from-blue-500/20 to-cyan-500/20", border:"border-blue-500/30", desc:"Excellence in prompt design", earned:"2024-11-10" },
  { id:"b5", name:"Critical Thinker", icon:"◑", color:"from-rose-500/20 to-red-500/20", border:"border-rose-500/30", desc:"Ethics & reasoning excellence", earned:"2024-11-20" },
  { id:"m3", name:"Socratic Master", icon:"◎", color:"from-purple-500/20 to-violet-500/20", border:"border-purple-500/30", desc:"50+ Socratic Chat sessions", earned:"2024-11-22" },
];

const ALL_DOMAIN = [
  { id:"b1", name:"Prompt Engineer", icon:"◈", color:"from-blue-500/20 to-cyan-500/20", border:"border-blue-500/30", desc:"Excellence in prompt design", criteria:"Score 80+ on 5 prompt engineering challenges" },
  { id:"b2", name:"Model Evaluator", icon:"◎", color:"from-purple-500/20 to-pink-500/20", border:"border-purple-500/30", desc:"Benchmarking and evaluating AI models", criteria:"Complete 5 model evaluation challenges with 75+ avg score" },
  { id:"b3", name:"Data Analyst", icon:"◐", color:"from-emerald-500/20 to-teal-500/20", border:"border-emerald-500/30", desc:"Extract, analyze, and visualize data", criteria:"Submit 5 data analysis artifacts with 80+ scores" },
  { id:"b4", name:"AI Automator", icon:"◇", color:"from-amber-500/20 to-orange-500/20", border:"border-amber-500/30", desc:"Build AI-powered automation workflows", criteria:"Build and submit 3 automation project artifacts" },
  { id:"b5", name:"Critical Thinker", icon:"◑", color:"from-rose-500/20 to-red-500/20", border:"border-rose-500/30", desc:"AI ethics and deployment reasoning", criteria:"Complete 5 ethics/critical reasoning challenges" },
  { id:"b6", name:"ML Fundamentals", icon:"◆", color:"from-indigo-500/20 to-violet-500/20", border:"border-indigo-500/30", desc:"Core machine learning concepts", criteria:"Pass ML fundamentals assessment with 80+" },
  { id:"b7", name:"Socratic Scholar", icon:"○", color:"from-cyan-500/20 to-sky-500/20", border:"border-cyan-500/30", desc:"Active learner through dialogue", criteria:"Complete 20+ Socratic Chat sessions" },
  { id:"b8", name:"Reflection Pro", icon:"◉", color:"from-teal-500/20 to-green-500/20", border:"border-teal-500/30", desc:"Consistent self-reflection", criteria:"Submit 10 weekly reflection journals" },
];

const ALL_META = [
  { id:"m1", name:"Brain Founder", icon:"🜂", color:"from-amber-500/20 to-yellow-500/20", border:"border-amber-500/30", desc:"Completed your first challenge", criteria:"Submit your first challenge" },
  { id:"m2", name:"Resilience Streak", icon:"◈", color:"from-red-500/20 to-orange-500/20", border:"border-red-500/30", desc:"7-day reflection streak", criteria:"7 consecutive days with a reflection entry" },
  { id:"m3", name:"Socratic Master", icon:"◎", color:"from-purple-500/20 to-violet-500/20", border:"border-purple-500/30", desc:"50+ Socratic Chat sessions", criteria:"Complete 50 Socratic Chat sessions" },
  { id:"m4", name:"Peer Mentor", icon:"◆", color:"from-emerald-500/20 to-green-500/20", border:"border-emerald-500/30", desc:"Gave back to fellow students", criteria:"Write 10 peer reviews with helpful ratings" },
  { id:"m5", name:"Growth Mindset", icon:"◇", color:"from-blue-500/20 to-indigo-500/20", border:"border-blue-500/30", desc:"Significant competency growth", criteria:"Improve any competency by 20+ points in one month" },
];

const earnedIds = EARNED.map(b => b.id);

export default function BadgesPage() {
  const [tab, setTab] = useState<"earned" | "domain" | "meta">("earned");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Badges</h1>
        <p className="text-slate-400 text-sm mt-1">Domain expertise + meta achievements — 17 badges total</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{EARNED.length}</div>
          <div className="text-slate-400 text-xs mt-1">Earned</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{ALL_DOMAIN.length}</div>
          <div className="text-slate-400 text-xs mt-1">Domain Badges</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{ALL_META.length}</div>
          <div className="text-slate-400 text-xs mt-1">Meta Badges</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        {(["earned","domain","meta"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}>
            {t === "earned" ? `Earned (${EARNED.length})` : t === "domain" ? "Domain Badges" : "Meta Badges"}
          </button>
        ))}
      </div>

      {tab === "earned" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EARNED.map(badge => (
            <div key={badge.id} className={`bg-gradient-to-br ${badge.color} rounded-xl p-5 border ${badge.border}`}>
              <div className="text-3xl mb-3">{badge.icon}</div>
              <h3 className="font-semibold text-white">{badge.name}</h3>
              <p className="text-slate-400 text-xs mt-1">{badge.desc}</p>
              <div className="text-xs text-slate-500 mt-2">Earned {badge.earned}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "domain" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_DOMAIN.map(badge => {
            const isEarned = earnedIds.includes(badge.id);
            return (
              <div key={badge.id} className={`bg-slate-900 border rounded-xl p-5 ${isEarned ? badge.color + " " + badge.border : "border-slate-800 opacity-50"}`}>
                <div className="text-3xl mb-3" style={{ opacity: isEarned ? 1 : 0.3 }}>{badge.icon}</div>
                <h3 className="font-semibold text-white">{badge.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{badge.desc}</p>
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500">{isEarned ? "✓ Earned" : "🔒 " + badge.criteria}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "meta" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_META.map(badge => {
            const isEarned = earnedIds.includes(badge.id);
            return (
              <div key={badge.id} className={`bg-slate-900 border rounded-xl p-5 ${isEarned ? badge.color + " " + badge.border : "border-slate-800 opacity-50"}`}>
                <div className="text-3xl mb-3" style={{ opacity: isEarned ? 1 : 0.3 }}>{badge.icon}</div>
                <h3 className="font-semibold text-white">{badge.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{badge.desc}</p>
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-500">{isEarned ? "✓ Earned" : "🔒 " + badge.criteria}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
