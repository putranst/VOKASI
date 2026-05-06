"use client";
import { useState } from "react";

const MOCK = [
  { rank:1, handle:"Phantom Raven", avgScore:92.4, submissions:52, bestScore:96, trend:"up", institution:"Politeknik Negeri Bandung" },
  { rank:2, handle:"Cipher Sage", avgScore:90.1, submissions:48, bestScore:94, trend:"up", institution:"Universitas Brawijaya" },
  { rank:3, handle:"Neon Vertex", avgScore:88.7, submissions:45, bestScore:93, trend:"down", institution:"Institut Teknologi Sepuluh Nopember" },
  { rank:4, handle:"Iron Circuit", avgScore:86.3, submissions:41, bestScore:91, trend:"up", institution:"SMK Negeri 2 Jakarta" },
  { rank:5, handle:"Quantum Bloom", avgScore:85.2, submissions:39, bestScore:90, trend:"stable", institution:"Politeknik Negeri Bandung" },
  { rank:6, handle:"Shadow Codex", avgScore:83.8, submissions:36, bestScore:89, trend:"up", institution:"Universitas Brawijaya" },
  { rank:7, handle:"Crimson Pulse", avgScore:81.5, submissions:34, bestScore:87, trend:"down", institution:"Institut Teknologi Sepuluh Nopember" },
  { rank:8, handle:"Silver Thread", avgScore:79.9, submissions:31, bestScore:85, trend:"up", institution:"PTII Vocational School" },
  { rank:9, handle:"Dark Nebula", avgScore:78.2, submissions:29, bestScore:83, trend:"stable", institution:"Politeknik Negeri Bandung" },
  { rank:10, handle:"Nova Arc", avgScore:76.8, submissions:27, bestScore:82, trend:"up", institution:"SMK Negeri 2 Jakarta" },
  { rank:11, handle:"Ghost Kernel", avgScore:75.1, submissions:25, bestScore:80, trend:"down", institution:"Universitas Brawijaya" },
  { rank:12, handle:"Emerald Flux", avgScore:73.4, submissions:23, bestScore:79, trend:"up", institution:"Institut Teknologi Sepuluh Nopember" },
  { rank:13, handle:"Ruby Echo", avgScore:71.8, submissions:21, bestScore:77, trend:"stable", institution:"SMK Negeri 2 Jakarta" },
  { rank:14, handle:"Atlas Bit", avgScore:70.2, submissions:19, bestScore:76, trend:"up", institution:"Politeknik Negeri Bandung" },
  { rank:15, handle:"Zero Field", avgScore:68.9, submissions:17, bestScore:74, trend:"down", institution:"Universitas Brawijaya" },
];

const RANK_ICONS: Record<number, string> = { 1:"🥇", 2:"🥈", 3:"🥉" };
const TREND_COLORS: Record<string, string> = { up:"text-emerald-400", down:"text-red-400", stable:"text-slate-400" };

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">Ranked by reasoning depth — anonymous handles, no names</p>
      </div>

      <div className="flex gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
        {(["week","month","all"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === p ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}>
            {p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 0, 2].map(pos => {
          const entry = MOCK[pos];
          return (
            <div key={pos}
              className={`rounded-xl p-4 flex flex-col items-center bg-slate-900 border ${
                pos === 0 ? "border-amber-500/40 bg-amber-500/5 -mt-4 order-2" : "border-slate-700"
              } ${pos === 1 ? "order-1" : "order-3"}`}>
              <div className="text-2xl mb-1">{RANK_ICONS[entry.rank]}</div>
              <div className="text-lg font-bold text-white">{entry.handle}</div>
              <div className="text-emerald-400 font-bold text-sm">{entry.avgScore}</div>
              <div className="text-slate-500 text-xs">avg score</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">#</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Handle</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase hidden md:table-cell">Institution</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Avg</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase hidden sm:table-cell">Subs</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase hidden lg:table-cell">Best</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Trend</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {MOCK.map(entry => (
              <tr key={entry.rank} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5 text-slate-400 text-xs">{RANK_ICONS[entry.rank] ?? entry.rank}</td>
                <td className="px-5 py-3.5 font-medium text-white">{entry.handle}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{entry.institution}</td>
                <td className="px-5 py-3.5 text-right font-mono text-emerald-400">{entry.avgScore}</td>
                <td className="px-5 py-3.5 text-right text-slate-400 hidden sm:table-cell">{entry.submissions}</td>
                <td className="px-5 py-3.5 text-right text-slate-300 font-mono hidden lg:table-cell">{entry.bestScore}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-xs ${TREND_COLORS[entry.trend]}`}>
                    {entry.trend === "up" ? "▲" : entry.trend === "down" ? "▼" : "―"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center text-slate-500 text-xs">
        Monthly reset · Reasoning depth score only · Anonymous handles
      </div>
    </div>
  );
}
