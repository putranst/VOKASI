"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PhoneOff,
  Sparkles,
  Brain,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  X,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import { ChatWindow, Message } from "@/components/classroom/ChatWindow";
import { InputBar } from "@/components/classroom/InputBar";
import { MemoryBadge, MemoryFact } from "@/components/classroom/MemoryBadge";
import { AgentType } from "@/components/classroom/AgentBubble";
import {
  ClassroomWebSocket,
  ServerMessage,
  ConnectionState,
  AgentMessage,
  ConfusionDetected,
  MemoryUpdated,
} from "@/lib/websocket";
import { cendikiaApi, Session, Course } from "@/lib/cendikia-api";
import { useAuth } from "@/lib/AuthContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string; sessionId: string }>;
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

let _msgIdCounter = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++_msgIdCounter}`;
}

// ─── Typing Agent State ───────────────────────────────────────────────────────

interface TypingAgent {
  agent: AgentType;
  agentName?: string;
}

// ─── Connection Status Bar ────────────────────────────────────────────────────

function ConnectionBar({
  state,
  onReconnect,
}: {
  state: ConnectionState;
  onReconnect: () => void;
}) {
  if (state === "connected") return null;

  const config: Record<
    Exclude<ConnectionState, "connected">,
    { text: string; bg: string; showRetry: boolean }
  > = {
    idle: {
      text: "Menghubungkan ke AI Classroom...",
      bg: "bg-yellow-900/80",
      showRetry: false,
    },
    connecting: {
      text: "Menghubungkan ke AI Classroom...",
      bg: "bg-yellow-900/80",
      showRetry: false,
    },
    disconnected: {
      text: "Koneksi terputus. Mencoba menghubungkan kembali...",
      bg: "bg-orange-900/80",
      showRetry: true,
    },
    error: {
      text: "Gagal terhubung ke AI Classroom.",
      bg: "bg-red-900/80",
      showRetry: true,
    },
  };

  const c = config[state];

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm text-white ${c.bg}`}
    >
      <div className="flex items-center gap-2">
        {(state === "connecting" || state === "idle") && (
          <Loader2 size={14} className="animate-spin" />
        )}
        {state === "disconnected" && (
          <RefreshCw size={14} className="animate-spin" />
        )}
        {state === "error" && <AlertCircle size={14} />}
        <span className="font-medium">{c.text}</span>
      </div>
      {c.showRetry && (
        <button
          onClick={onReconnect}
          className="text-xs font-bold underline underline-offset-2 hover:no-underline ml-4"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

// ─── Session Ended Overlay ────────────────────────────────────────────────────

function SessionEndedOverlay({
  courseId,
  onStartNew,
}: {
  courseId: string;
  onStartNew: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Sparkles className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">
          Sesi Berakhir!
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          AI Tutor sudah menyimpan progres sesi ini ke dalam memorinya. Lanjutkan
          belajar kapan saja — Tutor akan ingat di mana kamu berhenti.
        </p>
        <div className="space-y-3">
          <button
            onClick={onStartNew}
            className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-gray-900 font-black py-3 rounded-xl transition-all shadow-lg"
          >
            <Sparkles size={18} />
            Mulai Sesi Baru
          </button>
          <Link
            href={`/courses/${courseId}`}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
          >
            <BookOpen size={18} />
            Kembali ke Kursus
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Info Tooltip ─────────────────────────────────────────────────────────────

function AgentLegend({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-white text-sm">Siapa yang ada di kelas?</p>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {[
          {
            avatar: "T",
            bg: "bg-blue-500",
            label: "Tutor",
            desc: "Mengajar & membimbing — menjawab pertanyaan dengan metode Sokrates",
          },
          {
            avatar: "D",
            bg: "bg-green-500",
            label: "Dika / Sari",
            desc: "Teman sekelas AI — bertanya dan berdiskusi layaknya mahasiswa biasa",
          },
          {
            avatar: "TA",
            bg: "bg-purple-500",
            label: "TA (Teaching Assistant)",
            desc: "Dipanggil saat kamu bingung — memberikan penjelasan lebih terstruktur",
          },
        ].map((a) => (
          <div key={a.label} className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full ${a.bg} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
            >
              {a.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{a.label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIClassroomPage({ params }: Props) {
  const { id: courseId, sessionId } = React.use(params);
  const router = useRouter();
  const { session, user, loading: authLoading } = useAuth();
  const token = session?.access_token;
  const canAccess = Boolean(token || user);

  // ── Session & course metadata ─────────────────────────────────────────────

  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  // ── Chat state ────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingAgent, setTypingAgent] = useState<TypingAgent | null>(null);
  const [taActivated, setTaActivated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // ── Memory state ──────────────────────────────────────────────────────────

  const [memoryCount, setMemoryCount] = useState(0);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);

  // ── WebSocket state ───────────────────────────────────────────────────────

  const [connState, setConnState] = useState<ConnectionState>("idle");
  const wsRef = useRef<ClassroomWebSocket | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────

  const [showLegend, setShowLegend] = useState(false);
  const legendRef = useRef<HTMLDivElement>(null);

  // ── Streaming accumulator ─────────────────────────────────────────────────
  // Maps message_id → accumulated text for in-progress streamed messages
  const streamAccRef = useRef<Map<string, { agent: AgentType; agentName?: string; text: string }>>(
    new Map()
  );

  // ─── Fetch session & course metadata ─────────────────────────────────────

  useEffect(() => {
    if (!canAccess) return;

    let cancelled = false;
    setMetaLoading(true);
    setMetaError(null);

    (async () => {
      try {
        const crs = await cendikiaApi.getCourse(courseId, token);
        if (cancelled) return;
        setCourse(crs);

        try {
          const sess = await cendikiaApi.getSession(sessionId, token);
          if (cancelled) return;
          setSessionData(sess);
          if (sess.status === "ended") setSessionEnded(true);
        } catch (sessionErr: unknown) {
          const err = sessionErr as { status?: number; message?: string };
          const message = (err?.message ?? "").toLowerCase();
          const shouldRecover =
            err?.status === 404 ||
            err?.status === 500 ||
            message.includes("session not found") ||
            message.includes("session data is invalid");

          if (!shouldRecover) {
            throw sessionErr;
          }

          const fallbackModuleId =
            crs.modules.find((m) => !m.locked)?.id ??
            crs.modules[0]?.id;

          if (!fallbackModuleId) {
            throw new Error("Tidak ada modul yang bisa diakses untuk membuat sesi baru.");
          }

          const newSession = await cendikiaApi.createSession(
            courseId,
            fallbackModuleId,
            token
          );

          if (cancelled) return;
          router.replace(`/courses/${courseId}/classroom/${newSession.id}`);
          return;
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const apiErr = err as { message?: string };
        setMetaError(apiErr?.message ?? "Gagal memuat sesi.");
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, courseId, token, canAccess, router]);

  // ─── Message handler ──────────────────────────────────────────────────────

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "agent_message": {
        const am = msg as AgentMessage;
        const agent = am.agent as AgentType;
        const msgId = am.message_id ?? nextId();

        if (am.streaming) {
          // Accumulate streamed tokens
          const existing = streamAccRef.current.get(msgId);
          if (existing) {
            const updated = { ...existing, text: existing.text + am.text };
            streamAccRef.current.set(msgId, updated);
            // Update the existing message in state
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, text: updated.text } : m
              )
            );
          } else {
            // First chunk — create the message
            streamAccRef.current.set(msgId, {
              agent,
              agentName: am.agent_name,
              text: am.text,
            });
            const newMsg: Message = {
              id: msgId,
              agent,
              agentName: am.agent_name,
              text: am.text,
              timestamp: new Date(),
              isStreaming: true,
            };
            setMessages((prev) => [...prev, newMsg]);
            setTypingAgent(null);
          }
        } else {
          // Non-streaming (complete message in one frame)
          streamAccRef.current.delete(msgId);
          const completeMsg: Message = {
            id: msgId,
            agent,
            agentName: am.agent_name,
            text: am.text,
            timestamp: new Date(),
            isStreaming: false,
          };
          setMessages((prev) => {
            // Replace if the id already exists (final frame of a streamed msg)
            const exists = prev.find((m) => m.id === msgId);
            if (exists) {
              return prev.map((m) =>
                m.id === msgId ? { ...completeMsg, isStreaming: false } : m
              );
            }
            return [...prev, completeMsg];
          });
          setTypingAgent(null);
        }
        setIsSending(false);
        break;
      }

      case "turn_complete": {
        // Mark the message as no longer streaming
        const { message_id } = msg as { type: "turn_complete"; agent: AgentType; message_id: string };
        streamAccRef.current.delete(message_id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message_id ? { ...m, isStreaming: false } : m
          )
        );
        setTypingAgent(null);
        break;
      }

      case "confusion_detected": {
        const cd = msg as ConfusionDetected;
        if (cd.ta_activated) {
          setTaActivated(true);
          setTypingAgent({ agent: "ta" });
          // Auto-hide the TA activated notice after a while
          setTimeout(() => setTaActivated(false), 8000);
        }
        break;
      }

      case "memory_updated": {
        const mu = msg as MemoryUpdated;
        setMemoryCount(mu.memory_count);
        // Append new facts to our local list
        setMemoryFacts((prev) => {
          const newFacts: MemoryFact[] = mu.new_facts.map((text) => ({
            text,
            recorded_at: new Date().toISOString(),
            category: "lainnya" as const,
          }));
          return [...prev, ...newFacts];
        });
        break;
      }

      case "session_ended": {
        setSessionEnded(true);
        setTypingAgent(null);
        setIsSending(false);
        break;
      }

      case "error": {
        const errMsg: Message = {
          id: nextId(),
          agent: "ta",
          text: `⚠️ ${(msg as { type: "error"; message: string }).message}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setTypingAgent(null);
        setIsSending(false);
        break;
      }
    }
  }, []);

  // ─── WebSocket lifecycle ──────────────────────────────────────────────────

  const connectWS = useCallback(() => {
    if (!canAccess || sessionEnded) return;

    // Tear down previous instance
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    const ws = new ClassroomWebSocket(sessionId, token ?? "", {
      debug: process.env.NODE_ENV === "development",
    });

    ws.connect(
      handleServerMessage,
      () => {
        setConnState("connected");
        // Show a welcome message on first connect
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: nextId(),
              agent: "teacher" as AgentType,
              text: "Selamat datang di AI Classroom! 👋 Saya sudah membaca materinya dan siap berdiskusi. Ada yang ingin kamu tanyakan atau diskusikan seputar modul ini?",
              timestamp: new Date(),
            },
          ];
        });
      },
      (code, reason) => {
        setConnState(code === 1000 ? "disconnected" : "disconnected");
        console.log("[Classroom] WS closed", code, reason);
      },
      () => {
        setConnState("error");
      },
      (state) => {
        setConnState(state);
      }
    );

    wsRef.current = ws;
  }, [sessionId, token, canAccess, sessionEnded, handleServerMessage]);

  // Connect on mount
  useEffect(() => {
    if (!canAccess || metaLoading) return;
    if (sessionEnded) return;
    connectWS();
    return () => {
      wsRef.current?.disconnect();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess, metaLoading, sessionEnded]);

  // ─── Send Message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(
    (text: string) => {
      if (!wsRef.current?.isConnected() || isSending || sessionEnded) return;

      // Append student message immediately (optimistic)
      const studentMsg: Message = {
        id: nextId(),
        agent: "student",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, studentMsg]);
      setIsSending(true);
      setTaActivated(false);

      // Show typing indicator for teacher by default
      setTypingAgent({ agent: "teacher" });

      wsRef.current.sendMessage(text);
    },
    [isSending, sessionEnded]
  );

  // ─── End Session ──────────────────────────────────────────────────────────

  const handleEndSession = useCallback(async () => {
    if (isEndingSession || sessionEnded) return;
    setIsEndingSession(true);

    // Try WebSocket graceful end first
    if (wsRef.current?.isConnected()) {
      wsRef.current.endSession();
    }

    // Also call REST API as fallback
    try {
      if (token) await cendikiaApi.endSession(sessionId, token);
    } catch {
      // Ignore — WS close will handle state
    }

    // Disconnect socket
    wsRef.current?.disconnect();
    wsRef.current = null;
    setSessionEnded(true);
    setIsEndingSession(false);
  }, [isEndingSession, sessionEnded, sessionId, token]);

  // ─── Start New Session ────────────────────────────────────────────────────

  const handleStartNewSession = useCallback(async () => {
    if (!canAccess || !sessionData) return;
    try {
      const newSession = await cendikiaApi.createSession(
        sessionData.course_id,
        sessionData.module_id,
        token
      );
      router.push(`/courses/${courseId}/classroom/${newSession.id}`);
    } catch (err) {
      console.error("Failed to start new session:", err);
    }
  }, [token, canAccess, sessionData, courseId, router]);

  const handleRecoverSession = useCallback(async () => {
    if (!canAccess || !course) return;

    const fallbackModuleId =
      course.modules.find((m) => !m.locked)?.id ??
      course.modules[0]?.id;

    if (!fallbackModuleId) {
      setMetaError("Tidak ada modul yang bisa diakses untuk membuat sesi baru.");
      return;
    }

    setMetaLoading(true);
    setMetaError(null);
    try {
      const newSession = await cendikiaApi.createSession(courseId, fallbackModuleId, token);
      router.replace(`/courses/${courseId}/classroom/${newSession.id}`);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setMetaError(apiErr?.message ?? "Gagal membuat sesi baru.");
    } finally {
      setMetaLoading(false);
    }
  }, [canAccess, course, courseId, token, router]);

  // ─── Close legend on outside click ───────────────────────────────────────

  useEffect(() => {
    if (!showLegend) return;
    const handle = (e: MouseEvent) => {
      if (legendRef.current && !legendRef.current.contains(e.target as Node)) {
        setShowLegend(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showLegend]);

  // ─── Derived state ────────────────────────────────────────────────────────

  const moduleTitle = useMemo(() => {
    if (!sessionData || !course) return null;
    return course.modules.find((m) => m.id === sessionData.module_id)?.title ?? null;
  }, [sessionData, course]);

  const isInputDisabled =
    !wsRef.current?.isConnected() || isSending || sessionEnded;

  // ─── Auth guard ───────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Brain className="text-white" size={28} />
          </div>
          <p className="text-white font-bold text-lg mb-2">Memeriksa status akses...</p>
          <p className="text-gray-400 text-sm">Sebentar ya</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-cyan-400" size={28} />
          </div>
          <h2 className="text-xl font-black text-white mb-3">
            Masuk untuk mengakses AI Classroom
          </h2>
          <Link
            href={`/login?redirect=/courses/${courseId}/classroom/${sessionId}`}
            className="inline-flex items-center gap-2 bg-cyan-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-colors"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Brain className="text-white" size={28} />
          </div>
          <p className="text-white font-bold text-lg mb-2">
            Mempersiapkan AI Classroom...
          </p>
          <p className="text-gray-400 text-sm">Tutor sedang membaca materinya</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────

  if (metaError) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={28} />
          </div>
          <h2 className="text-xl font-black text-white mb-3">Gagal Memuat Sesi</h2>
          <p className="text-gray-400 text-sm mb-6">{metaError}</p>
          <div className="flex items-center justify-center gap-3">
            {course && (
              <button
                onClick={() => {
                  void handleRecoverSession();
                }}
                className="inline-flex items-center gap-2 bg-cyan-400 text-gray-900 px-5 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-colors"
              >
                <RefreshCw size={16} />
                Buat Sesi Baru
              </button>
            )}
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20"
            >
              <ArrowLeft size={16} />
              Kembali ke Kursus
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#0a1628] flex flex-col overflow-hidden relative">

      {/* ── Session Ended Overlay ─────────────────────────────────────────── */}
      {sessionEnded && (
        <SessionEndedOverlay
          courseId={courseId}
          onStartNew={handleStartNewSession}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-[#0f1f3d] border-b border-white/10 px-4 py-3 z-30">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">

          {/* Back button */}
          <Link
            href={
              sessionData
                ? `/courses/${courseId}/learn/${sessionData.module_id}`
                : `/courses/${courseId}`
            }
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Kembali ke modul"
          >
            <ArrowLeft size={18} />
          </Link>

          {/* Session info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                AI Classroom
              </span>
              {course && (
                <>
                  <ChevronRight size={12} className="text-gray-600 flex-shrink-0" />
                  <span className="text-xs text-gray-500 truncate">
                    {course.title}
                  </span>
                </>
              )}
            </div>
            {moduleTitle && (
              <p className="text-sm font-bold text-white truncate">
                {moduleTitle}
              </p>
            )}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Memory badge */}
            <MemoryBadge
              memoryCount={memoryCount}
              facts={memoryFacts}
              className="hidden sm:inline-flex"
            />

            {/* Info legend button */}
            <div className="relative" ref={legendRef}>
              <button
                onClick={() => setShowLegend((v) => !v)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Informasi agen"
                aria-expanded={showLegend}
              >
                <Info size={16} />
              </button>
              {showLegend && (
                <AgentLegend onClose={() => setShowLegend(false)} />
              )}
            </div>

            {/* End session */}
            <button
              onClick={handleEndSession}
              disabled={isEndingSession || sessionEnded}
              className="
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors
              "
              aria-label="Akhiri sesi"
            >
              {isEndingSession ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <PhoneOff size={14} />
              )}
              <span className="hidden sm:inline">Akhiri Sesi</span>
            </button>
          </div>
        </div>

        {/* Mobile memory badge */}
        <div className="sm:hidden mt-2 flex justify-center">
          <MemoryBadge
            memoryCount={memoryCount}
            facts={memoryFacts}
          />
        </div>
      </header>

      {/* ── Connection Status Bar ─────────────────────────────────────────── */}
      <ConnectionBar state={connState} onReconnect={connectWS} />

      {/* ── Confusion / TA notice ─────────────────────────────────────────── */}
      {taActivated && !sessionEnded && (
        <div className="flex-shrink-0 flex justify-center px-4 pt-2 z-20">
          <div className="flex items-center gap-2 bg-purple-900/60 border border-purple-400/30 text-purple-200 text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <span>🔍</span>
            <span>TA dipanggil untuk membantu kamu</span>
            <button
              onClick={() => setTaActivated(false)}
              className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Tutup notifikasi"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        {/* Gradient fade at top of chat */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#0a1628] to-transparent z-10 pointer-events-none" />

        <ChatWindow
          messages={messages}
          typingAgent={typingAgent ?? undefined}
          taActivated={false /* managed via banner above */}
          className="h-full bg-[#0a1628] [&>*]:max-w-4xl [&>*]:mx-auto [&>*]:w-full"
        />
      </div>

      {/* ── Agent quick-select chips ──────────────────────────────────────── */}
      {!sessionEnded && messages.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-1 pt-0.5">
          <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
              Tanya cepat:
            </span>
            {[
              "Bisa jelaskan ulang?",
              "Beri saya contoh nyata",
              "Saya masih bingung",
              "@TA tolong bantu",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isInputDisabled}
                className="
                  flex-shrink-0 text-xs bg-white/5 hover:bg-white/10
                  border border-white/10 hover:border-white/20
                  text-gray-300 hover:text-white
                  px-3 py-1.5 rounded-full transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ─────────────────────────────────────────────────────── */}
      {!sessionEnded && (
        <div className="flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <InputBar
              onSend={handleSend}
              disabled={isInputDisabled}
              isSending={isSending}
              placeholder="Ketik pertanyaan atau topikmu... (Enter untuk kirim)"
            />
          </div>
        </div>
      )}

      {/* Session ended footer */}
      {sessionEnded && !metaLoading && (
        <div className="flex-shrink-0 bg-[#0f1f3d] border-t border-white/10 px-4 py-4 text-center">
          <p className="text-gray-400 text-sm">
            Sesi ini telah berakhir.{" "}
            <button
              onClick={handleStartNewSession}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2"
            >
              Mulai sesi baru
            </button>{" "}
            atau{" "}
            <Link
              href={`/courses/${courseId}`}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2"
            >
              kembali ke kursus
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
