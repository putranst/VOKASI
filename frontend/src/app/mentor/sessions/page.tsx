"use client";

export default function MentorSessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Sessions</h2>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
          + Schedule Session
        </button>
      </div>

      <div className="space-y-4">
        {[
          { student: "Ahmad Fauzi", date: "May 10, 2026", time: "14:00 - 15:00", topic: "Portfolio Review", status: "upcoming" },
          { student: "Rizki Pratama", date: "May 8, 2026", time: "10:00 - 11:00", topic: "Prompt Techniques", status: "completed" },
          { student: "Dewi Lestari", date: "May 5, 2026", time: "15:00 - 16:00", topic: "Ethics Discussion", status: "completed" },
        ].map((session, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-medium">{session.student}</h3>
                <p className="text-purple-400 text-sm">{session.topic}</p>
                <p className="text-slate-400 text-sm mt-1">📅 {session.date} • ⏰ {session.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${session.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {session.status}
              </span>
            </div>
            {session.status === 'upcoming' && (
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">Join Session</button>
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">Reschedule</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
