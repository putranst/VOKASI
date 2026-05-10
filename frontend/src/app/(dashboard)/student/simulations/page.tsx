"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { simulationsAPI } from "@/lib/utils";
import { Briefcase, Zap, Scale, Users, Clock, ChevronRight, Play } from "lucide-react";

const TYPE_CONFIG = {
  client_brief: {
    icon: Briefcase,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    accent: "bg-emerald-600",
    label: "Brief Klien",
    desc: "Latih kemampuan bertanya clarifying dan mengelola ekspektasi klien dengan persyaratan yang tidak jelas.",
  },
  crisis_scenario: {
    icon: Zap,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    accent: "bg-amber-600",
    label: "Skenario Krisis",
    desc: "Model AI gagal di produksi. Diagnosa, komunikasikan, dan pulihkan dari situasi krisis.",
  },
  ethics_board: {
    icon: Scale,
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    accent: "bg-violet-600",
    label: "Dewan Etik",
    desc: "Pertahankan keputusan deployment AI di hadapan panel regulator dengan argumentasi kuat.",
  },
  team_simulation: {
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    accent: "bg-blue-600",
    label: "Simulasi Tim",
    desc: "Kolaborasikan dengan persona AI untuk menyelesaikan proyek AI yang kompleks.",
  },
};

export default function SimulationsPage() {
  const { token, user } = useAuthStore();
  const [types, setTypes] = useState<Record<string, unknown>[]>([]);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`/api/simulations/types?user_id=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/simulations/history", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ]).then(([typesData, histData]) => {
      setTypes(typesData.types ?? []);
      setHistory(Array.isArray(histData) ? histData : []);
      setLoading(false);
    });
  }, [token, user?.id]);

  async function startSimulation(type: string) {
    if (!token) return;
    setStarting(type);
    try {
      const res = await fetch("/api/simulations/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ simulationType: type }),
      });
      const data = await res.json();
      if (data.sessionId) {
        window.location.href = `/student/simulations/${data.sessionId}`;
      }
    } finally {
      setStarting(null);
    }
  }

  const completed = history.filter((s) => s.status === "completed");
  const active = history.filter((s) => s.status === "active");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1f2937]">Simulasi Dunia Kerja</h1>
        <p className="text-zinc-500 mt-1">
          Latih kemampuan AI di skenario nyata: klien susah, krisis teknis, dewan etik, dan kolaborasi tim.
        </p>
      </div>

      {/* Active sessions */}
      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1f2937] mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sesi Aktif
          </h2>
          <div className="space-y-2">
            {active.map((s) => (
              <a
                key={s.id as string}
                href={`/student/simulations/${s.id as string}`}
                className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 hover:border-amber-400 transition-colors"
              >
                <div>
                  <p className="font-semibold text-[#1f2937]">{s.title as string}</p>
                  <p className="text-sm text-zinc-500">
                    Turn {s.current_turn as number}/{s.max_turns as number} • Lanjutkan simulasi
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Simulation types */}
      <section>
        <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Pilih Simulasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((t) => {
            const key = t.type as string;
            const cfg = TYPE_CONFIG[key as keyof typeof TYPE_CONFIG];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <div
                key={key}
                className={`rounded-xl border p-5 ${cfg.bg} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${cfg.accent} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1f2937]">{cfg.label as string}</h3>
                    <p className="text-sm text-zinc-500">{t.estimatedMinutes as number} menit</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 mb-4">{cfg.desc}</p>
                <button
                  onClick={() => startSimulation(key)}
                  disabled={starting === key}
                  className={`w-full py-2 rounded-lg font-medium text-white transition-colors
                    ${starting === key ? "bg-zinc-400 cursor-not-allowed" : `${cfg.accent} hover:opacity-90`}`}
                >
                  {starting === key ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                      Memulai...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Mulai Simulasi
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* History */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Riwayat Simulasi</h2>
          <div className="space-y-2">
            {completed.slice(0, 10).map((s) => {
              const cfg = TYPE_CONFIG[s.simulation_type as keyof typeof TYPE_CONFIG];
              const Icon = cfg?.icon ?? Briefcase;
              const eval_ = s.final_evaluation as Record<string, unknown> | null;
              return (
                <div
                  key={s.id as string}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${cfg?.color ?? "text-zinc-500"}`} />
                    <div>
                      <p className="font-medium text-[#1f2937]">{s.title as string}</p>
                      <p className="text-sm text-zinc-500">
                        {s.completed_at
                          ? new Date(s.completed_at as string).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                        {eval_?.badge_awarded && (
                          <span className="ml-2 text-emerald-600 font-medium">
                            🏅 {eval_.badge_awarded as string}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/student/simulations/${s.id as string}`}
                    className="text-sm text-[#064e3b] font-medium hover:underline"
                  >
                    Lihat
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
