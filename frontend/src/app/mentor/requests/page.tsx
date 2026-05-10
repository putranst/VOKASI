"use client";

export default function MentorRequestsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mentoring Requests</h2>

      <div className="space-y-4">
        {[
          { student: "Budi Santoso", topic: "AI Prompting", message: "I need help understanding advanced prompt engineering techniques.", time: "2 hours ago", status: "pending" },
          { student: "Siti Nurhaliza", topic: "Career Advice", message: "Looking for guidance on AI career paths in Indonesia.", time: "5 hours ago", status: "pending" },
          { student: "Ahmad Fauzi", topic: "Portfolio Review", message: "Would like feedback on my AI project portfolio.", time: "1 day ago", status: "accepted" },
        ].map((req, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-medium">{req.student}</h3>
                <p className="text-purple-400 text-sm">{req.topic}</p>
                <p className="text-slate-400 text-sm mt-2">{req.message}</p>
                <p className="text-slate-500 text-xs mt-2">{req.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {req.status}
              </span>
            </div>
            {req.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">Accept</button>
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
