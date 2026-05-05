"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Target, BookOpen, ChevronRight, Check, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const GOAL_OPTIONS = [
  "Mendapatkan pekerjaan pertama di bidang teknologi",
  "Meningkatkan kompetensi untuk naik jabatan",
  "Memulai usaha/freelance digital",
  "Mempersiapkan diri untuk kuliah vokasi",
  "Menambah skill baru untuk proyek pribadi",
  "Memenuhi syarat sertifikasi kompetensi",
];

interface Course {
  id: number;
  title: string;
  category: string;
  level: string;
  description: string;
  duration: string;
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < step
                ? "bg-emerald-600 text-white"
                : i === step
                ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {i < step ? <Check size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-12 ${i < step ? "bg-emerald-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [cohortSlug, setCohortSlug] = useState("beta-2026");

  // Step 0: Profile
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Step 1: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Step 2: Course selection
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    setUserId(user.id);
    setFullName(user.full_name || user.name || "");
    // Read cohort from sessionStorage (set during register flow)
    const cs = sessionStorage.getItem("cohort_slug");
    if (cs) setCohortSlug(cs);
  }, []);

  useEffect(() => {
    if (step === 2) {
      setCoursesLoading(true);
      fetch(`${API_BASE}/api/v1/courses`)
        .then((r) => r.json())
        .then((d) => setCourses(Array.isArray(d) ? d.slice(0, 20) : d.courses || []))
        .catch(() => {})
        .finally(() => setCoursesLoading(false));
    }
  }, [step]);

  const toggleGoal = (g: string) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleCourse = (id: number) => {
    setSelectedCourses((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const handleNext = async () => {
    setError("");
    if (step === 0) {
      if (!fullName.trim()) { setError("Nama lengkap wajib diisi."); return; }
      setStep(1);
    } else if (step === 1) {
      if (selectedGoals.length === 0) { setError("Pilih minimal 1 tujuan belajar."); return; }
      setStep(2);
    } else if (step === 2) {
      if (selectedCourses.length !== 2) { setError("Pilih tepat 2 kursus."); return; }

      setSaving(true);
      try {
        const token = localStorage.getItem("token");
        // Save profile + goals
        await fetch(`${API_BASE}/api/v1/users/${userId}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            full_name: fullName,
            bio,
            linkedin_url: linkedinUrl,
            github_url: githubUrl,
            learning_goals: selectedGoals,
            onboarding_completed: false,
            onboarding_phase: "prepay_complete",
          }),
        });

        // Store selected course IDs for payment step
        sessionStorage.setItem("selected_course_ids", JSON.stringify(selectedCourses));
        router.push(`/payment/beasiswa?cohort=${cohortSlug}`);
      } catch {
        setError("Gagal menyimpan. Silakan coba lagi.");
      } finally {
        setSaving(false);
      }
    }
  };

  const steps = [
    { label: "Profil", icon: User },
    { label: "Tujuan", icon: Target },
    { label: "Kursus", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#071a16] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.18),transparent_38%),linear-gradient(130deg,#04100d_0%,#053127_48%,#03100d_100%)]" />
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Selamat Datang di VOKASI</h1>
          <p className="text-emerald-100/75 text-sm">Selesaikan onboarding untuk mengaktifkan jalur belajarmu</p>
        </div>

        <StepIndicator step={step} total={3} />

        {/* Step labels */}
        <div className="flex justify-between mb-8 -mt-4">
          {steps.map((s, i) => (
            <div key={i} className={`text-xs font-medium ${i <= step ? "text-emerald-700" : "text-gray-400"}`}>
              {s.label}
            </div>
          ))}
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl border border-white/30 p-8 backdrop-blur-xl">
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#1f2937] mb-6 flex items-center gap-2">
                <User size={20} className="text-emerald-600" /> Lengkapi Profilmu
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Siti Rahma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio Singkat</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Siswa SMK jurusan Rekayasa Perangkat Lunak..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (opsional)</label>
                  <input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub (opsional)</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="github.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Goals */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#1f2937] mb-6 flex items-center gap-2">
                <Target size={20} className="text-emerald-600" /> Apa Tujuan Belajarmu?
              </h2>
              <p className="text-sm text-gray-500 mb-4">Pilih satu atau lebih tujuan belajar.</p>
              <div className="space-y-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      selectedGoals.includes(g)
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedGoals.includes(g) ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                      }`}>
                        {selectedGoals.includes(g) && <Check size={10} className="text-white" />}
                      </div>
                      {g}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Course selection */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#1f2937] mb-2 flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-600" /> Pilih 2 Kursus
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Kedua kursus ini termasuk dalam paket beta kamu.{" "}
                <span className="font-medium text-emerald-700">{selectedCourses.length}/2 dipilih</span>
              </p>
              {coursesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {courses.map((c) => {
                    const selected = selectedCourses.includes(c.id);
                    const disabled = !selected && selectedCourses.length >= 2;
                    return (
                      <button
                        key={c.id}
                        onClick={() => !disabled && toggleCourse(c.id)}
                        disabled={disabled}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          selected
                            ? "bg-emerald-50 border-emerald-500"
                            : disabled
                            ? "border-gray-100 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                          }`}>
                            {selected && <Check size={10} className="text-white" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{c.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {c.category} · {c.level} · {c.duration}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Kembali
              </button>
            ) : <div />}
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
              ) : step === 2 ? (
                <>Lanjut ke Pembayaran <ChevronRight size={16} /></>
              ) : (
                <>Lanjut <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
