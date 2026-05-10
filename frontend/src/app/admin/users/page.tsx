"use client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "mentor" | "instructor" | "admin";
  institution: string;
  status: "active" | "at-risk" | "inactive";
  joined: string;
  lastActive: string;
  score: number | null;
}

const RC: Record<string, string> = {
  student: "bg-blue-900 text-blue-300",
  instructor: "bg-emerald-900 text-emerald-300",
  mentor: "bg-purple-900 text-purple-300",
  admin: "bg-slate-700 text-slate-300"
};

const SC: Record<string, string> = {
  active: "bg-emerald-900 text-emerald-300",
  "at-risk": "bg-yellow-900 text-yellow-300",
  inactive: "bg-slate-700 text-slate-300"
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rf, setRf] = useState("all");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load users");
        setLoading(false);
      });
  }, []);

  const f = users.filter(u => 
    (rf === "all" || u.role === rf) && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-slate-400 p-8">Loading users...</div>;
  if (error) return <div className="text-red-400 p-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Users</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} users across all institutions</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        <select value={rf} onChange={e => setRf(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800">
            {["User","Email","Role","Institution","Status","Joined","Last Active","Score",""].map(h => (
              <th key={h} className={`text-left px-5 py-3 text-slate-400 font-medium text-xs uppercase ${h===""?"text-right":""}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-800">
            {f.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-4"><div className="font-medium text-white">{u.name}</div></td>
                <td className="px-5 py-4 text-slate-300">{u.email}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${RC[u.role]}`}>{u.role}</span></td>
                <td className="px-5 py-4 text-slate-400">{u.institution}</td>
                <td className="px-5 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${SC[u.status]}`}>{u.status}</span></td>
                <td className="px-5 py-4 text-slate-400">{u.joined}</td>
                <td className="px-5 py-4 text-slate-400">{u.lastActive}</td>
                <td className="px-5 py-4 text-slate-300">{u.score?.toFixed(1) ?? "N/A"}</td>
                <td className="px-5 py-4 text-right"><button className="text-emerald-400 hover:text-emerald-300 text-xs">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
