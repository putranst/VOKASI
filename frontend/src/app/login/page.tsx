import AppShell from "@/components/AppShell";

export default function LoginPage() {
  return (
    <AppShell
      title="Login"
      subtitle="Use demo accounts from backend auth scaffold to test flows."
    >
      <section className="card" style={{ maxWidth: 560 }}>
        <h2>Demo Credentials</h2>
        <p>Email: student@vokasi.dev | Password: student123</p>
        <p>Email: instructor@vokasi.dev | Password: instructor123</p>
        <p style={{ marginTop: 12 }}>
          Next step: wire this page to call
          <code> POST /api/v1/auth/login </code>
          and persist token in client storage.
        </p>
      </section>
    </AppShell>
  );
}
