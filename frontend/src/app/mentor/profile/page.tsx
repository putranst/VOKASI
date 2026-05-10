"use client";

import { useAuthStore } from "@/store";

export default function MentorProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">My Profile</h2>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-2xl">
            {user?.full_name?.[0] || "M"}
          </div>
          <div>
            <h3 className="text-xl text-white">{user?.full_name || "Mentor"}</h3>
            <p className="text-slate-400">{user?.email || "mentor@vokasi.id"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input type="text" defaultValue={user?.full_name || ""} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
            <textarea className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white h-24" placeholder="Tell students about your expertise..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Expertise Areas</label>
            <input type="text" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="e.g., AI, Data Ethics, Career Development" />
          </div>
          <button className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
