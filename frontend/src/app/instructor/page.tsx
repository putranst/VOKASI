"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";

export default function InstructorDashboardPage() {
  const { user } = useAuthStore();
  const [stats] = useState({ courses: 5, students: 89, completion: 78, rating: 4.8 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome, {user?.full_name || "Instructor"}</h2>
        <p className="text-slate-400 mt-1">Manage your courses and track student progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Courses", value: stats.courses, icon: "📚" },
          { label: "Total Students", value: stats.students, icon: "👨‍🎓" },
          { label: "Avg Completion", value: `${stats.completion}%`, icon: "📈" },
          { label: "Avg Rating", value: stats.rating, icon: "⭐" },
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
          <h3 className="text-lg font-semibold text-white mb-4">My Courses</h3>
          <div className="space-y-3">
            {[
              { title: "Intro to AI Prompting", students: 34, progress: 82 },
              { title: "Data Ethics Fundamentals", students: 28, progress: 65 },
              { title: "Tool Fluency Workshop", students: 27, progress: 91 },
            ].map((course, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">{course.title}</div>
                    <div className="text-sm text-slate-400">{course.students} students</div>
                  </div>
                  <div className="text-emerald-400 text-sm">{course.progress}%</div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Create Course", icon: "📝", href: "/instructor/courses/new" },
              { label: "Grade Submissions", icon: "✅", href: "/instructor/submissions" },
              { label: "View Analytics", icon: "📊", href: "/instructor/analytics" },
              { label: "Upload Document", icon: "📄", href: "/instructor/documents" },
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
