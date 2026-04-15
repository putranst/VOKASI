"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronLeft,
  Lock,
  Menu,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { cendikiaApi, Module, Course, EditorContentBlock } from "@/lib/cendikia-api";
import { useAuth } from "@/lib/AuthContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string; moduleId: string }>;
}

function normalizeEditorBlocks(blocks?: EditorContentBlock[]): EditorContentBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter((b) => b && typeof b === "object")
    .map((b, idx) => ({
      id: b.id ?? `block-${idx}`,
      type: (b.type ?? "text").toLowerCase(),
      content: b.content ?? "",
      metadata: b.metadata ?? {},
    }));
}

const BLOCK_LABELS: Record<Language, Record<string, string>> = {
  id: {
    untitledSection: "Bagian Tanpa Judul",
    video: "Video",
    videoUrlMissing: "URL video belum diisi.",
    quiz: "Kuis",
    discussion: "Diskusi",
    assignment: "Tugas",
    resource: "Sumber Belajar",
    aiInteraction: "Interaksi AI",
  },
  en: {
    untitledSection: "Untitled Section",
    video: "Video",
    videoUrlMissing: "Video URL is not set.",
    quiz: "Quiz",
    discussion: "Discussion",
    assignment: "Assignment",
    resource: "Resource",
    aiInteraction: "AI Interaction",
  },
};

function renderEditorBlocks(blocks: EditorContentBlock[], language: Language): React.ReactNode {
  const labels = BLOCK_LABELS[language];
  return blocks.map((block) => {
    const key = `editor-${block.id}`;
    const type = block.type.toLowerCase();
    const metadata = block.metadata ?? {};

    if (type === "heading") {
      return (
        <h2 key={key} className="text-2xl font-black text-gray-900 mt-8 mb-3 leading-tight">
          {block.content || metadata?.title || labels.untitledSection}
        </h2>
      );
    }

    if (type === "text") {
      return (
        <p key={key} className="text-gray-700 leading-relaxed my-3 whitespace-pre-wrap">
          {block.content}
        </p>
      );
    }

    if (type === "video") {
      const videoUrl = metadata?.videoUrl as string | undefined;
      return (
        <div key={key} className="my-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="font-bold text-gray-900 mb-2">{metadata?.title || labels.video}</p>
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline break-all">
              {videoUrl}
            </a>
          ) : (
            <p className="text-sm text-gray-500">{labels.videoUrlMissing}</p>
          )}
          {block.content ? <p className="text-sm text-gray-600 mt-3">{block.content}</p> : null}
        </div>
      );
    }

    if (type === "code") {
      return (
        <pre key={key} className="my-5 rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm border border-gray-800">
          <code>{block.content}</code>
        </pre>
      );
    }

    if (type === "quiz") {
      return (
        <div key={key} className="my-5 rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <p className="font-bold text-purple-900 mb-2">{labels.quiz}</p>
          <p className="text-sm text-purple-800">{block.content}</p>
        </div>
      );
    }

    if (type === "discussion") {
      return (
        <div key={key} className="my-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-bold text-yellow-900 mb-2">{labels.discussion}</p>
          <p className="text-sm text-yellow-800">{block.content}</p>
        </div>
      );
    }

    if (type === "assignment") {
      return (
        <div key={key} className="my-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <p className="font-bold text-orange-900 mb-2">{metadata?.title || labels.assignment}</p>
          <p className="text-sm text-orange-800 whitespace-pre-wrap">{block.content}</p>
        </div>
      );
    }

    if (type === "resource") {
      return (
        <div key={key} className="my-5 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <p className="font-bold text-teal-900 mb-2">{metadata?.title || labels.resource}</p>
          <p className="text-sm text-teal-800 whitespace-pre-wrap">{block.content}</p>
          {metadata?.link ? (
            <a href={metadata.link} target="_blank" rel="noreferrer" className="text-sm text-teal-700 font-semibold hover:underline break-all block mt-2">
              {metadata.link}
            </a>
          ) : null}
        </div>
      );
    }

    if (type === "ai_interaction") {
      return (
        <div key={key} className="my-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="font-bold text-indigo-900 mb-2">{metadata?.title || labels.aiInteraction}</p>
          <p className="text-sm text-indigo-800 whitespace-pre-wrap">{block.content}</p>
        </div>
      );
    }

    if (type === "divider") {
      return <hr key={key} className="my-8 border-gray-200" />;
    }

    return (
      <div key={key} className="my-4 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{block.type}</p>
        <p className="text-gray-700 whitespace-pre-wrap">{block.content}</p>
      </div>
    );
  });
}

type Language = "id" | "en";

const COPY: Record<Language, Record<string, string>> = {
  id: {
    module: "Modul",
    minutes: "menit",
    completed: "Selesai",
    completedDetail: "Sudah diselesaikan",
    backToCourse: "Kembali ke Kursus",
    modulesDone: "modul selesai",
    moduleListAria: "Daftar modul",
    loginTitle: "Masuk untuk melanjutkan",
    loginDesc: "Kamu perlu masuk untuk mengakses konten modul ini.",
    loginNow: "Masuk Sekarang",
    loadingErrorTitle: "Gagal Memuat Modul",
    retry: "Coba Lagi",
    noContentTitle: "Konten modul belum tersedia.",
    noContentDesc: "Coba kunjungi kembali beberapa saat lagi.",
    markCompleteTitle: "Sudah selesai membaca?",
    markCompleteDesc: "Tandai modul ini sebagai selesai untuk membuka modul berikutnya dan melanjutkan ke AI Classroom.",
    saving: "Menyimpan...",
    markComplete: "Tandai Selesai",
    aiClassroomTitle: "Masuk AI Classroom",
    aiClassroomDesc: "Diskusikan materi ini bersama AI Tutor yang ingat progresmu. Kamu bisa bertanya, berdebat, atau minta penjelasan ulang — dalam Bahasa Indonesia.",
    preparingClassroom: "Mempersiapkan Classroom...",
    previous: "Sebelumnya",
    next: "Berikutnya",
    finishAllModules: "Selesai Semua Modul",
    readingProgressAria: "Progres membaca",
  },
  en: {
    module: "Module",
    minutes: "min",
    completed: "Completed",
    completedDetail: "Completed",
    backToCourse: "Back to Course",
    modulesDone: "modules completed",
    moduleListAria: "Module list",
    loginTitle: "Sign in to continue",
    loginDesc: "You need to sign in to access this module content.",
    loginNow: "Sign In Now",
    loadingErrorTitle: "Failed to Load Module",
    retry: "Retry",
    noContentTitle: "Module content is not available yet.",
    noContentDesc: "Please check back again shortly.",
    markCompleteTitle: "Finished reviewing this module?",
    markCompleteDesc: "Mark this module as complete to unlock the next module and continue to AI Classroom.",
    saving: "Saving...",
    markComplete: "Mark Complete",
    aiClassroomTitle: "Enter AI Classroom",
    aiClassroomDesc: "Discuss this module with an AI Tutor that remembers your progress. Ask questions, debate ideas, or request simpler explanations.",
    preparingClassroom: "Preparing Classroom...",
    previous: "Previous",
    next: "Next",
    finishAllModules: "Finish All Modules",
    readingProgressAria: "Reading progress",
  },
};

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
// Handles: # headings, **bold**, *italic*, `code`, ```blocks```, - lists, > blockquote, ---

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={`cb-${i}`} className="my-4 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          {lang && (
            <div className="bg-gray-800 text-gray-400 text-xs px-4 py-1.5 font-mono uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${i}`} className="my-6 border-gray-200" />);
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${i}`} className="text-3xl font-black text-gray-900 mt-8 mb-4 leading-tight">
          {inlineMarkdown(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${i}`} className="text-2xl font-black text-gray-900 mt-8 mb-3 leading-tight border-b border-gray-100 pb-2">
          {inlineMarkdown(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-gray-900 mt-6 mb-2">
          {inlineMarkdown(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // H4
    if (line.startsWith("#### ")) {
      nodes.push(
        <h4 key={`h4-${i}`} className="text-lg font-bold text-gray-800 mt-4 mb-2">
          {inlineMarkdown(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote
          key={`bq-${i}`}
          className="my-4 pl-4 border-l-4 border-primary/40 bg-primary/5 py-3 pr-4 rounded-r-xl italic text-gray-700"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{inlineMarkdown(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-6 list-decimal text-gray-700">
          {items.map((it, idx) => (
            <li key={idx} className="leading-relaxed pl-1">{inlineMarkdown(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Bulleted list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-6 list-disc text-gray-700">
          {items.map((it, idx) => (
            <li key={idx} className="leading-relaxed pl-1">{inlineMarkdown(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      nodes.push(<div key={`sp-${i}`} className="h-3" />);
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={`p-${i}`} className="text-gray-700 leading-relaxed my-2">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <>{nodes}</>;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={idx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code key={idx} className="font-mono text-sm bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {part.slice(1, -1)}
            </code>
          );
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-32 bg-gray-200 rounded-xl mt-6" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

// ─── Module Sidebar Item ──────────────────────────────────────────────────────

function SidebarModuleItem({
  module,
  isActive,
  courseId,
  language,
}: {
  module: Module;
  isActive: boolean;
  courseId: string;
  language: Language;
}) {
  const isLocked = module.locked && !module.completed;

  if (isLocked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 cursor-not-allowed">
        <Lock size={14} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{module.title}</p>
          <p className="text-xs">{module.est_minutes} {COPY[language].minutes}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/courses/${courseId}/learn/${module.id}`}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
        ${
          isActive
            ? "bg-primary text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <div className="flex-shrink-0">
        {module.completed ? (
          <CheckCircle size={14} className={isActive ? "text-white" : "text-green-500"} />
        ) : (
          <BookOpen size={14} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{module.title}</p>
        <p className={`text-xs ${isActive ? "text-white/70" : "text-gray-500"}`}>
          {module.est_minutes} {COPY[language].minutes}
        </p>
      </div>
    </Link>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ReadProgressBar({ progress, ariaLabel }: { progress: number; ariaLabel: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-1 bg-gray-200">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${ariaLabel}: ${Math.round(progress)}%`}
      />
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 44 }: { progress: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        strokeWidth="3" strokeLinecap="round" stroke="currentColor"
        className="text-primary transition-all duration-700"
        strokeDasharray={`${circ}`}
        strokeDashoffset={circ - (progress / 100) * circ}
      />
    </svg>
  );
}

// ─── Confetti Celebration ────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#22d3ee", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#3b82f6"];

function ConfettiCelebration({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-30px) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg) scale(0.8); opacity: 0; }
        }
        .confetti-piece { animation: confetti-fall linear forwards; }
      `}</style>
      {Array.from({ length: 55 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece absolute top-0"
          style={{
            left: `${(i * 1.9) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            width: 6 + (i % 6) * 1.5,
            height: 6 + (i % 6) * 1.5,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            animationDuration: `${1.4 + (i % 12) * 0.14}s`,
            animationDelay: `${(i % 9) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Right Utility Panel ─────────────────────────────────────────────────────

function RightUtilityPanel({
  moduleId, moduleTitle, keyTerms, language,
}: {
  moduleId: string; moduleTitle: string; keyTerms: string[]; language: Language;
}) {
  const [activeTab, setActiveTab] = useState<"notes" | "terms">("notes");
  const [notes, setNotes] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem(`cendikia_note_${moduleId}`) ?? "") : ""
  );
  const handleNotes = (v: string) => {
    setNotes(v);
    if (typeof window !== "undefined") localStorage.setItem(`cendikia_note_${moduleId}`, v);
  };
  const tabs = [
    { id: "notes" as const, label: language === "id" ? "Catatan" : "Notes" },
    { id: "terms" as const, label: language === "id" ? "Istilah" : "Terms" },
  ];
  return (
    <aside className="hidden xl:flex flex-col w-[272px] flex-shrink-0 bg-slate-900 text-white border-l border-slate-700/50 sticky top-[64px] self-start h-[calc(100vh-64px)]">
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50 flex-shrink-0">
        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">AI Utility</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate leading-relaxed">{moduleTitle}</p>
      </div>
      <div className="flex border-b border-slate-700/50 flex-shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
              activeTab === tab.id
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "notes" && (
        <div className="flex flex-col flex-1 p-4 gap-2.5 overflow-hidden min-h-0">
          <p className="text-[11px] text-slate-400 flex-shrink-0">
            {language === "id" ? "Catatan pribadi (tersimpan otomatis):" : "Personal notes (auto-saved):"}
          </p>
          <textarea
            value={notes}
            onChange={(e) => handleNotes(e.target.value)}
            placeholder={language === "id" ? "Tulis catatan penting di sini..." : "Write your notes here..."}
            className="flex-1 bg-slate-800 text-white text-sm rounded-xl p-3 border border-slate-700/80 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed min-h-0"
          />
          {notes.length > 0 && (
            <p className="text-[10px] text-slate-600 flex-shrink-0">
              {language === "id" ? "✓ Tersimpan di perangkat ini" : "✓ Saved to this device"}
            </p>
          )}
        </div>
      )}

      {activeTab === "terms" && (
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {keyTerms.length === 0 ? (
            <p className="text-xs text-slate-500 text-center mt-8 leading-relaxed">
              {language === "id" ? "Tidak ada istilah kunci terdeteksi." : "No key terms detected."}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                {language === "id" ? "Judul & Topik Kunci" : "Key Headings & Topics"}
              </p>
              {keyTerms.map((term, i) => (
                <div key={i}
                  className="bg-slate-800/70 border border-slate-700/60 hover:border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors cursor-default leading-relaxed">
                  {term}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModuleReaderPage({ params }: Props) {
  const { id: courseId, moduleId } = React.use(params);
  const { session, user, loading: authLoading } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────────

  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [language, setLanguage] = useState<Language>("id");
  const [showConfetti, setShowConfetti] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const token = session?.access_token;
  const canAccess = Boolean(token || user);
  const t = COPY[language];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("cendikia_language");
    if (stored === "id" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  const handleLanguageChange = (next: Language) => {
    setLanguage(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cendikia_language", next);
    }
  };

  // ── Data Fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!canAccess) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      cendikiaApi.getCourse(courseId, token),
      cendikiaApi.getModule(courseId, moduleId, token),
    ])
      .then(([courseData, moduleData]) => {
        if (cancelled) return;

        setCourse(courseData);
        setModule(moduleData);
        setIsCompleted(moduleData.completed ?? false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load module. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, moduleId, token, canAccess]);

  // ── Scroll Progress Tracking ──────────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      setReadProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Intersection Observer — auto-mark complete on reaching bottom ─────────────

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasReachedBottom) {
          setHasReachedBottom(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasReachedBottom, module]);

  // ── Mark Complete ─────────────────────────────────────────────────────────────

  const handleMarkComplete = useCallback(async () => {
    if (!canAccess || isCompleted || isMarkingComplete) return;
    setIsMarkingComplete(true);
    setError(null);
    try {
      await cendikiaApi.markModuleComplete(courseId, moduleId, token);
      setIsCompleted(true);
      setShowConfetti(true);
      // Optimistically update module in course list
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: true } : m
          ),
        };
      });
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Gagal menandai modul selesai. Silakan coba lagi.");
    } finally {
      setIsMarkingComplete(false);
    }
  }, [canAccess, isCompleted, isMarkingComplete, courseId, moduleId, token]);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const modules = course?.modules ?? [];
  const currentIndex = modules.findIndex((m) => m.id === moduleId);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule =
    currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;
  const editorBlocks = normalizeEditorBlocks(module?.content_blocks);
  const keyTerms = useMemo(
    () =>
      editorBlocks
        .filter((b) => b.type === "heading")
        .map((b) => b.content)
        .filter(Boolean)
        .slice(0, 12),
    [editorBlocks]
  );
  const completedCount = modules.filter((m) => m.completed).length;
  const courseProgress =
    modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  // ── Auth guard ───────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="text-primary animate-spin" size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Memeriksa akses...</h2>
            <p className="text-gray-600 text-sm">Mohon tunggu sebentar.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              {t.loginTitle}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {t.loginDesc}
            </p>
            <Link
              href={`/login?redirect=/courses/${courseId}/learn/${moduleId}`}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              {t.loginNow}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-500" size={28} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              {t.loadingErrorTitle}
            </h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showConfetti && <ConfettiCelebration onDone={() => setShowConfetti(false)} />}
      <ReadProgressBar progress={readProgress} ariaLabel={t.readingProgressAria} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Three-column shell */}
      <div className="flex flex-1 max-w-[1700px] mx-auto w-full">

        {/* ── Left Rail ──────────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-[64px] left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200
            overflow-y-auto flex flex-col transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:relative lg:top-0 lg:translate-x-0 lg:z-auto lg:flex lg:w-64 xl:w-72
          `}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-3"
            >
              <ChevronLeft size={16} />
              {t.backToCourse}
            </Link>
            {course && (
              <>
                <h2 className="font-black text-gray-900 text-sm leading-tight mb-3">
                  {course.title}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <ProgressRing progress={courseProgress} size={44} />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-primary">
                      {courseProgress}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">{completedCount}/{modules.length}</div>
                    <div className="text-xs text-gray-400">{t.modulesDone}</div>
                  </div>
                </div>
              </>
            )}
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1" aria-label={t.moduleListAria}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))
              : modules.map((mod) => (
                  <SidebarModuleItem
                    key={mod.id}
                    module={mod}
                    isActive={mod.id === moduleId}
                    courseId={courseId}
                    language={language}
                  />
                ))}
          </nav>
        </aside>

        {/* ── Center + Right ─────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-w-0">

          {/* CENTER CANVAS */}
          <main className="flex-1 min-w-0 flex flex-col pb-20">
            {/* Sticky module header */}
            <div className="sticky top-[64px] z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
                ) : (
                  <h1 className="text-sm font-bold text-gray-900 truncate">{module?.title}</h1>
                )}
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
                <button onClick={() => handleLanguageChange("id")}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-colors ${language === "id" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >ID</button>
                <button onClick={() => handleLanguageChange("en")}
                  className={`px-2 py-1 text-xs rounded-md font-bold transition-colors ${language === "en" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >EN</button>
              </div>
              {module && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                  <Clock size={13} />
                  <span>~{module.est_minutes} {t.minutes}</span>
                </div>
              )}
              {isCompleted && (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
                  <CheckCircle size={13} />
                  {t.completed}
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 px-4 sm:px-8 lg:px-16 pt-4 pb-10 max-w-3xl mx-auto w-full">
              {loading ? (
                <ContentSkeleton />
              ) : module ? (
                <article ref={contentRef}>
                  <header className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {t.module} {currentIndex + 1}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {module.est_minutes} {t.minutes}
                      </span>
                      {isCompleted && (
                        <>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle size={12} />
                            {t.completedDetail}
                          </span>
                        </>
                      )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                      {module.title}
                    </h1>
                  </header>

                  <div className="prose-like text-base">
                    {editorBlocks.length > 0 ? (
                      renderEditorBlocks(editorBlocks, language)
                    ) : module.content_md ? (
                      renderMarkdown(module.content_md)
                    ) : (
                      <div className="text-center py-16 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="font-medium">{t.noContentTitle}</p>
                        <p className="text-sm mt-1">{t.noContentDesc}</p>
                      </div>
                    )}
                  </div>

                  <div ref={bottomSentinelRef} className="h-4" aria-hidden="true" />

                </article>
              ) : null}
            </div>
          </main>

          {/* RIGHT UTILITY PANEL */}
          <RightUtilityPanel
            moduleId={moduleId}
            moduleTitle={module?.title ?? ""}
            keyTerms={keyTerms}
            language={language}
          />
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ──────────────────────────────────────────── */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-[1700px] mx-auto flex items-center gap-2">

            {/* Previous */}
            <div className="flex-1 flex justify-start min-w-0">
              {prevModule && !prevModule.locked ? (
                <Link
                  href={`/courses/${courseId}/learn/${prevModule.id}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary font-medium px-3 py-2 rounded-xl hover:bg-gray-100 transition-all min-w-0"
                >
                  <ArrowLeft size={15} className="flex-shrink-0" />
                  <span className="truncate hidden sm:block max-w-[140px]">{prevModule.title}</span>
                  <span className="sm:hidden">{t.previous}</span>
                </Link>
              ) : <div />}
            </div>

            {/* Center: Mark Complete / Completed badge */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-2 rounded-xl">
                  <CheckCircle size={15} />
                  <span>{t.completed}</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete || !hasReachedBottom}
                  title={!hasReachedBottom ? (language === "id" ? "Baca hingga akhir untuk membuka" : "Read to end to unlock") : ""}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${
                    hasReachedBottom
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isMarkingComplete
                    ? <><Loader2 size={15} className="animate-spin" /><span className="hidden sm:block">{t.saving}</span></>
                    : <><CheckCircle size={15} /><span className="hidden sm:block">{t.markComplete}</span></>
                  }
                </button>
              )}
            </div>

            {/* Right: Next */}
            <div className="flex-1 flex justify-end items-center gap-2">
              {nextModule && !nextModule.locked ? (
                <Link
                  href={`/courses/${courseId}/learn/${nextModule.id}`}
                  className="flex items-center gap-1.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-xl transition-all shadow-sm"
                >
                  <span className="hidden sm:block truncate max-w-[140px]">{nextModule.title}</span>
                  <span className="sm:hidden">{t.next}</span>
                  <ArrowRight size={15} className="flex-shrink-0" />
                </Link>
              ) : nextModule?.locked ? (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 border border-gray-200 px-3 py-2 rounded-xl cursor-not-allowed">
                  <span className="hidden sm:block">{t.next}</span>
                  <Lock size={14} />
                </div>
              ) : (
                <Link
                  href={`/courses/${courseId}`}
                  className="flex items-center gap-1.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <CheckCircle size={15} />
                  <span className="hidden sm:block">{t.finishAllModules}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
