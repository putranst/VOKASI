"use client";
import { useState } from "react";
const MOCK = [
  { id:"1", name:"Andi Wijaya", email:"andi.wijaya@smkn2jkt.sch.id", role:"student", institution:"SMK Negeri 2 Jakarta", status:"active", joined:"2024-01-20", lastActive:"2 min ago", score:78 },
  { id:"2", name:"Dr. Rina Marlina", email:"rina.m@polban.ac.id", role:"mentor", institution:"Politeknik Negeri Bandung", status:"active", joined:"2023-10-05", lastActive:"1 hr ago", score:null },
  { id:"3", name:"Budi Santoso", email:"budi.s@smkn2jkt.sch.id", role:"student", institution:"SMK Negeri 2 Jakarta", status:"at-risk", joined:"2024-02-10", lastActive:"3 days ago", score:52 },
  { id:"4", name:"Sarah Putri", email:"sarah.putri@ub.ac.id", role:"instructor", institution:"Universitas Brawijaya", status:"active", joined:"2023-07-01", lastActive:"30 min ago", score:null },
  { id:"5", name:"Admin System", email:"admin@vokasi.ai", role:"admin", institution:"VOKASI2 HQ", status:"active", joined:"2023-01-01", lastActive:"5 min ago", score:null },
  { id:"6", name:"M. Rizki Fadilah", email:"rizki.f@its.ac.id", role:"student", institution:"Institut Teknologi Sepuluh Nopember", status:"active", joined:"2024-03-15", lastActive:"1 min ago", score:84 },
  { id:"7", name:"Dewi Lestari", email:"dewi.l@ptii.edu", role:"student", institution:"PTII Vocational School", status:"inactive", joined:"2024-11-01", lastActive:"2 weeks ago", score:61 },
];
const RC = { student:"bg-blue-900 text-blue-300", instructor:"bg-emerald-900 text-emerald-300", mentor:"bg-purple-900 text-purple-300", admin:"bg-red-900 text-red-300" };
const SC = { active:"text-emerald-400", "at-risk":"text-amber-400", inactive:"text-slate-500" };
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const f = MOCK.filter(u => (roleFilter==="all"||u.role===roleFilter) && (u.name.toLowerCase().includes(search.toLowerCase())||u.email.includes(search)));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Users</h1><p className="text-slate-400 text-sm mt-1">{MOCK.length} registered users</p></div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Roles</option><option value="student">Students</option><option value="instructor">Instructors</option><option value="mentor">Mentors</option><option value="admin">Admins</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["User","Role","Institution","Status","Joined","Last Active","Score",""].map(h=>(
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(u=>(
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">{u.name.charAt(0)}</div><div><div className="font-medium text-white">{u.name}</div><div className="text-slate-500 text-xs">{u.email}</div></div></div></td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${RC[u.role as keyof typeof RC]}`}>{u.role}</span></td>
                <td className="px-5 py-4 text-slate-400 text-xs max-w-40 truncate">{u.institution}</td>
                <td className="px-5 py-4"><span className={`text-xs font-medium ${SC[u.status as keyof typeof SC]}`}>{u.status}</span></td>
                <td className="px-5 py-4 text-slate-500 text-xs">{u.joined}</td>
                <td className="px-5 py-4 text-slate-500 text-xs">{u.lastActive}</td>
                <td className="px-5 py-4 text-slate-300 font-mono text-xs">{u.score!==null?`${u.score}/100`:"—"}</td>
                <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-1.5"><button className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">Suspend</button><button className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md">Role</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
