"use client";
import { useState } from "react";
const MOCK = [
  { id:"1", name:"SMK Negeri 2 Jakarta", domain:"smkn2jkt.sch.id", plan:"pro", users:312, courses:8, status:"active", created:"2024-01-15" },
  { id:"2", name:"Politeknik Negeri Bandung", domain:"polban.ac.id", plan:"enterprise", users:891, courses:24, status:"active", created:"2023-09-01" },
  { id:"3", name:"PTII Vocational School", domain:"ptii.edu", plan:"pro", users:156, courses:5, status:"trial", created:"2024-11-01" },
  { id:"4", name:"Universitas Brawijaya", domain:"ub.ac.id", plan:"enterprise", users:1204, courses:31, status:"active", created:"2023-06-15" },
  { id:"5", name:"LPKIA Vocational", domain:"lpkia.ac.id", plan:"free", users:89, courses:3, status:"active", created:"2024-03-20" },
  { id:"6", name:"Institut Teknologi Sepuluh Nopember", domain:"its.ac.id", plan:"enterprise", users:678, courses:19, status:"active", created:"2023-11-01" },
  { id:"7", name:"Akademi Komunitas Negeri Pacitan", domain:"akn-pacitan.ac.id", plan:"free", users:44, courses:2, status:"suspended", created:"2024-07-10" },
];
const PC = { free:"bg-slate-700 text-slate-300", pro:"bg-blue-900 text-blue-300", enterprise:"bg-purple-900 text-purple-300" };
const SC = { active:"bg-emerald-900 text-emerald-300", trial:"bg-amber-900 text-amber-300", suspended:"bg-red-900 text-red-300" };
export default function InstitutionsPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [show, setShow] = useState(false);
  const f = MOCK.filter(i => (planFilter==="all"||i.plan===planFilter) && (i.name.toLowerCase().includes(search.toLowerCase())||i.domain.includes(search)));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Institutions</h1><p className="text-slate-400 text-sm mt-1">{MOCK.length} registered institutions</p></div>
        <button onClick={()=>setShow(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg">+ Add Institution</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Plans</option><option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Institution</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Plan</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Users</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Courses</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Status</th>
            <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase">Joined</th>
            <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(i=>(
              <tr key={i.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4"><div className="font-medium text-white">{i.name}</div><div className="text-slate-500 text-xs">{i.domain}</div></td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${PC[i.plan as keyof typeof PC]}`}>{i.plan}</span></td>
                <td className="px-5 py-4 text-right text-slate-300 font-mono">{i.users.toLocaleString()}</td>
                <td className="px-5 py-4 text-right text-slate-300 font-mono">{i.courses}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${SC[i.status as keyof typeof SC]}`}>{i.status}</span></td>
                <td className="px-5 py-4 text-slate-500 text-xs">{i.created}</td>
                <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-2">
                  <button className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">View</button>
                  <button className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">Edit</button>
                  <button className={`px-3 py-1 text-xs rounded-md ${i.status==="active"?"bg-red-900/50 hover:bg-red-900 text-red-300":"bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300"}`}>{i.status==="active"?"Suspend":"Activate"}</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
