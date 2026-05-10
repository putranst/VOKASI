"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { Users, Clock, BookOpen, ChevronRight, Play, CheckCircle2 } from "lucide-react";

const DOMAIN_LABELS: Record<string, string> = {
  "Prompt Engineering": "Prompt Engineering",
  "Model Evaluation": "Model Evaluation",
  "AI Ethics": "AI Ethics",
  "Data Analysis": "Data Analysis",
  "Automation": "Automation",
};

export default function SocraticCirclesPage() {
  const { token, user } = useAuthStore();
  const [circles, setCircles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/circles?status=forming", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setCircles(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [token]);

  async function joinCircle(circleId: string) {
    if (!token) return;
    setJoining(true);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ circleId }),
      });
      const data = await res.json();
      if (res.ok && data.circleId) {
        window.location.href = `/student/socratic-circles/${data.circleId}`;
      }
    } finally {
      setJoining(false);
    }
  }

  async function findOrCreateCircle() {
    if (!token || !selectedTopic.trim()) return;
    setJoining(true);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: selectedTopic, topicDomains: [] }),
      });
      const data = await res.json();
      if (res.ok && data.circleId) {
        window.location.href = `/student/socratic-circles/${data.circleId}`;
      }
    } finally {
      setJoining(false);
    }
  }

  const myCircles = circles.filter((c) => (c as Record<string, unknown>).my_role !== null);
  const availableCircles = circles.filter((c) => (c as Record<string, unknown>).my_role === null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1f2937]">Socratic Circles</h1>
        <p className="text-zinc-500 mt-1">
          Belajar dari teman sebaya melalui penjelasan 5 menit dan tanya jawab terstruktur.
          Anonymous by default — feel safe to participate.
        </p>
      </div>

      {/* My circles */}
      {myCircles.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Circle Saya
          </h2>
          <div className="space-y-2">
            {myCircles.map((c) => (
              <a
                key={c.id as string}
                href={`/student/socratic-circles/${c.id as string}`}
                className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:border-emerald-400 transition-colors"
              >
                <div>
                  <p className="font-semibold text-[#1f2937]">{c.topic as string}</p>
                  <p className="text-sm text-zinc-500">
                    {c.participant_count as number}/{(c as Record<string, unknown>).max_participants as number} peserta ·{" "}
                    {(c as Record<string, unknown>).status as string}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-600" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Available circles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1f2937]">Circle Tersedia</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded-lg bg-[#064e3b] text-white text-sm font-medium hover:opacity-90 transition-colors"
          >
            {showCreate ? "Batal" : "+ Buat Circle Baru"}
          </button>
        </div>

        {showCreate && (
          <div className="rounded-xl border border-[#064e3b] bg-white p-4 mb-4 space-y-3">
            <p className="text-sm font-medium text-[#1f2937]">
              Buat circle baru atau cari yang匹配 berdasarkan topik
            </p>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder="Topik yang ingin kamu diskusikan... (contoh: 'Prompt Engineering', 'AI Ethics')"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
            />
            <button
              onClick={findOrCreateCircle}
              disabled={!selectedTopic.trim() || joining}
              className="px-4 py-2 rounded-lg bg-[#064e3b] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {joining ? "Mencari..." : "Cari / Buat Circle"}
            </button>
          </div>
        )}

        {availableCircles.length === 0 && !showCreate && (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-300 rounded-xl">
            <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p>Tidak ada circle tersedia saat ini.</p>
            <p className="text-sm">Buat circle baru untuk mulai belajar bareng!</p>
          </div>
        )}

        <div className="space-y-2">
          {availableCircles.map((c) => (
            <div
              key={c.id as string}
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
            >
              <div>
                <p className="font-semibold text-[#1f2937]">{c.topic as string}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                    {c.participant_count as number}/{(c as Record<string, unknown>).max_participants as number} peserta
                  </span>
                  {(c as Record<string, unknown>).topic_domain && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                      {(c as Record<string, unknown>).topic_domain as string[]}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => joinCircle(c.id as string)}
                disabled={joining}
                className="px-4 py-2 rounded-lg bg-[#064e3b] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Ikut
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="font-semibold text-[#1f2937] mb-3">Cara Kerja Socratic Circles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-600">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
            <p>3-4 siswa matched berdasarkan skill gap yang saling melengkapi</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
            <p>Setiap siswa prepare 5 menit penjelasan tentang satu konsep, teman bertanya</p>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
            <p>AI evaluasi kejelasan penjelasan dan kualitas pertanyaan — anonymous!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
