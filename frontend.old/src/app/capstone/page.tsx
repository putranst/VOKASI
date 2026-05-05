"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Github, ExternalLink, Loader2, CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SubmissionStatus = "pending" | "ai_graded" | "approved" | "rejected" | "revision_requested";

interface Submission {
  id: number;
  title: string;
  description: string;
  artifact_url: string | null;
  github_url: string | null;
  additional_notes: string | null;
  status: SubmissionStatus;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_graded_at: string | null;
  instructor_score: number | null;
  instructor_feedback: string | null;
  reviewed_at: string | null;
  submitted_at: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:             { label: "Menunggu AI Review",  color: "text-amber-600 bg-amber-50 border-amber-200",   icon: Clock },
  ai_graded:           { label: "Menunggu Instruktur", color: "text-blue-600 bg-blue-50 border-blue-200",       icon: Clock },
  approved:            { label: "Disetujui ✓",         color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejected:            { label: "Ditolak",             color: "text-red-600 bg-red-50 border-red-200",          icon: XCircle },
  revision_requested:  { label: "Perlu Revisi",        color: "text-orange-600 bg-orange-50 border-orange-200", icon: AlertCircle },
};

export default function CapstonePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [cohortId, setCohortId] = useState<number | null>(null);

  const [existing, setExisting] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    const token = localStorage.getItem("token");
    setUserId(user.id);

    const cid = sessionStorage.getItem("cohort_id");
    if (cid) setCohortId(Number(cid));

    // Check for existing submission
    fetch(`${API_BASE}/api/v1/users/${user.id}/capstone`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((data: Submission[]) => {
        if (Array.isArray(data) && data.length > 0) setExisting(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Judul dan deskripsi wajib diisi."); return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v1/capstone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          cohort_id: cohortId,
          title: title.trim(),
          description: description.trim(),
          artifact_url: artifactUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          additional_notes: additionalNotes.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Gagal mengirim");
      }
      const data: Submission = await res.json();
      setExisting(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => setExisting(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  // Show existing submission status
  if (existing) {
    const cfg = STATUS_CONFIG[existing.status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
      <div className="min-h-screen bg-[#fafaf9] px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#1f2937] mb-2">Capstone Project</h1>
            <p className="text-gray-500 text-sm">Status pengumpulan proyekmu</p>
          </div>

          <div className={`rounded-2xl border p-6 mb-6 flex items-start gap-4 ${cfg.color}`}>
            <Icon size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">{cfg.label}</p>
              <p className="text-sm opacity-80 mt-1">
                Dikumpulkan: {new Date(existing.submitted_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Judul Proyek</h3>
              <p className="font-semibold text-[#1f2937]">{existing.title}</p>
            </div>
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deskripsi</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{existing.description}</p>
            </div>
            {existing.artifact_url && (
              <div>
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Link Deploy</h3>
                <a href={existing.artifact_url} target="_blank" rel="noopener noreferrer"
                  className="text-emerald-600 text-sm hover:underline flex items-center gap-1">
                  <ExternalLink size={13} /> {existing.artifact_url}
                </a>
              </div>
            )}
            {existing.github_url && (
              <div>
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">GitHub</h3>
                <a href={existing.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-emerald-600 text-sm hover:underline flex items-center gap-1">
                  <Github size={13} /> {existing.github_url}
                </a>
              </div>
            )}

            {/* AI Feedback */}
            {existing.ai_feedback && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                  🤖 Penilaian AI {existing.ai_score !== null && `— ${existing.ai_score}/100`}
                </h3>
                <p className="text-sm text-blue-700 whitespace-pre-wrap">{existing.ai_feedback}</p>
              </div>
            )}

            {/* Instructor Feedback */}
            {existing.instructor_feedback && (
              <div className={`rounded-xl p-4 border ${
                existing.status === "approved" ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
              }`}>
                <h3 className={`text-sm font-bold mb-1 ${
                  existing.status === "approved" ? "text-emerald-800" : "text-orange-800"
                }`}>
                  👩‍🏫 Feedback Instruktur
                  {existing.instructor_score !== null && ` — ${existing.instructor_score}/100`}
                </h3>
                <p className={`text-sm whitespace-pre-wrap ${
                  existing.status === "approved" ? "text-emerald-700" : "text-orange-700"
                }`}>
                  {existing.instructor_feedback}
                </p>
              </div>
            )}

            {/* Approved: link to certificate */}
            {existing.status === "approved" && (
              <div className="pt-2">
                <Link
                  href="/certificates"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 size={15} /> Lihat Sertifikatku
                </Link>
              </div>
            )}

            {/* Rejected: allow resubmission */}
            {existing.status === "rejected" && (
              <div className="pt-2">
                <button
                  onClick={handleResubmit}
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={14} /> Kirim Ulang Proyek
                </button>
              </div>
            )}

            {/* Revision requested */}
            {existing.status === "revision_requested" && (
              <div className="pt-2">
                <button
                  onClick={handleResubmit}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw size={14} /> Revisi dan Kirim Ulang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Submission form
  return (
    <div className="min-h-screen bg-[#fafaf9] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1f2937] mb-2">Kumpulkan Capstone Project</h1>
          <p className="text-gray-500 text-sm">
            Proyek akhirmu akan dinilai oleh AI terlebih dahulu, kemudian instruktur.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2 mb-6">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          Pastikan kamu sudah menyelesaikan semua modul kursus sebelum mengumpulkan capstone.
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Proyek *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Aplikasi Manajemen Inventaris Berbasis Web"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Proyek *</label>
            <p className="text-xs text-gray-400 mb-2">
              Jelaskan masalah yang diselesaikan, solusi yang dibuat, dan teknologi yang digunakan.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              placeholder="Proyek ini menyelesaikan masalah pencatatan stok manual di toko kecil dengan membuat aplikasi web sederhana menggunakan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <ExternalLink size={14} /> Link Deploy (opsional)
            </label>
            <input
              value={artifactUrl}
              onChange={(e) => setArtifactUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://inventaris-app.vercel.app"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Github size={14} /> GitHub Repository (opsional)
            </label>
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://github.com/username/repo"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (opsional)</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Tantangan yang dihadapi, hal yang dipelajari, rencana pengembangan selanjutnya..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Mengirim…</>
            ) : (
              <><Upload size={18} /> Kumpulkan Capstone</>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Setelah dikumpulkan, AI akan menilai proyekmu dalam beberapa menit.
            Instruktur kemudian akan memberikan penilaian akhir.
          </p>
        </form>
      </div>
    </div>
  );
}
