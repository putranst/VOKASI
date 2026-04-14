import AppShell from "@/components/AppShell";

const sampleCourses = [
  {
    id: "ai-fundamentals",
    title: "AI Fundamentals for Everyone",
    level: "Beginner",
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering for Work",
    level: "Intermediate",
  },
];

export default function CoursesPage() {
  return (
    <AppShell
      title="Courses"
      subtitle="Manage and browse the learning catalog for VOKASI."
    >
      <section className="grid two-col">
        {sampleCourses.map((course) => (
          <article key={course.id} className="card">
            <h2>{course.title}</h2>
            <p>Level: {course.level}</p>
            <p>Slug: {course.id}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
