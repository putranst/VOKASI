"use client";

export default function MentorStudentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Students</h2>

      <div className="grid gap-4">
        {[
          { name: "Ahmad Fauzi", field: "AI Fundamentals", sessions: 5, lastSession: "2 days ago" },
          { name: "Dewi Lestari", field: "Data Ethics", sessions: 3, lastSession: "1 week ago" },
          { name: "Rizki Pratama", field: "Prompt Engineering", sessions: 8, lastSession: "Yesterday" },
        ].map((student, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                {student.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{student.name}</h3>
                <p className="text-slate-400 text-sm">{student.field}</p>
              </div>
              <div className="text-right">
                <div className="text-white">{student.sessions} sessions</div>
                <div className="text-slate-400 text-sm">Last: {student.lastSession}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">Schedule Session</button>
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">View Progress</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
