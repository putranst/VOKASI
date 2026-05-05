"use client";

/**
 * VOKASI Student Course Renderer
 * vokasi2.prd §5.4 — LE-001/002/003/004/005
 *
 * Route: /courses/[id]/learn/puck
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { vokasiPuckConfig } from "@/lib/puck/config";
import { CheckCircle, ChevronLeft, Clock, BookOpen, Loader2, AlertTriangle, SendHorizonal, Bot } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CourseData {
  id: number;
  title: string;
  description: string;
  instructor: string;
  puck_data: Data | null;
}

interface BlockProgress {
  blockId: string;
  status: "available" | "completed";
  completedAt?: string;
}

// ─── LE-004: Interactive Quiz Player ─────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string;
  correctIndex: number;
}

interface QuizResult {
  passed: boolean;
  score: number;
  total: number;
}

function QuizPlayer({
  quizTitle,
  questions,
  passingScore,
  onResult,
}: {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
  onResult: (result: QuizResult) => void;
}) {
  const qs = Array.isArray(questions) ? questions : [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleSubmit = () => {
    let correct = 0;
    qs.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;
    const passed = score >= passingScore;
    const r = { passed, score, total: qs.length };
    setResult(r);
    setSubmitted(true);
    onResult(r);
  };

  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 last:mb-0">
      <h3 className="mb-4 text-[22px] font-semibold text-amber-950">{quizTitle || "Quiz"}</h3>

      {qs.map((q, qi) => {
        const opts = q.options ? q.options.split("\n").filter(Boolean) : [];
        const chosen = answers[qi];
        return (
          <div key={qi} className="mb-5 last:mb-0">
            <p className="mb-3 text-[16px] font-medium leading-7 text-amber-950">
              Q{qi + 1}. {q.question}
            </p>
            <ul className="space-y-1.5">
              {opts.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                let cls = "border-amber-200 bg-white text-amber-900 hover:border-amber-400";
                if (submitted) {
                  if (isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-900";
                  else if (isChosen && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
                  else cls = "border-zinc-200 bg-white text-zinc-500";
                } else if (isChosen) {
                  cls = "border-amber-500 bg-amber-100 text-amber-950";
                }
                return (
                  <li key={oi}>
                    <button
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] transition-all ${cls}`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < qs.length}
          className="mt-4 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-40"
        >
          Submit Jawaban
        </button>
      ) : result && (
        <div className={`mt-5 rounded-xl px-5 py-4 ${result.passed ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            {result.passed
              ? <CheckCircle size={16} className="text-emerald-600" />
              : <AlertTriangle size={16} className="text-red-500" />}
            <span className={`text-sm font-bold ${result.passed ? "text-emerald-800" : "text-red-700"}`}>
              {result.passed ? "Lulus!" : "Belum Lulus"}
            </span>
          </div>
          <p className={`text-xs ${result.passed ? "text-emerald-700" : "text-red-600"}`}>
            Skor: {result.score}% ({result.total} soal) — Passing: {passingScore}%
          </p>
          {!result.passed && (
            <p className="mt-1.5 text-xs text-red-600">
              Baca materi remedial di bawah, lalu coba lagi.
            </p>
          )}
        </div>
      )}
      {passingScore > 0 && !submitted && (
        <p className="mt-3 text-xs text-amber-600">Nilai lulus: {passingScore}%</p>
      )}
    </div>
  );
}

// ─── LE-005: Remedial block injected on quiz failure ─────────────────────────

function RemedialBlock({ quizTitle }: { quizTitle: string }) {
  return (
    <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={15} className="text-orange-500" />
        <span className="text-sm font-semibold text-orange-800">Materi Remedial — {quizTitle}</span>
      </div>
      <p className="text-sm text-orange-700 leading-relaxed">
        Kamu belum mencapai nilai lulus. Tinjau kembali poin-poin utama dari modul ini, lalu kembali ke kuis di atas untuk mencoba lagi.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-orange-700 list-disc list-inside">
        <li>Baca ulang bagian Rich Content di atas</li>
        <li>Tanya AI Tutor jika ada konsep yang belum dipahami</li>
        <li>Coba kuis kembali setelah memahami materinya</li>
      </ul>
    </div>
  );
}

// ─── LE-003: Socratic Chat Player ────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function SocraticChatPlayer({
  courseId,
  blockId,
  seedQuestion,
  persona,
  maxTurns,
  lessonContext,
}: {
  courseId: string;
  blockId: string;
  seedQuestion: string;
  persona: string;
  maxTurns: number;
  lessonContext: string;
}) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const turnCount = history.filter((m) => m.role === "user").length;

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending || done) return;
    setSending(true);
    const newHistory: ChatMessage[] = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    setInput("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/socratic-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_id: blockId,
          message: msg,
          seed_question: seedQuestion,
          persona,
          max_turns: maxTurns,
          history: history.map((h) => ({ role: h.role, content: h.content })),
          lesson_context: lessonContext,
        }),
      });
      if (!res.ok) throw new Error(`Chat failed (${res.status})`);
      const json = await res.json();
      setHistory((prev) => [...prev, { role: "assistant", content: json.reply }]);
      if (json.done) setDone(true);
    } catch {
      setHistory((prev) => [...prev, { role: "assistant", content: "Maaf, gagal terhubung ke AI Tutor. Coba lagi." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/80 last:mb-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-indigo-200 bg-indigo-100/60 px-5 py-3">
        <Bot size={15} className="text-indigo-600" />
        <span className="text-xs font-semibold text-indigo-700">{persona || "AI Tutor"}</span>
        {maxTurns > 0 && (
          <span className="ml-auto text-[10px] text-indigo-400">{turnCount}/{maxTurns} giliran</span>
        )}
      </div>

      {/* Seed question */}
      <div className="px-5 pt-4 pb-2">
        <blockquote className="border-l-4 border-indigo-400 pl-4 text-[16px] leading-7 text-indigo-900 italic">
          {seedQuestion || "Apa yang ingin kamu pelajari hari ini?"}
        </blockquote>
      </div>

      {/* Chat history */}
      {history.length > 0 && (
        <div className="px-5 py-3 space-y-3 max-h-80 overflow-y-auto">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[14px] leading-6 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-indigo-200 text-indigo-900 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white border border-indigo-200 px-4 py-2.5">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done banner */}
      {done && (
        <div className="mx-5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-emerald-800">Sesi selesai! Semoga wawasanmu bertambah. 🎓</p>
        </div>
      )}

      {/* Input */}
      {!done && (
        <div className="flex items-center gap-2 border-t border-indigo-200 bg-white px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Tulis jawabanmu…"
            disabled={sending}
            className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-[14px] text-zinc-900 placeholder-indigo-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            <SendHorizonal size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LE-007: Reflection Journal Player ───────────────────────────────────────────

function ReflectionJournalPlayer({
  courseId,
  blockId,
  prompt,
  minWords,
  tags,
  lessonContext,
}: {
  courseId: string;
  blockId: string;
  prompt: string;
  minWords: number;
  tags: string;
  lessonContext: string;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const meetsMinimum = minWords <= 0 || wordCount >= minWords;

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userObj = stored ? JSON.parse(stored) : null;
      const userId: number = userObj?.id ?? 0;
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/reflection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          block_id: blockId,
          text,
          prompt,
          min_words: minWords,
          lesson_context: lessonContext,
        }),
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      const json = await res.json();
      setFeedback(json.ai_feedback);
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50/70 last:mb-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-teal-200 bg-teal-100/50 px-5 py-3">
        <span className="text-base">📔</span>
        <span className="text-sm font-semibold text-teal-900">Reflection Journal</span>
        {savedAt && (
          <span className="ml-auto text-[10px] text-teal-500">Tersimpan {savedAt}</span>
        )}
      </div>

      <div className="px-5 pt-4 pb-5 space-y-4">
        {/* Prompt */}
        <p className="text-[16px] leading-7 text-teal-900 italic">
          {prompt || "Refleksikan apa yang kamu pelajari dari modul ini."}
        </p>

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagList.map((t) => (
              <span key={t} className="rounded-full bg-teal-100 border border-teal-200 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => { if (!submitted) setText(e.target.value); }}
            rows={5}
            placeholder="Tulis refleksimu di sini…"
            disabled={submitted || submitting}
            className="w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-[14px] text-teal-950 placeholder-teal-300 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none disabled:opacity-70 transition"
          />
          {/* Word counter */}
          <div className={`absolute bottom-3 right-3 text-[11px] font-medium ${
            meetsMinimum ? "text-teal-400" : "text-amber-500"
          }`}>
            {wordCount}{minWords > 0 ? `/${minWords}` : ""} kata
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        {/* Submit button */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim() || !meetsMinimum}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Mengirim…</>
            ) : (
              <>Kirim Refleksi →</>
            )}
          </button>
        )}

        {/* AI Feedback card */}
        {feedback && (
          <div className="rounded-2xl border border-teal-300 bg-white px-5 py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Feedback dari AI Coach</span>
            </div>
            <p className="text-[14px] leading-6 text-zinc-700 whitespace-pre-line">{feedback}</p>
            <button
              onClick={() => { setSubmitted(false); setFeedback(null); setSavedAt(null); }}
              className="mt-1 text-xs text-teal-500 hover:text-teal-700 underline underline-offset-2"
            >
              Revisi refleksi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LE-008: Discussion Forum Player ─────────────────────────────────────────

interface DiscussionPostData {
  id: number;
  user_id: number;
  author_name: string;
  body: string;
  upvotes: number;
  upvoters: number[];
  created_at: string | null;
  replies: DiscussionPostData[];
  parent_id: number | null;
}

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function PostCard({
  post,
  currentUserId,
  courseId,
  blockId,
  depth,
  onRefresh,
}: {
  post: DiscussionPostData;
  currentUserId: number;
  courseId: string;
  blockId: string;
  depth: number;
  onRefresh: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasUpvoted = post.upvoters.includes(currentUserId);

  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userObj = stored ? JSON.parse(stored) : null;
  const authorName: string = userObj?.full_name ?? userObj?.name ?? "Saya";

  const submitReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/discussion/${blockId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, author_name: authorName, body: replyText.trim(), parent_id: post.id }),
      });
      setReplyText("");
      setShowReply(false);
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUpvote = async () => {
    await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/discussion/posts/${post.id}/upvote?user_id=${currentUserId}`, {
      method: "POST",
    });
    onRefresh();
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-violet-100 pl-4" : ""}`}>
      <div className="mb-2 rounded-xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-200 text-[10px] font-bold text-violet-700">
              {(post.author_name ?? "?")[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-zinc-800">{post.author_name}</span>
          </div>
          <span className="text-[10px] text-zinc-400">{timeAgo(post.created_at)}</span>
        </div>
        <p className="text-sm leading-6 text-zinc-700 whitespace-pre-line">{post.body}</p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={toggleUpvote}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
              hasUpvoted ? "bg-violet-100 text-violet-700" : "text-zinc-400 hover:text-violet-600"
            }`}
          >
            ▲ {post.upvotes}
          </button>
          {depth === 0 && (
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-[11px] text-zinc-400 hover:text-violet-600 transition-colors"
            >
              Balas
            </button>
          )}
        </div>
      </div>

      {showReply && (
        <div className="ml-6 mb-2 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
            placeholder="Tulis balasan…"
            className="flex-1 rounded-xl border border-violet-200 bg-violet-50/40 px-3 py-2 text-sm text-zinc-800 placeholder-violet-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          <button
            onClick={submitReply}
            disabled={submitting || !replyText.trim()}
            className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
          >
            {submitting ? "…" : "Kirim"}
          </button>
        </div>
      )}

      {post.replies.map((r) => (
        <PostCard key={r.id} post={r} currentUserId={currentUserId} courseId={courseId} blockId={blockId} depth={depth + 1} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

function DiscussionForumPlayer({
  courseId,
  blockId,
  topic,
  seedPost,
  requiredReplies,
}: {
  courseId: string;
  blockId: string;
  topic: string;
  seedPost: string;
  requiredReplies: number;
}) {
  const [posts, setPosts] = useState<DiscussionPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userObj = stored ? JSON.parse(stored) : null;
  const currentUserId: number = userObj?.id ?? 0;
  const authorName: string = userObj?.full_name ?? userObj?.name ?? "Anonim";

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/discussion/${blockId}`);
      if (res.ok) {
        const json = await res.json();
        setPosts(json.posts ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId, blockId]);

  const submitPost = async () => {
    if (!newPost.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/discussion/${blockId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, author_name: authorName, body: newPost.trim() }),
      });
      setNewPost("");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const myPostCount = posts.filter((p) => p.user_id === currentUserId).length;
  const myReplyCount = posts.flatMap((p) => p.replies).filter((r) => r.user_id === currentUserId).length;
  const totalMyContribs = myPostCount + myReplyCount;

  return (
    <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50/60 last:mb-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-violet-200 bg-violet-100/50 px-5 py-3">
        <span className="text-base">💬</span>
        <span className="text-sm font-semibold text-violet-900">{topic || "Diskusi"}</span>
        <span className="ml-auto text-[10px] text-violet-500">{posts.length} postingan</span>
      </div>

      {/* Seed post */}
      <div className="px-5 pt-4 pb-3">
        <blockquote className="border-l-4 border-violet-400 pl-4 text-[15px] leading-7 text-violet-900 italic">
          {seedPost || "Bagikan perspektifmu tentang topik ini."}
        </blockquote>
        {requiredReplies > 0 && (
          <p className="mt-2 text-[11px] text-violet-500">
            Diharapkan {requiredReplies} balasan ke sesama peserta.
            {totalMyContribs > 0 && (
              <span className="ml-1 font-semibold text-violet-700">
                Kontribusimu: {totalMyContribs}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Post list */}
      <div className="px-5 pb-3 space-y-2">
        {loading && (
          <div className="flex items-center gap-2 py-4 text-xs text-violet-400">
            <Loader2 size={13} className="animate-spin" /> Memuat diskusi…
          </div>
        )}
        {!loading && posts.length === 0 && (
          <p className="py-3 text-center text-xs text-violet-400">Belum ada postingan. Jadilah yang pertama!</p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            courseId={courseId}
            blockId={blockId}
            depth={0}
            onRefresh={load}
          />
        ))}
      </div>

      {/* New post input */}
      <div className="flex items-start gap-2 border-t border-violet-200 bg-white px-4 py-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) submitPost(); }}
          placeholder="Tulis postinganmu… (Ctrl+Enter untuk kirim)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-violet-200 bg-violet-50/40 px-3 py-2 text-sm text-zinc-800 placeholder-violet-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button
          onClick={submitPost}
          disabled={submitting || !newPost.trim()}
          className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <SendHorizonal size={13} />}
        </button>
      </div>
    </div>
  );
}

// ─── Block-by-block renderer with quiz interactivity ─────────────────────────

type PuckBlock = { type?: string; props?: Record<string, unknown> };

function CourseBlockRenderer({
  blocks,
  courseId,
  onQuizResult,
  failedQuizzes,
}: {
  blocks: PuckBlock[];
  courseId: string;
  onQuizResult: (blockId: string, result: QuizResult) => void;
  failedQuizzes: Set<string>;
}) {
  // Build lesson context from all RichContent blocks (for RAG grounding)
  const lessonContext = blocks
    .filter((b) => b.type === "RichContent")
    .map((b) => stripHtml((b.props?.html as string) ?? ""))
    .join(" ");

  const rendered: React.ReactNode[] = [];

  blocks.forEach((block, i) => {
    const blockType = block.type ?? "";
    const blockId = (block.props?.id as string) ?? `block-${i}`;

    if (blockType === "QuizBuilder") {
      const props = block.props ?? {};
      rendered.push(
        <div key={blockId}>
          <QuizPlayer
            quizTitle={(props.quizTitle as string) ?? "Quiz"}
            questions={(props.questions as QuizQuestion[]) ?? []}
            passingScore={(props.passingScore as number) ?? 70}
            onResult={(r) => onQuizResult(blockId, r)}
          />
          {/* LE-005: inject remedial block if this quiz was failed */}
          {failedQuizzes.has(blockId) && (
            <RemedialBlock quizTitle={(props.quizTitle as string) ?? "Quiz"} />
          )}
        </div>
      );
    } else if (blockType === "ReflectionJournal") {
      // LE-007: Live reflection journal with AI feedback
      const props = block.props ?? {};
      rendered.push(
        <ReflectionJournalPlayer
          key={blockId}
          courseId={courseId}
          blockId={blockId}
          prompt={(props.prompt as string) ?? ""}
          minWords={(props.minWords as number) ?? 0}
          tags={(props.tags as string) ?? ""}
          lessonContext={lessonContext}
        />
      );
    } else if (blockType === "SocraticChat") {
      // LE-003: Live Socratic AI tutor
      const props = block.props ?? {};
      rendered.push(
        <SocraticChatPlayer
          key={blockId}
          courseId={courseId}
          blockId={blockId}
          seedQuestion={(props.seedQuestion as string) ?? ""}
          persona={(props.persona as string) ?? "VOKASI AI Tutor"}
          maxTurns={(props.maxTurns as number) ?? 8}
          lessonContext={lessonContext}
        />
      );
    } else if (blockType === "DiscussionSeed") {
      // LE-008: Live threaded discussion forum
      const props = block.props ?? {};
      rendered.push(
        <DiscussionForumPlayer
          key={blockId}
          courseId={courseId}
          blockId={blockId}
          topic={(props.topic as string) ?? "Diskusi"}
          seedPost={(props.seedPost as string) ?? ""}
          requiredReplies={(props.requiredReplies as number) ?? 2}
        />
      );
    } else {
      // Render all other block types via Puck Render (single-block data)
      const singleData: Data = {
        content: [block as Data["content"][number]],
        root: { props: {} },
      };
      rendered.push(
        <div key={blockId}>
          <Render config={vokasiPuckConfig} data={singleData} />
        </div>
      );
    }
  });

  return <>{rendered}</>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PuckLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<Record<string, BlockProgress>>({});
  const [savingBlock, setSavingBlock] = useState<string | null>(null);
  const [failedQuizzes, setFailedQuizzes] = useState<Set<string>>(new Set());
  const [certCode, setCertCode] = useState<string | null>(null);
  const [certIssuing, setCertIssuing] = useState(false);

  // ── Load course puck_data ────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}`);
        if (!res.ok) throw new Error(`Failed to load course (${res.status})`);
        const data = await res.json();
        setCourse(data);

        // Load saved progress
        const progRes = await fetch(
          `${API_BASE}/api/v1/puck/courses/${courseId}/progress`,
          { credentials: "include" }
        );
        if (progRes.ok) {
          const progData: BlockProgress[] = await progRes.json();
          const map: Record<string, BlockProgress> = {};
          progData.forEach((p) => { map[p.blockId] = p; });
          setProgress(map);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // ── Mark block complete ──────────────────────────────────────────────────
  const markComplete = useCallback(async (blockId: string) => {
    if (progress[blockId]?.status === "completed") return;
    setSavingBlock(blockId);

    // Optimistic update
    setProgress((prev) => ({
      ...prev,
      [blockId]: { blockId, status: "completed", completedAt: new Date().toISOString() },
    }));

    try {
      await fetch(
        `${API_BASE}/api/v1/puck/courses/${courseId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ block_id: blockId, status: "completed" }),
        }
      );
    } catch {
      // Non-critical — local state still updated
    } finally {
      setSavingBlock(null);
    }
  }, [courseId, progress]);

  // ── Computed stats ───────────────────────────────────────────────────────
  const blocks = course?.puck_data?.content ?? [];
  const totalBlocks = blocks.length;
  const completedCount = Object.values(progress).filter(
    (p) => p.status === "completed"
  ).length;
  const progressPct = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;

  // ── LE-006: Auto-issue certificate when 100% complete ───────────────────
  useEffect(() => {
    if (progressPct !== 100 || certCode || certIssuing) return;
    async function issueCert() {
      setCertIssuing(true);
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const userObj = stored ? JSON.parse(stored) : null;
        const userId: number = userObj?.id ?? 0;
        const studentName: string = userObj?.name ?? "";
        const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/certificate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, student_name: studentName }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.cert_code) setCertCode(json.cert_code);
        }
      } catch { /* non-critical */ } finally {
        setCertIssuing(false);
      }
    }
    issueCert();
  }, [progressPct, certCode, certIssuing, courseId]);

  // ── LE-004/005: Quiz result handler ───────────────────────────────────
  const handleQuizResult = useCallback((blockId: string, result: QuizResult) => {
    if (!result.passed) {
      setFailedQuizzes((prev) => new Set(prev).add(blockId));
    } else {
      setFailedQuizzes((prev) => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
      });
      markComplete(blockId);
    }
  }, [markComplete]);

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Memuat kursus…</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="font-semibold text-zinc-800">Gagal memuat kursus</p>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!course.puck_data || !Array.isArray(course.puck_data.content) || course.puck_data.content.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="font-semibold text-zinc-700">Konten kursus belum tersedia</p>
          <p className="mt-2 text-sm text-zinc-500">
            Instruktur belum menerbitkan konten visual untuk kursus ini.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            ← Kembali ke Kursus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Kembali
          </button>

          <div className="flex-1 mx-6 min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-800">{course.title}</p>
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs">
              <Clock size={11} className="text-zinc-400" />
              <span className="text-zinc-600 font-medium">{completedCount}/{totalBlocks} blok</span>
            </div>
            <div className="w-20 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-600">{progressPct}%</span>
          </div>
        </div>
      </header>

      {/* ── Course content ── */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/*
          Strategy: render full puck_data once (correct Puck types),
          then render per-block completion buttons below via a second pass.
          Block IDs from the content array are used to key progress records.
        */}
        <CourseBlockRenderer
          blocks={blocks as PuckBlock[]}
          courseId={courseId}
          onQuizResult={handleQuizResult}
          failedQuizzes={failedQuizzes}
        />

        {/* Per-block completion buttons — rendered as a separate stacked list */}
        <div className="mt-2 space-y-1">
          {blocks.map((block, i) => {
            const blockId =
              (block as { props?: { id?: string } }).props?.id ?? `block-${i}`;
            const blockType =
              (block as { type?: string }).type ?? "Block";
            const isCompleted = progress[blockId]?.status === "completed";

            return (
              <div
                key={blockId}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-2.5 shadow-sm"
              >
                <span className="text-xs text-zinc-500 font-medium">
                  {blockType} {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  {savingBlock === blockId && (
                    <Loader2 size={12} className="animate-spin text-zinc-400" />
                  )}
                  <button
                    onClick={() => markComplete(blockId)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : "bg-zinc-100 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 border border-zinc-200"
                    }`}
                    disabled={isCompleted}
                  >
                    <CheckCircle
                      size={12}
                      className={isCompleted ? "text-emerald-600" : "text-zinc-400"}
                    />
                    {isCompleted ? "Selesai" : "Tandai Selesai"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Completion banner (LE-006) ── */}
        {progressPct === 100 && (
          <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-emerald-900 mb-1">Selamat! Kursus Selesai</h2>
            <p className="text-sm text-emerald-700 mb-4">
              Kamu telah menyelesaikan semua {totalBlocks} blok pembelajaran.
            </p>
            {certIssuing && (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 mb-3">
                <Loader2 size={14} className="animate-spin" />
                Menerbitkan sertifikat…
              </div>
            )}
            {certCode ? (
              <a
                href={`/certificates/${certCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                🏅 Lihat Sertifikat
              </a>
            ) : !certIssuing && (
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="rounded-xl border border-emerald-300 px-6 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Kembali ke Kursus
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
