"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  completionRate: number;
  lastActive: string;
  status: string;
  // API snake_case fields
  enrolled_courses?: number;
  completion_rate?: number;
  last_active?: string;
}

function normalizeStudent(raw: Student): Student {
  return {
    id: raw.id,
    name: raw.name ?? "",
    email: raw.email ?? "",
    enrolledCourses: raw.enrolledCourses ?? raw.enrolled_courses ?? 0,
    completionRate: raw.completionRate ?? raw.completion_rate ?? 0,
    lastActive: raw.lastActive ?? raw.last_active ?? "",
    status: raw.status ?? "active",
  };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function statusColor(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "at_risk") return "bg-amber-100 text-amber-700";
  return "bg-zinc-100 text-zinc-500";
}

export default function InstructorStudentsPage() {
  const { token } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "at_risk" | "inactive">("all");

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data.map(normalizeStudent) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        setStudents([]);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9488]" />
      </div>
    );
  }

  const filtered = students.filter((s) => filter === "all" || s.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Students</h1>
        <p className="text-sm text-zinc-500 mt-1">{students.length} students enrolled across all courses</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "at_risk", "inactive"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-[#0d9488] text-white" : "bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}>
            {f === "all" ? "All" : f === "at_risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">{f === "all" ? students.length : students.filter((s) => s.status === f).length}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-3 px-4 font-semibold text-zinc-600">Student</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600">Courses</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600">Completion</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600">Status</th>
                  <th className="text-center py-3 px-3 font-semibold text-zinc-600">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 bg-[#0d9488]/10 text-[#0d9488]">
                          <AvatarFallback className="text-xs font-bold">{getInitials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-zinc-900">{s.name}</p>
                          <p className="text-xs text-zinc-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 text-zinc-600">{s.enrolledCourses}</td>
                    <td className="text-center px-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#0d9488]" style={{ width: `${s.completionRate}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 w-8">{s.completionRate}%</span>
                      </div>
                    </td>
                    <td className="text-center px-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(s.status)}`}>
                        {s.status === "at_risk" ? "At Risk" : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-center px-3 text-zinc-500 text-xs">{s.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-zinc-500 text-sm mb-2">No students found</p>
              <p className="text-zinc-400 text-xs">Students will appear here once they enroll in courses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}