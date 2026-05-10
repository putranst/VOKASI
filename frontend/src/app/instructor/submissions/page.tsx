"use client";

export default function InstructorSubmissionsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Submissions to Grade</h2>

      <div className="space-y-4">
        {[
          { student: "Budi Santoso", challenge: "AI Prompt Analysis", submitted: "2 hours ago", status: "pending" },
          { student: "Siti Nurhaliza", challenge: "Ethics Case Study", submitted: "5 hours ago", status: "pending" },
          { student: "Ahmad Fauzi", challenge: "Tool Comparison", submitted: "1 day ago", status: "graded" },
        ].map((sub, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-medium">{sub.student}</h3>
                <p className="text-slate-400 text-sm">{sub.challenge}</p>
                <p className="text-slate-500 text-xs mt-1">Submitted {sub.submitted}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${sub.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {sub.status}
              </span>
            </div>
            {sub.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Review</button>
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">View Submission</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
