"use client";
import { useState, useEffect } from "react";

interface Challenge {
  id: string;
  title: string;
  domain: string;
  difficulty: "easy" | "medium" | "hard";
  type: string;
  avgScore: number;
  submissions: number;
  status: "published" | "draft" | "archived";
}

const DC: Record<string, string> = {
  easy: "bg-emerald-900 text-emerald-300",
  medium: "bg-amber-900 text-amber-300",
  hard: "bg-red-900 text-red-300"
};

const SC: Record<string, string> = {
  published: "bg-emerald-900 text-emerald-300",
  draft: "bg-slate-700 text-slate-300",
  archived: "bg-red-900 text-red-300"
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [df, setDf] = useState("all");
  const [sf, setSf] = useState("all");

  useEffect(() => {
    fetch("/api/challenges")
      .then(res => res.json())
      .then(data => {
        setChallenges(data.challenges || data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load challenges");
        setLoading(false);
      });
  }, []);

  const f = challenges.filter(c => 
    (df === "all" || c.difficulty === df) &&
    (sf === "all" || c.status === sf) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-slate-400 p-8">Loading challenges...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Challenges</h1>
        <p className="text-slate-400 text-sm mt-1">{challenges.length} challenges across all domains</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search challenges..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={df} onChange={e => setDf(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={sf} onChange={e => setSf(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["Challenge","Domain","Difficulty","Type","Avg Score","Submissions","Status",""].map(h => (
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{c.title}</td>
                <td className="px-5 py-4 text-slate-300">{c.domain}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${DC[c.difficulty]}`}>{c.difficulty}</span></td>
                <td className="px-5 py-4 text-slate-400">{c.type}</td>
                <td className="px-5 py-4 text-slate-300">{c.avgScore?.toFixed(1) ?? "N/A"}</td>
                <td className="px-5 py-4 text-slate-300">{c.submissions}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${SC[c.status]}`}>{c.status}</span></td>
                <td className="px-5 py-4 text-right"><button className="text-emerald-400 hover:text-emerald-300 text-xs">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
