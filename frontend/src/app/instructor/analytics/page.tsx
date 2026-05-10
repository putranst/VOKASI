"use client";

export default function InstructorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Enrollments", value: "89", change: "+12%" },
          { label: "Avg. Completion Rate", value: "78%", change: "+5%" },
          { label: "Avg. Rating", value: "4.8", change: "+0.2" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm">{stat.label}</div>
            <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
            <div className="text-emerald-400 text-sm mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Student Activity (Last 7 Days)</h3>
        <div className="h-48 flex items-end gap-2">
          {[65, 78, 45, 89, 92, 70, 55].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
              <span className="text-xs text-slate-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
