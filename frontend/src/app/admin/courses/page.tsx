"use client";
import { useState } from "react";
const MOCK = [
  { id:"1", title:"AI Fundamentals — Batch 3", instructor:"Sarah Putri", institution:"Universitas Brawijaya", status:"published", enrollments:89, avgScore:74.2 },
  { id:"2", title:"Prompt Engineering Mastery", instructor:"Dr. Rina Marlina", institution:"Politeknik Negeri Bandung", status:"published", enrollments:134, avgScore:71.8 },
  { id:"3", title:"Data Analysis with Python", instructor:"Sarah Putri", institution:"Universitas Brawijaya", status:"draft", enrollments:0, avgScore:null },
  { id:"4", title:"ML Model Evaluation & Benchmarking", instructor:"Ahmad Fauzi", institution:"Institut Teknologi Sepuluh Nopember", status:"published", enrollments:67, avgScore:68.5 },
  { id:"5", title:"AI Automation with CrewAI", instructor:"Sarah Putri", institution:"SMK Negeri 2 Jakarta", status:"archived", enrollments:45, avgScore:77.1 },
];
const SC = { published:"bg-emerald-900 text-emerald-300", draft:"bg-slate-700 text-slate-300", archived:"bg-red-900 text-red-300" };
export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState("all");
  const f = MOCK.filter(c => (sf==="all"||c.status===sf) && c.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">All Courses</h1><p className="text-slate-400 text-sm mt-1">{MOCK.length} courses across all institutions</p></div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={sf} onChange={e=>setSf(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["Course","Instructor","Institution","Status","Enrollments","Avg Score",""].map(h=>(
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(c=>(
              <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{c.title}</td>
                <td className="px-5 py-4 text-slate-400 text-xs">{c.instructor}</td>
                <td className="px-5 py-4 text-slate-500 text-xs max-w-36 truncate">{c.institution}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${SC[c.status as keyof typeof SC]}`}>{c.status}</span></td>
                <td className="px-5 py-4 text-slate-300 font-mono">{c.enrollments}</td>
                <td className="px-5 py-4 text-slate-300 font-mono">{c.avgScore??'—'}</td>
                <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1.5">
                  <button className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">Preview</button>
                  <button className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">{c.status==="published"?"Unpublish":"Publish"}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
