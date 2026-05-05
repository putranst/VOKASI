"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, MessageSquare, TrendingUp, ShieldCheck } from "lucide-react";

const DIFFERENTIATORS = [
  {
    icon: BrainCircuit,
    title: "Challenge Arena",
    description:
      "Open-ended AI challenges that build judgment, not just knowledge. Get AI feedback in 60 seconds.",
    href: "/challenges",
    color: "text-[#064e3b]",
    bg: "bg-[#f0fdf4]",
  },
  {
    icon: MessageSquare,
    title: "SocraticChat AI Tutor",
    description:
      "Dialogue-driven learning. Our AI asks questions to build your reasoning — not give you answers.",
    href: "/tutor",
    color: "text-[#f59e0b]",
    bg: "bg-[#fffbeb]",
  },
  {
    icon: TrendingUp,
    title: "Competency Portfolio",
    description:
      "Demonstrate real AI capabilities, not certificates. A portfolio that shows what you can actually do.",
    href: "/portfolio",
    color: "text-[#34d399]",
    bg: "bg-[#f0fdf4]",
  },
  {
    icon: ShieldCheck,
    title: "Safe Sandbox",
    description:
      "Experiment freely. Cloud sandboxes reset with one click — no fear of breaking things.",
    href: "/sandbox",
    color: "text-[#64748b]",
    bg: "bg-[#f8fafc]",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e2e8f0] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#064e3b]">VOKASI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/challenges"
              className="text-sm font-medium text-[#64748b] hover:text-[#064e3b] transition-colors"
            >
              Challenges
            </Link>
            <Link
              href="/tutor"
              className="text-sm font-medium text-[#64748b] hover:text-[#064e3b] transition-colors"
            >
              AI Tutor
            </Link>
            <Link
              href="/portfolio"
              className="text-sm font-medium text-[#64748b] hover:text-[#064e3b] transition-colors"
            >
              Portfolio
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#64748b]">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#064e3b] hover:bg-[#065f3c] text-white"
              >
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[#064e3b] opacity-[0.03]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(6,78,59,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#34d399]/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]" />
            </span>
            <span className="text-xs font-medium text-[#064e3b]">
              AI-Native Learning for Indonesia
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1f2937] leading-tight tracking-tight">
            Build Real AI Capabilities
            <br />
            <span className="text-[#064e3b]">Not Just Certificates</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-[#64748b] max-w-2xl mx-auto leading-relaxed">
            VOKASI is the brain-based learning platform that trains your
            judgment, critical thinking, and AI collaboration skills — the
            capabilities that actually matter in the AI age.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#064e3b] hover:bg-[#065f3c] text-white font-semibold px-8 h-12 rounded-xl text-base shadow-lg shadow-[#064e3b]/20"
              >
                Mulai Sekarang — Gratis
              </Button>
            </Link>
            <Link href="/challenges">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-[#064e3b]/20 text-[#064e3b] hover:bg-[#f0fdf4] hover:border-[#064e3b]/40 font-semibold px-8 h-12 rounded-xl text-base"
              >
                Lihat Tantangan
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[
              { value: "14,000+", label: "SMK di Indonesia" },
              { value: "8M+", label: "Pelajar pertahun" },
              { value: "12", label: "Dimensi Kompetensi" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#064e3b]">
                  {value}
                </div>
                <div className="text-sm text-[#64748b] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1f2937]">
              Bukan Kursus Biasa
            </h2>
            <p className="mt-3 text-[#64748b] max-w-xl mx-auto">
              Kami membangun kemampuan berpikir kritis dengan AI, bukan sekadar
              menonton video dan mengambil kuis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFFERENTIATORS.map(({ icon: Icon, title, description, href, color, bg }) => (
              <Link key={title} href={href}>
                <Card className="h-full border border-[#e2e8f0] hover:border-[#064e3b]/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <CardTitle className="text-base font-semibold text-[#1f2937]">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-[#64748b] leading-relaxed">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#fafaf9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1f2937]">
              Cara Kerja VOKASI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Diagnostik AI",
                description:
                  "AI menganalisis kemampuan Anda di 12 dimensi — dari Prompt Engineering hingga Etika Data.",
              },
              {
                step: "02",
                title: "Tantangan Nyata",
                description:
                  "Kerjakan tantangan berbasis kasus nyata. Tidak ada jawaban tunggal — yang dinilai adalah proses berpikir Anda.",
              },
              {
                step: "03",
                title: "Portfolio Kompetensi",
                description:
                  "Bangun portfolio yang menunjukkan kemampuan nyata. Bukan sertifikat, tapi bukti pekerjaan Anda.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-bold text-[#064e3b]/10 font-mono">
                  {step}
                </div>
                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-[#1f2937]">{title}</h3>
                  <p className="mt-2 text-sm text-[#64748b] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#064e3b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Siap membangun kemampuan AI yang真正 bermakna?
          </h2>
          <p className="mt-4 text-[#34d399] text-lg">
            Bergabung dengan ribuan pelajar Indonesia yang sedang membangun
            kemampuan untuk masa depan AI.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#064e3b] hover:bg-[#f0fdf4] font-semibold px-10 h-12 rounded-xl text-base"
              >
                Daftar Gratis Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#064e3b] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#064e3b]">VOKASI</span>
          </div>
          <p className="text-sm text-[#64748b]">
            Brain-Based AI Learning Platform for Indonesia
          </p>
          <p className="text-sm text-[#64748b]">
            © 2026 VOKASI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
