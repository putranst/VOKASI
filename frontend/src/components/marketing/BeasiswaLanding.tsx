"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Zap, GraduationCap, Award, BookOpen, ArrowRight, Star, Sparkles, Globe, Rocket, Check, Shield, Clock, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const COHORT_SLUG = "beta-2026";

const PRICING_TIERS = [
  { seats: "1 – 100", price: "$1", label: "Founder Tier" },
  { seats: "101 – 200", price: "$2", label: "Early Tier" },
  { seats: "201 – 300", price: "$3", label: "" },
  { seats: "301 – 400", price: "$4", label: "" },
  { seats: "401 – 500", price: "$5", label: "" },
  { seats: "501 – 600", price: "$6", label: "" },
  { seats: "601 – 700", price: "$7", label: "" },
  { seats: "701 – 800", price: "$8", label: "" },
  { seats: "801 – 900", price: "$9", label: "" },
  { seats: "901 – 1000", price: "$10", label: "Standard" },
];

const MISSION_PILLARS = [
  {
    icon: Globe,
    title: "Melengkapi Akademik",
    desc: "VOKASI hadir sebagai lapisan akselerasi industri: memperkuat fondasi kampus dengan kompetensi yang dibutuhkan dunia kerja hari ini.",
  },
  {
    icon: Rocket,
    title: "Mengakselerasi Industri",
    desc: "Kurikulum berbasis praktik, capstone nyata, dan evaluasi terukur untuk mempercepat kesiapan talenta ke ekosistem produktif.",
  },
  {
    icon: Sparkles,
    title: "Regenerative AI Learning",
    desc: "Pendekatan AI-native untuk belajar adaptif, pemecahan masalah nyata, dan pembentukan kompetensi berkelanjutan.",
  },
];

const FEATURES = [
  { icon: BookOpen, text: "2 kursus pilihan dengan konten vokasi berbasis praktik" },
  { icon: Zap, text: "Tutor AI 24/7 untuk pendampingan belajar terpersonalisasi" },
  { icon: GraduationCap, text: "Capstone project + AI pre-grade + review instruktur" },
  { icon: Award, text: "Sertifikat terverifikasi untuk bukti kompetensi" },
  { icon: Users, text: "Akses jaringan alumni dan peer talent" },
  { icon: Star, text: "Jalur lanjutan ke program kompetensi tingkat lanjut" },
];

const FAQ_ITEMS = [
  {
    q: "Apa itu Beasiswa VOKASI?",
    a: "Beasiswa VOKASI adalah program scholarship beta yang memberikan akses ke platform pembelajaran AI & Software Engineering dengan harga terjangkau mulai dari Rp 16.000. Program ini dirancang untuk mempercepat kesiapan talenta Indonesia dalam menghadapi era AI.",
  },
  {
    q: "Siapa yang bisa mengikuti program ini?",
    a: "Program ini terbuka untuk mahasiswa SMK, politeknik, universitas, fresh graduate, dan profesional yang ingin meningkatkan kompetensi di bidang AI dan software engineering.",
  },
  {
    q: "Apa saja kursus yang termasuk dalam program ini?",
    a: "Peserta dapat memilih 2 kursus dari katalog kami, termasuk AI Generalist (untuk mahasiswa & job seeker) dan AI Marketer (untuk SME owner & growth leader). Kedua kursus mencakup capstone project dan sertifikat terverifikasi.",
  },
  {
    q: "Bagaimana sistem pembayaran dan verifikasi?",
    a: "Pembayaran dilakukan melalui Midtrans dengan berbagai metode: GoPay, OVO, Bank Transfer, dan Credit Card. Setelah pembayaran berhasil, akses kursus akan langsung aktif dalam hitungan menit.",
  },
  {
    q: "Apakah ada jaminan uang kembali?",
    a: "Ya, kami memberikan garansi 30 hari. Jika dalam 30 hari pertama Anda merasa tidak puas dengan pembelajaran, silakan hubungi tim kami untuk refund penuh.",
  },
  {
    q: "Berapa lama akses kursus diberikan?",
    a: "Peserta mendapatkan akses penuh selama 30 hari ke 2 kursus yang dipilih, termasuk semua update konten dan fitur platform selama periode tersebut.",
  },
  {
    q: "Bagaimana cara Capstone Project dievaluasi?",
    a: "Setiap capstone project akan melalui proses evaluasi ganda: AI pre-grade otomatis untuk feedback cepat, diikuti review dari instruktur berpengalaman untuk validasi dan panduan lebih lanjut.",
  },
  {
    q: "Apakah sertifikat dari VOKASI diakui?",
    a: "Ya, sertifikat VOKASI terverifikasi dan dapat digunakan sebagai bukti kompetensi dalam portfolio profesional, pencarian kerja, atau pengajuan kredit kompetensi di institusi pendidikan.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rina Santika",
    role: "Mahasiswa SMK Teknik Komputer",
    text: "Sebelum VOKASI, saya merasa curriculum sekolah jauh dari kebutuhan industri. Sekarang saya punya portfolio project AI dan自信 untuk internship.",
    avatar: "RS",
  },
  {
    name: "Budi Prasetyo",
    role: "Mahasiswa Politeknik Elektronika",
    text: "Capstone project di VOKASI mirip banget sama kerjaan nyata. Feedback dari AI tutor membantu saya memahami ошибки dengan cepat.",
    avatar: "BP",
  },
  {
    name: "Sari Dewi",
    role: "Fresh Graduate Hukum",
    text: "Track AI Fluency sangat membantu saya sebagai non-tech student. Sekarang saya bisa evaluasi hasil AI legal research dengan kritis.",
    avatar: "SD",
  },
];

const GUARANTEES = [
  { icon: Shield, text: "Garansi 30 hari uang kembali" },
  { icon: Clock, text: "Akses 24/7 ke platform" },
  { icon: MessageCircle, text: "Dukungan tim VOKASI" },
];

interface CohortData {
  seats_sold: number;
  seats_remaining: number;
  current_price_usd: number;
  current_price_idr: number;
  seat_cap: number;
}

export default function BeasiswaLanding() {
  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/cohorts/${COHORT_SLUG}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCohort(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pctSold = cohort ? Math.round((cohort.seats_sold / cohort.seat_cap) * 100) : 0;
  const currentTierIdx = cohort ? PRICING_TIERS.findIndex((_, i) => cohort.seats_sold < (i + 1) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#041a16] text-white overflow-hidden">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.28),transparent_36%),radial-gradient(circle_at_80%_15%,rgba(45,212,191,0.18),transparent_40%),linear-gradient(120deg,#03100d_0%,#053229_45%,#03110f_100%)]" />
      <div className="absolute inset-0 -z-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tight">VOKASI</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Masuk</Link>
          <Link
            href={`/register?cohort=${COHORT_SLUG}`}
            className="bg-gradient-to-r from-emerald-300 to-teal-200 text-[#063a2f] px-4 py-2 rounded-xl text-sm font-bold hover:brightness-105 transition-all shadow-lg"
          >
            Daftar Beasiswa
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-emerald-200/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Ekspedisi AI Nusantara 2026 — Terbatas 1.000 kursi
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
          Melengkapi Akademik,<br />
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
            Mengakselerasi Industri.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
          VOKASI Academy hadir sebagai mitra strategis untuk mempercepat kesiapan talenta melalui
          standar kompetensi <span className="font-semibold text-emerald-200">Regenerative AI</span>
          {" "}dan verifikasi kompetensi yang dapat dipertanggungjawabkan.
        </p>

        {!loading && cohort && (
          <div className="max-w-xl mx-auto mb-10 bg-white/10 border border-white/15 rounded-2xl px-6 py-5 backdrop-blur-xl">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>{cohort.seats_sold.toLocaleString()} kursi terambil</span>
              <span>{cohort.seats_remaining.toLocaleString()} tersisa</span>
            </div>
            <div className="w-full bg-white/15 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-300 to-teal-200 h-3 rounded-full transition-all duration-700"
                style={{ width: `${pctSold}%` }}
              />
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-100">
              Harga saat ini: ${cohort.current_price_usd}{" "}
              <span className="text-base font-normal text-white/60">
                (Rp {cohort.current_price_idr.toLocaleString("id-ID")})
              </span>
            </p>
          </div>
        )}

        {loading && (
          <div className="max-w-md mx-auto mb-10 h-16 bg-white/10 rounded-2xl animate-pulse" />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/register?cohort=${COHORT_SLUG}`}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-300 to-teal-200 text-[#063a2f] px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] transition-all shadow-2xl"
          >
            Amankan Slot Beasiswa
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#kurikulum"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-white/20 transition"
          >
            Lihat Kurikulum
          </Link>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {MISSION_PILLARS.map((m) => (
            <div key={m.title} className="bg-white/[0.07] border border-white/15 rounded-2xl p-5 backdrop-blur-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-300/20 text-emerald-200 flex items-center justify-center mb-3">
                <m.icon size={18} />
              </div>
              <h3 className="font-bold text-white mb-1">{m.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="kurikulum" className="relative z-10 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-center mb-10">Kurikulum Berbasis Kompetensi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/10 rounded-2xl p-5 border border-white/10">
                <div className="p-2 bg-emerald-400/20 rounded-xl flex-shrink-0">
                  <f.icon className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-white/90 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white/8 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-extrabold text-white mb-2">AI Generalist</h3>
              <p className="text-xs uppercase tracking-widest text-emerald-200/80 font-bold mb-4">Untuk mahasiswa & job seeker</p>
              <ul className="space-y-2 text-sm text-white/75">
                <li>• Regenerative learning workflow</li>
                <li>• Agentic productivity for professional tasks</li>
                <li>• Capstone kesiapan kerja berbasis output</li>
              </ul>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-extrabold text-white mb-2">AI Marketer</h3>
              <p className="text-xs uppercase tracking-widest text-emerald-200/80 font-bold mb-4">Untuk SME owner & growth leader</p>
              <ul className="space-y-2 text-sm text-white/75">
                <li>• Growth engine berbasis AI</li>
                <li>• Lead generation automation</li>
                <li>• Efisiensi operasional dan CAC optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">Struktur Harga Beasiswa</h2>
        <p className="text-white/60 text-center mb-10">Harga meningkat otomatis setiap 100 kursi terisi.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PRICING_TIERS.map((t, i) => {
            const isActive = cohort ? i === currentTierIdx : i === 0;
            const isPast = cohort ? cohort.seats_sold >= (i + 1) * 100 : false;
            return (
              <div
                key={i}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  isActive
                    ? "bg-emerald-400 text-[#064e3b] border-emerald-400 scale-105 shadow-xl"
                    : isPast
                    ? "bg-white/5 border-white/10 opacity-50"
                    : "bg-white/10 border-white/10"
                }`}
              >
                <div className={`text-2xl font-black ${isActive ? "text-[#064e3b]" : "text-emerald-300"}`}>{t.price}</div>
                <div className={`text-xs mt-1 ${isActive ? "text-[#064e3b]/70" : "text-white/50"}`}>{t.seats}</div>
                {t.label && <div className={`text-xs font-bold mt-1 ${isActive ? "text-[#064e3b]" : "text-emerald-300"}`}>{t.label}</div>}
                {isActive && <div className="mt-2 text-xs font-bold bg-[#064e3b] text-emerald-300 rounded-full px-2 py-0.5">AKTIF</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap justify-center gap-6">
          {GUARANTEES.map((g) => (
            <div key={g.text} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-full px-5 py-2.5 backdrop-blur-md">
              <g.icon className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium text-white/90">{g.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-center mb-4">Cerita dari Peserta</h2>
          <p className="text-white/60 text-center mb-10">Dengarkan pengalaman mereka yang sudah merasakan manfaat VOKASI</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-[#064e3b] font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-white/60">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">"{t.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-center mb-10">Pertanyaan Umum</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white/10 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-lg">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-white">{item.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/60 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 pt-0 text-sm text-white/70 leading-relaxed border-t border-white/10">
                  <p className="pt-4">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black mb-4">Verifikasi Scholar VOKASI</h2>
        <p className="text-white/70 mb-8">Kurasi talenta berbasis potensi kontribusi untuk ekosistem AI Nusantara.</p>
        <Link
          href={`/register?cohort=${COHORT_SLUG}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-300 to-teal-200 text-[#064336] px-10 py-5 rounded-2xl text-xl font-black hover:scale-[1.02] transition-all shadow-2xl"
        >
          Daftar Beasiswa Sekarang
          <ArrowRight size={22} />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-white/40 text-sm">
        © 2026 VOKASI Academy · Infrastruktur pembelajaran vokasi untuk percepatan talenta Nusantara.
      </footer>
    </div>
  );
}
