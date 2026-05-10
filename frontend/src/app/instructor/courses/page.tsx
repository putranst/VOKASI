"use client";

export default function InstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Courses</h2>
        <a href="/instructor/courses/new" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          + Create Course
        </a>
      </div>

      <div className="grid gap-4">
        {[
          { title: "Intro to AI Prompting", students: 34, status: "published", progress: 82 },
          { title: "Data Ethics Fundamentals", students: 28, status: "published", progress: 65 },
          { title: "Tool Fluency Workshop", students: 27, status: "draft", progress: 91 },
        ].map((course, i) => (
          <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                <p className="text-slate-400">{course.students} students enrolled</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${course.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {course.status}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Progress</span>
                <span className="text-emerald-400">{course.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
