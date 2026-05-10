"use client";
import { useState, useEffect, use } from "react";
import { useAuthStore } from "@/store";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Trash2 } from "lucide-react";

export default function SandboxSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuthStore();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sandbox" | "mistakes">("sandbox");
  const [mistakes, setMistakes] = useState<Record<string, unknown>[]>([]);
  const [showMistakeForm, setShowMistakeForm] = useState(false);
  const [errorDesc, setErrorDesc] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/sandbox/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setMistakes((data.mistake_log as Record<string, unknown>[]) ?? []);
        setLoading(false);
      });
  }, [token, id]);

  async function logMistake() {
    if (!token || !errorDesc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sandbox/${id}/mistake-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          errorDescription: errorDesc,
          stackTrace: stackTrace,
          studentReflection: reflection,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMistakes((prev) => [...prev, data.entry as Record<string, unknown>]);
        setErrorDesc("");
        setStackTrace("");
        setReflection("");
        setShowMistakeForm(false);
      }
    } finally {
      setSubmitting(false);
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
      <div className="p-6 text-center text-zinc-500">
        Sandbox session tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
          <div>
            <h1 className="text-lg font-bold text-[#1f2937]">Sandbox Session</h1>
            <p className="text-sm text-zinc-500">
              {session.status as string} · Dibuat{" "}
              {new Date(session.created_at as string).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {session.expires_at && (
              <div className="flex items-center gap-1 text-sm text-zinc-500">
                <Clock className="w-4 h-4" />
                Expires {new Date(session.expires_at as string).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            )}
            {session.sandbox_url && (
              <a
                href={session.sandbox_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#064e3b] text-white text-sm font-medium hover:opacity-90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Sandbox
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-6">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sandbox"
                ? "border-[#064e3b] text-[#064e3b]"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Sandbox
          </button>
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === "mistakes"
                ? "border-[#064e3b] text-[#064e3b]"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Mistake Log
            {mistakes.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {mistakes.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-50 overflow-y-auto">
          {activeTab === "sandbox" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {session.sandbox_url ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-[#1f2937]">Sandbox Ready</p>
                    <a
                      href={session.sandbox_url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg bg-[#064e3b] text-white font-medium hover:opacity-90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Launch Jupyter
                    </a>
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#064e3b] mx-auto mb-3" />
                    <p className="text-lg font-semibold text-[#1f2937]">Provisioning Sandbox...</p>
                    <p className="text-sm text-zinc-500 mt-1">Container sedang disiapkan, tunggu sebentar.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "mistakes" && (
            <div className="p-6 max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#1f2937]">Mistake Log</h2>
                  <p className="text-sm text-zinc-500">
                    Dokumentasikan error yang kamu temui — termasuk what went wrong, stack trace, dan refleksi.
                  </p>
                </div>
                <button
                  onClick={() => setShowMistakeForm(!showMistakeForm)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors"
                >
                  {showMistakeForm ? "Batal" : "+ Log Error"}
                </button>
              </div>

              {showMistakeForm && (
                <div className="rounded-xl border border-rose-200 bg-white p-5 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Error Description *</label>
                    <textarea
                      value={errorDesc}
                      onChange={(e) => setErrorDesc(e.target.value)}
                      placeholder="Apa yang error? (contoh: 'Model output kosong saat prompt mengandung nama khusus')"
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Stack Trace (optional)</label>
                    <textarea
                      value={stackTrace}
                      onChange={(e) => setStackTrace(e.target.value)}
                      placeholder="Paste error stack trace di sini..."
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none bg-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Reflection — Why did this happen?</label>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Apa yang kamu pelajari dari error ini? Kenapa bisa terjadi?"
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={logMistake}
                    disabled={!errorDesc.trim() || submitting}
                    className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "Saving..." : "Save to Mistake Log"}
                  </button>
                </div>
              )}

              {mistakes.length === 0 && !showMistakeForm && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
                  <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                  <p className="text-zinc-500">Belum ada error yang logged</p>
                  <p className="text-zinc-400 text-sm mt-1">Error itu fitur, bukan bug. Mulai dokumentasikan.</p>
                </div>
              )}

              <div className="space-y-3">
                {[...mistakes].reverse().map((m, i) => (
                  <div key={m.id as string} className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span className="text-xs text-zinc-400">
                          {new Date(m.timestamp as string).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium text-[#1f2937] mb-2">{m.errorDescription as string}</p>
                    {m.stackTrace && (
                      <details className="mb-2">
                        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-700">
                          Stack Trace
                        </summary>
                        <pre className="mt-1 p-2 bg-zinc-900 text-zinc-300 text-xs rounded-lg overflow-x-auto">
                          {(m.stackTrace as string).slice(0, 500)}
                        </pre>
                      </details>
                    )}
                    {m.studentReflection && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-xs text-amber-700 font-medium mb-1">💡 Reflection</p>
                        <p className="text-sm text-amber-800">{m.studentReflection as string}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
