"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { PlusCircle, BookOpen, Users, MoreHorizontal, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  module_count: number;
  enrolled_count: number;
  competency_weights: Record<string, number>;
  created_at: string;
}

export default function InstructorCoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch from API when DB is ready — load demo data for now
    setCourses([
      { id: "demo-1", title: "AI Fundamentals for Vocational Students", description: "Introduction to prompt engineering, model evaluation, and AI workflows", status: "published", module_count: 8, enrolled_count: 24, competency_weights: {}, created_at: new Date().toISOString() },
      { id: "demo-2", title: "Data Analysis with AI Tools", description: "Using AI-assisted Python and Excel for real-world data analysis", status: "draft", module_count: 5, enrolled_count: 0, competency_weights: {}, created_at: new Date().toISOString() },
    ]);
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Courses</h1>
          <p className="text-sm text-zinc-500 mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""} created</p>
        </div>
        <Link href="/instructor/courses/new"
          className="flex items-center gap-2 rounded-lg bg-[#0d9488] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f766e] transition-colors">
          <PlusCircle className="w-4 h-4" /> Create New Course
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 w-3/4 rounded bg-zinc-200" /></CardHeader>
              <CardContent><div className="h-4 w-full rounded bg-zinc-200 mb-2" /><div className="h-4 w-2/3 rounded bg-zinc-200" /></CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-zinc-300 mb-4" />
          <h2 className="text-lg font-semibold text-zinc-700 mb-2">No courses yet</h2>
          <p className="text-sm text-zinc-500 mb-6">Create your first AI-powered course in minutes</p>
          <Link href="/instructor/courses/new" className="flex items-center gap-2 rounded-lg bg-[#0d9488] px-4 py-2 text-sm font-medium text-white">
            <PlusCircle className="w-4 h-4" /> Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-zinc-900 leading-snug">{course.title}</CardTitle>
                  <Badge variant={course.status === "published" ? "default" : "secondary"}
                    className={course.status === "published" ? "bg-emerald-100 text-emerald-700 shrink-0": "bg-zinc-100 text-zinc-500 shrink-0"}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.module_count} modules</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolled_count} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/instructor/courses/${course.id}/edit`}
                    className="flex-1 rounded-lg border border-[#0d9488] bg-[#0d9488]/5 px-3 py-2 text-center text-sm font-medium text-[#0d9488] hover:bg-[#0d9488]/10 transition-colors">
                    Edit Course
                  </Link>
                  <Link href={`/courses/${course.id}`}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}