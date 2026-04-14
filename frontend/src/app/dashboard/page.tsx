import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Track progress, recent activity, and upcoming learning tasks."
    >
      <section className="grid two-col">
        <article className="card">
          <h2>Active Courses</h2>
          <p>0 running course sessions in this starter scaffold.</p>
        </article>
        <article className="card">
          <h2>To Do</h2>
          <p>Connect dashboard cards to backend learner progress APIs.</p>
        </article>
      </section>
    </AppShell>
  );
}
