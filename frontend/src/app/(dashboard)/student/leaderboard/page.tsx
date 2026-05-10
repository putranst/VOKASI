"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";

interface LeaderboardEntry {
  rank: number;
  handle: string;
  avgScore: number;
  submissions: number;
  bestScore: number;
  trend: string;
  institution: string;
}

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const TREND_COLORS: Record<string, string> = { up: "text-emerald-400", down: "text-red-400", stable: "text-slate-400" };

export default function LeaderboardPage() {
  const { token } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    fetch("/api/leaderboard", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
        setEntries([]);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">Ranked by reasoning depth — anonymous handles, no names</p>
      </div>

      <div className="flex gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
        {(["week", "month", "all"] as const).map(p => (
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
          const entry = entries[pos];
          if (!entry) return null;
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
            {entries.map(entry => (
              <tr key={entry.rank} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5 text-slate-400 text-xs">{RANK_ICONS[entry.rank] ?? entry.rank}</td>
                <td className="px-5 py-3.5 font-medium text-white">{entry.handle}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{entry.institution}</td>
                <td className="px-5 py-3.5 text-right font-mono text-emerald-400">{entry.avgScore}</td>
                <td className="px-5 py-3.5 text-right text-slate-400 hidden sm:table-cell">{entry.submissions}</td>
                <td className="px-5 py-3.5 text-right text-slate-300 font-mono hidden lg:table-cell">{entry.bestScore}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-xs ${TREND_COLORS[entry.trend] ?? "text-slate-400"}`}>
                    {entry.trend === "up" ? "▲" : entry.trend === "down" ? "▼" : "―"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-white font-semibold mb-2">No leaderboard data yet</h3>
          <p className="text-slate-400 text-sm">Leaderboard data will appear once submissions are made</p>
        </div>
      )}

      <div className="text-center text-slate-500 text-xs">
        Monthly reset · Reasoning depth score only · Anonymous handles
      </div>
    </div>
  );
}