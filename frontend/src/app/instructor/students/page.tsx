"use client";

export default function InstructorStudentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Students</h2>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Progress</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[
              { name: "Budi Santoso", email: "budi@student.id", progress: 78, lastActive: "2 hours ago" },
              { name: "Siti Nurhaliza", email: "siti@student.id", progress: 92, lastActive: "1 day ago" },
              { name: "Ahmad Fauzi", email: "ahmad@student.id", progress: 45, lastActive: "3 hours ago" },
            ].map((student, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 text-white">{student.name}</td>
                <td className="px-4 py-3 text-slate-400">{student.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="text-slate-400 text-sm">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 text-sm">{student.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
