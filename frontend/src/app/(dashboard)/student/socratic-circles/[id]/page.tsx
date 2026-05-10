"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Clock, BookOpen, CheckCircle2, MessageCircle,
  ChevronLeft, Loader2, AlertCircle, Sparkles
} from "lucide-react";

export default function CircleSessionPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  const { token, user } = useAuthStore();

  const [circle, setCircle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prepTopic, setPrepTopic] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !circleId) return;
    fetch(`/api/circles/${circleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCircle(data);
        // Pre-fill if already prepared
        const participants = (data.participants as Record<string, unknown>[] | null) ?? [];
        const me = participants.find((p) => p.user_id === user?.id);
        if (me) {
          setPrepTopic((me.preparation_topic as string) ?? "");
          setPrepNotes((me.preparation_notes as string) ?? "");
          setAttendanceStatus((me.attendance_status as string) ?? "pending");
          setIsAnonymous((me.is_anonymous as boolean) ?? true);
        }
        setLoading(false);
      });
  }, [token, circleId, user?.id]);

  async function submitPrepare() {
    if (!token || !prepTopic.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          preparationTopic: prepTopic,
          preparationNotes: prepNotes,
          attendanceStatus,
          isAnonymous,
        }),
      });
      if (res.ok) {
        setCircle((prev) => prev ? { ...prev, status: "active" } : prev);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function markComplete() {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.refresh();
        window.location.reload();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <AlertCircle className="w-6 h-6 mr-2" /> Circle tidak ditemukan
      </div>
    );
  }

  const participants = (circle.participants as Record<string, unknown>[] | null) ?? [];
  const me = participants.find((p) => p.user_id === user?.id);
  const myRole = (me?.role as string) ?? null;
  const status = circle.status as string;
  const isExplainer = myRole === "explainer";
  const isQuestioner = myRole === "questioner";

  // Determine section to show
  let section: "prepare" | "active" | "completed" | "waiting" = "waiting";
  if (status === "forming") section = "prepare";
  else if (status === "active") section = "active";
  else if (status === "completed") section = "completed";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-zinc-100">
          <ChevronLeft className="w-5 h-5 text-zinc-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1f2937]">{circle.topic as string}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status === "completed" ? "default" : "secondary"} className="text-xs">
              {status === "forming" ? "Persiapan" : status === "active" ? "Aktif" : "Selesai"}
            </Badge>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3" /> {participants.length}/{circle.max_participants as number} peserta
            </span>
          </div>
        </div>
      </div>

      {/* Status badge row */}
      <div className="grid grid-cols-3 gap-3">
        {["forming", "active", "completed"].map((s) => (
          <div key={s} className={`rounded-xl p-3 text-center border ${circle.status === s ? "border-[#064e3b] bg-[#064e3b]/5" : "border-zinc-200 bg-zinc-50"}`}>
            <p className="text-xs font-medium" style={{ color: circle.status === s ? "#064e3b" : "#94a3b8" }}>
              {s === "forming" ? "Persiapan" : s === "active" ? "Aktif" : "Selesai"}
            </p>
          </div>
        ))}
      </div>

      {/* ─── PREPARATION PHASE ─── */}
      {section === "prepare" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#064e3b] bg-emerald-50/50 p-5">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-[#064e3b] mt-0.5" />
              <div>
                <h2 className="font-semibold text-[#064e3b]">Persiapkan Penjelasanmu</h2>
                <p className="text-sm text-zinc-600 mt-1">
                  Jelaskan konsep "{circle.topic as string}" dalam 5 menit. Temanmu akan bertanya setelahnya.
                </p>
              </div>
            </div>

            {isExplainer ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">Topik yang akan kamu jelaskan</label>
                  <input
                    type="text"
                    value={prepTopic}
                    onChange={(e) => setPrepTopic(e.target.value)}
                    placeholder="Judul / konsep yang kamu kuasai..."
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Catatan persiapan (internal, tidak terlihat teman)
                  </label>
                  <Textarea
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    placeholder="Poin-poin utama, contoh, analogi yang akan kamu gunakan..."
                    rows={6}
                    className="text-sm"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Target: ~600 kata / 5 menit penjelasan lisan</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anon" className="text-sm text-zinc-600">Tampilkan nama saya secara anonim</label>
                </div>
                <Button
                  onClick={submitPrepare}
                  disabled={!prepTopic.trim() || submitting}
                  className="w-full bg-[#064e3b] hover:opacity-90"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {prepNotes ? "Simpan & Siap" : "Simpan Persiapan"}
                </Button>
              </div>
            ) : isQuestioner ? (
              <div>
                <p className="text-sm text-zinc-600 mb-3">
                  Kamu adalah <strong>penanya</strong>. Persiapkan 2-3 pertanyaan yang ingin kamu ajukan.
                </p>
                <Textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  placeholder="Pertanyaan-pertanyaan yang akan saya tanyakan..."
                  rows={4}
                  className="text-sm mb-3"
                />
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="anon2"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anon2" className="text-sm text-zinc-600">Tampilkan nama saya secara anonim</label>
                </div>
                <Button
                  onClick={submitPrepare}
                  disabled={submitting}
                  className="w-full bg-[#064e3b] hover:opacity-90"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {prepNotes ? "Simpan & Siap Bertanya" : "Simpan"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Menunggu penjelasan dari explainer...</p>
            )}
          </div>
        </div>
      )}

      {/* ─── ACTIVE PHASE ─── */}
      {section === "active" && (
        <div className="space-y-5">
          {/* Participants */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#064e3b]" /> Peserta Circle
            </h2>
            <div className="space-y-3">
              {participants.map((p) => (
                <div key={p.id as string} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.role === "explainer" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                    }`}>
                      {(p.is_anonymous ? "Anonim" : (p.user_id as string)?.slice(0, 4) ?? "???")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1f2937]">
                        {p.role === "explainer" ? "Explainer" : "Penanya"}
                        {p.user_id === user?.id ? " (Kamu)" : ""}
                      </p>
                      {p.preparation_topic && (
                        <p className="text-xs text-zinc-500">"{p.preparation_topic as string}"</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {p.attendance_status === "present" ? "✓ Hadir" :
                     p.attendance_status === "absent" ? "✗ Absen" : "○ Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* AI Evaluation preview */}
          {participants.some((p) => p.ai_explanation_score) && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Skor AI
              </h2>
              <div className="space-y-2">
                {participants.filter((p) => p.ai_explanation_score).map((p) => (
                  <div key={p.id as string} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">
                      {p.is_anonymous ? "Peserta anonim" : "Peserta"}
                    </span>
                    <span className="font-medium text-[#064e3b]">
                      Penjelasan: {p.ai_explanation_score}/10
                      {p.ai_questioning_score ? ` · Bertanya: ${p.ai_questioning_score}/10` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete circle */}
          {participants.every((p) => p.attendance_status === "present") && (
            <Button
              onClick={markComplete}
              disabled={submitting}
              className="w-full bg-[#064e3b] hover:opacity-90"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Tandai Circle Selesai
            </Button>
          )}
        </div>
      )}

      {/* ─── COMPLETED ─── */}
      {section === "completed" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-emerald-800">Circle Selesai!</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Terima kasih sudah berpartisipasi dalam Socratic Circle ini.
            </p>
          </div>

          {participants.some((p) => p.ai_explanation_score) && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold text-[#1f2937] mb-4">Skor AI Evaluation</h2>
              <div className="space-y-3">
                {participants.filter((p) => p.ai_explanation_score).map((p) => (
                  <div key={p.id as string}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600">
                        {p.is_anonymous ? "Peserta anonim" : "Peserta"} — {p.role as string}
                      </span>
                      <span className="font-medium text-[#064e3b]">{p.ai_explanation_score}/10</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2">
                      <div
                        className="bg-[#064e3b] h-2 rounded-full transition-all"
                        style={{ width: `${((p.ai_explanation_score as number) / 10) * 100}%` }}
                      />
                    </div>
                    {p.ai_questioning_score && (
                      <>
                        <div className="flex justify-between text-sm mt-2 mb-1">
                          <span className="text-zinc-500 text-xs">Kualitas Pertanyaan</span>
                          <span className="font-medium text-violet-600">{p.ai_questioning_score}/10</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2">
                          <div
                            className="bg-violet-500 h-2 rounded-full"
                            style={{ width: `${((p.ai_questioning_score as number) / 10) * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
        <p><strong>Tip:</strong> Di Socratic Circles, kamu belajar lebih dalam dengan mengajarkan ke teman.
       匿名参与 — participate anonymously if it helps you speak up!</p>
      </div>
    </div>
  );
}
