"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, BookOpen, Sparkles, Save } from "lucide-react";

export default function CirclePreparePage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  const { token, user } = useAuthStore();

  const [circle, setCircle] = useState<Record<string, unknown> | null>(null);
  const [prepTopic, setPrepTopic] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !circleId) return;
    fetch(`/api/circles/${circleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCircle(data);
        const participants = (data.participants as Record<string, unknown>[] | null) ?? [];
        const me = participants.find((p) => p.user_id === user?.id);
        if (me) {
          setPrepTopic((me.preparation_topic as string) ?? "");
          setPrepNotes((me.preparation_notes as string) ?? "");
          setIsAnonymous((me.is_anonymous as boolean) ?? true);
        }
        setLoading(false);
      });
  }, [token, circleId, user?.id]);

  async function handleSave() {
    if (!token || !prepTopic.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          preparationTopic: prepTopic,
          preparationNotes: prepNotes,
          attendanceStatus: "present",
          isAnonymous,
        }),
      });
      if (res.ok) {
        router.push(`/student/socratic-circles/${circleId}`);
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-zinc-100">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1f2937]">Persiapkan Penjelasan</h1>
          <p className="text-sm text-zinc-500">Socratic Circle — {circle?.topic as string}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#064e3b] bg-emerald-50/50 p-5 space-y-5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-[#064e3b] mt-0.5" />
          <div>
            <h2 className="font-semibold text-[#064e3b]">Topik</h2>
            <p className="text-sm text-zinc-600 mt-1">
              Jelaskan <strong>"{circle?.topic as string}"</strong> dalam 5 menit.
              Teman-temanmu akan bertanya setelahnya.
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 block mb-2">
            Judul / konsep yang kamu jelaskan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={prepTopic}
            onChange={(e) => setPrepTopic(e.target.value)}
            placeholder="Contoh: 'Apa itu vector database dan kenapa penting di AI?'"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 block mb-2">
            Catatan persiapan (privat — tidak terlihat peserta lain)
          </label>
          <Textarea
            value={prepNotes}
            onChange={(e) => setPrepNotes(e.target.value)}
            placeholder="Poin-poin utama yang ingin kamu sampaikan:

1. Definisi singkat vector database
2. Kenapa AI butuh cara baru untuk mencari (similarity search)
3. Contoh penggunaan nyata
4. Demo / studi kasus singkat

💡 Tips: Gunakan analogi sehari-hari agar mudah dipahami!"
            rows={12}
            className="text-sm font-mono"
          />
          <p className="text-xs text-zinc-400 mt-1">
            Target: ~600 kata = ~5 menit penjelasan lisan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anon-prep"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-zinc-300"
          />
          <label htmlFor="anon-prep" className="text-sm text-zinc-600">
            Tampilkan nama saya secara anonim saat circle berlangsung
          </label>
        </div>

        <Button
          onClick={handleSave}
          disabled={!prepTopic.trim() || submitting}
          className="w-full bg-[#064e3b] hover:opacity-90 text-base py-6"
        >
          {submitting
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : <Save className="w-4 h-4 mr-2" />}
          {prepNotes ? "Simpan & Lanjut ke Circle" : "Simpan & Lanjut"}
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
        <p><strong>💡 Tips penjelasan yang baik:</strong></p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Mulai dengan definisi sederhana, lalu percepat ke hal yang lebih kompleks</li>
          <li>Gunakan analogi atau contoh nyata yang relatable</li>
          <li>Akhiri dengan satu "takeaway" yang diingat peserta</li>
        </ul>
      </div>
    </div>
  );
}
