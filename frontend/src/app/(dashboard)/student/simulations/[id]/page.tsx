"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store";
import { ChevronDown, User, Bot, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Turn {
  turn: number;
  student: string;
  evaluation: {
    clarity_score: number;
    reasoning_depth_score: number;
    empathy_score: number;
    appropriateness_score: number;
  };
  persona: string;
}

export default function SimulationSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentReply, setCurrentReply] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [badgeAwarded, setBadgeAwarded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/simulations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setTurns((data.turns as Turn[]) ?? []);
        setIsComplete(data.status === "completed");
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
  }, [token, id]);

  async function submit() {
    if (!response.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    // Optimistic update
    const tempTurn: Turn = {
      turn: (session?.current_turn as number ?? 0) + 1,
      student: response,
      evaluation: { clarity_score: 0, reasoning_depth_score: 0, empathy_score: 0, appropriateness_score: 0 },
      persona: "",
    };
    setTurns((prev) => [...prev, tempTurn]);
    setResponse("");

    try {
      const res = await fetch(`/api/simulations/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentResponse: response }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim respons");
        setTurns((prev) => prev.slice(0, -1));
        return;
      }

      setCurrentReply(data.personaReply ?? data.persona_reply);
      setIsComplete(data.isComplete);
      if (data.badgeAwarded) setBadgeAwarded(data.badgeAwarded);

      // Update turns with real data
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1
            ? {
                ...t,
                evaluation: data.evaluation ?? t.evaluation,
                persona: data.personaReply ?? data.persona_reply ?? "",
              }
            : t
        )
      );
    } catch {
      setError("Terjadi kesalahan koneksi");
      setTurns((prev) => prev.slice(0, -1));
    } finally {
      setSubmitting(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-zinc-500">Simulasi tidak ditemukan.</div>
    );
  }

  const personaName = session.persona_name as string;
  const personaRole = session.persona_role as string;
  const personaCompany = session.company as string;
  const simType = session.simulation_type as string;
  const currentTurn = (session.current_turn as number) + 1;
  const maxTurns = session.max_turns as number;

  const typeColors: Record<string, string> = {
    client_brief: "bg-emerald-50 border-emerald-200",
    crisis_scenario: "bg-amber-50 border-amber-200",
    ethics_board: "bg-violet-50 border-violet-200",
    team_simulation: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className={`rounded-xl border p-4 mb-4 ${typeColors[simType] ?? "bg-zinc-50 border-zinc-200"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center">
            <Bot className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <p className="font-semibold text-[#1f2937]">{personaName}</p>
            <p className="text-sm text-zinc-500">{personaRole} · {personaCompany}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-sm text-zinc-500">
            <Clock className="w-4 h-4" />
            <span>{currentTurn}/{maxTurns}</span>
          </div>
        </div>
        <p className="text-sm text-zinc-600 italic">
          "{session.persona_background as string}"
        </p>
      </div>

      {/* Turns */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-3">
            {/* Student */}
            <div className="flex items-start gap-2 justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#064e3b] text-white px-4 py-2">
                <p className="text-sm">{turn.student}</p>
              </div>
              <User className="w-5 h-5 text-zinc-400 mt-1 flex-shrink-0" />
            </div>

            {/* Persona */}
            {turn.persona && (
              <div className="flex items-start gap-2">
                <Bot className="w-5 h-5 text-zinc-400 mt-1 flex-shrink-0" />
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-4 py-2 shadow-sm">
                  <p className="text-sm text-[#1f2937]">{turn.persona}</p>
                </div>
              </div>
            )}

            {/* Scores */}
            {turn.evaluation && turn.evaluation.clarity_score > 0 && (
              <div className="flex flex-wrap gap-1 ml-7">
                {[
                  { label: "Clarity", key: "clarity_score" as const },
                  { label: "Reasoning", key: "reasoning_depth_score" as const },
                  { label: "Empathy", key: "empathy_score" as const },
                  { label: "Fit", key: "appropriateness_score" as const },
                ].map(({ label, key }) => {
                  const val = turn.evaluation[key];
                  const color = val >= 70 ? "bg-emerald-100 text-emerald-700" : val >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
                  return (
                    <span key={key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                      {label}: {val}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Current reply */}
        {currentReply && (
          <div className="flex items-start gap-2">
            <Bot className="w-5 h-5 text-zinc-400 mt-1 flex-shrink-0" />
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-4 py-2 shadow-sm animate-pulse">
              <p className="text-sm text-[#1f2937]">{currentReply}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Completion screen */}
      {isComplete && (
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 mb-4 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-[#1f2937]">Simulasi Selesai!</h2>
          {badgeAwarded && (
            <p className="text-emerald-700 font-medium mt-1">
              🏅 Badge awarded: {badgeAwarded}
            </p>
          )}
        </div>
      )}

      {/* Input */}
      {!isComplete && (
        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm mb-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Tulis respons kamu di sini..."
              className="flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button
              onClick={submit}
              disabled={!response.trim() || submitting}
              className="px-4 py-2 rounded-lg bg-[#064e3b] text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
              ) : (
                "Kirim"
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tekan Enter untuk kirim, Shift+Enter untuk baris baru
          </p>
        </div>
      )}
    </div>
  );
}
