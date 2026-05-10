"use client";
import { useState, useEffect } from "react";

interface Institution {
  id: string;
  name: string;
  domain: string;
  plan: "free" | "pro" | "enterprise";
  users: number;
  courses: number;
  status: "active" | "trial" | "suspended";
  created: string;
}

const PC: Record<string, string> = {
  free: "bg-slate-700 text-slate-300",
  pro: "bg-blue-900 text-blue-300",
  enterprise: "bg-purple-900 text-purple-300"
};

const SC: Record<string, string> = {
  active: "bg-emerald-900 text-emerald-300",
  trial: "bg-amber-900 text-amber-300",
  suspended: "bg-red-900 text-red-300"
};

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/institutions")
      .then(res => res.json())
      .then(data => {
        setInstitutions(data.institutions || data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load institutions");
        setLoading(false);
      });
  }, []);

  const f = institutions.filter(inst => 
    (planFilter === "all" || inst.plan === planFilter) && 
    (inst.name.toLowerCase().includes(search.toLowerCase()) || 
     inst.domain.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-slate-400 p-8">Loading institutions...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Institutions</h1>
        <p className="text-slate-400 text-sm mt-1">{institutions.length} institutions registered</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or domain..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["Institution","Domain","Plan","Users","Courses","Status","Created",""].map(h => (
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(inst => (
              <tr key={inst.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{inst.name}</td>
                <td className="px-5 py-4 text-slate-300">{inst.domain}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${PC[inst.plan]}`}>{inst.plan}</span></td>
                <td className="px-5 py-4 text-slate-300">{inst.users}</td>
                <td className="px-5 py-4 text-slate-300">{inst.courses}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${SC[inst.status]}`}>{inst.status}</span></td>
                <td className="px-5 py-4 text-slate-400">{inst.created}</td>
                <td className="px-5 py-4 text-right"><button className="text-emerald-400 hover:text-emerald-300 text-xs">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
