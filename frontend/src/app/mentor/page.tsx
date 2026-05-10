"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";

export default function MentorDashboardPage() {
  const { user } = useAuthStore();
  const [stats] = useState({ requests: 3, students: 12, sessions: 28, hours: 45 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome, {user?.full_name || "Mentor"}</h2>
        <p className="text-slate-400 mt-1">Guide students and help them grow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Requests", value: stats.requests, icon: "📩" },
          { label: "Active Students", value: stats.students, icon: "👨‍🎓" },
          { label: "Total Sessions", value: stats.sessions, icon: "📅" },
          { label: "Hours Mentored", value: stats.hours, icon: "⏰" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {[
              { student: "Budi Santoso", topic: "AI Prompting", time: "2 hours ago" },
              { student: "Siti Nurhaliza", topic: "Career Advice", time: "5 hours ago" },
              { student: "Ahmad Fauzi", topic: "Portfolio Review", time: "1 day ago" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                <div>
                  <div className="font-medium text-white">{req.student}</div>
                  <div className="text-sm text-slate-400">{req.topic}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{req.time}</span>
                  <button className="px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Requests", icon: "📩", href: "/mentor/requests" },
              { label: "My Students", icon: "👨‍🎓", href: "/mentor/students" },
              { label: "Schedule Session", icon: "📅", href: "/mentor/sessions" },
              { label: "Update Profile", icon: "👤", href: "/mentor/profile" },
            ].map((action) => (
              <a key={action.label} href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm text-slate-300">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
