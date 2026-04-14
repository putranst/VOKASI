import Link from "next/link";

import AppShell from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell
      title="Build VOKASI Faster"
      subtitle="Starter workspace for vocational learning workflows, courses, and classroom tools."
    >
      <section className="grid two-col">
        <article className="card">
          <h2>Frontend Ready</h2>
          <p>Next.js App Router scaffold is set up and ready for feature pages.</p>
          <Link href="/courses" className="btn btn-primary">
            Explore Courses Page
          </Link>
        </article>

        <article className="card">
          <h2>Backend Ready</h2>
          <p>FastAPI service scaffold with health and auth endpoints is prepared.</p>
          <a
            href="http://localhost:8000/api/v1/health"
            className="btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            Open API Health
          </a>
        </article>
      </section>
    </AppShell>
  );
}
