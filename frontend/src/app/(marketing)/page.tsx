import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xl">◆</span>
            <span className="font-bold text-emerald-400 tracking-wide text-lg">VOKASI2</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium">
            🚀 Indonesia's AI-Vocational Education Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Learn AI by <span className="text-emerald-400">Building</span>,<br />
            Not Watching
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Brain-based vocational education for Indonesian SMK, polytechnic, and university students.
            Master real AI skills through challenges, not lectures.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-center">
              Start Learning Free →
            </Link>
            <Link href="/pricing" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700 text-center">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Everything you need to master AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "◐", title:"Challenge Arena", desc:"Open-ended challenges in Prompt Engineering, Model Evaluation, AI Ethics, and more. AI-evaluated with rubric-based feedback." },
              { icon: "◎", title:"AI Mentor Matching", desc:"pgvector-powered matching connects you with mentors whose strengths fill your competency gaps." },
              { icon: "◆", title:"Verified Portfolio", desc:"Blockchain-certified credentials. Show employers real AI skills, not just course completion." },
              { icon: "◉", title:"Competency Radar", desc:"12-dimensional brain-based competency tracking. See exactly where you grow every week." },
              { icon: "◑", title:"Socratic Reasoning", desc:"AI tutor that challenges your thinking, not just answers questions. Build judgment, not just knowledge." },
              { icon: "◈", title:"Peer Circles", desc:"Anonymous cross-evaluation. Learn from peers, earn the Peer Mentor badge." },
            ].map(f => (
              <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/20 transition-all">
                <div className="text-3xl text-emerald-400 mb-3">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[["50+", "Institutions"], ["10,000+", "Students"], ["13", "AI Badges"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-3xl font-bold text-emerald-400">{v}</div>
              <div className="text-slate-500 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">◆</span>
            <span className="font-bold text-emerald-400">VOKASI2</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 VOKASI2. Brain-based AI vocational education for Indonesia.
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
            <Link href="/login" className="hover:text-slate-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
