"use client";

/**
 * VOKASI Visual Course Builder
 * vokasi2.prd §5.3 — VB-001 … VB-007
 *
 * Route: /instructor/builder/[courseId]
 * Preview mode: /instructor/builder/[courseId]?preview=true
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Puck, Render, type Data } from "@puckeditor/core";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import "@puckeditor/core/dist/index.css";
import { vokasiPuckConfig } from "@/lib/puck/config";
import { Sparkles, X, RefreshCw, Eye, History, ChevronRight, List, ChevronUp, ChevronDown, Trash2, GripVertical, BarChart2, Users, Award, FileText, LayoutTemplate, Plus, Wand2, Download } from "lucide-react";
import { BLOCK_TEMPLATES, TEMPLATE_CATEGORIES, type BlockTemplate } from "@/lib/puck/blockTemplates";

// ─── API helpers ────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchCourse(courseId: string) {
  const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}`);
  if (!res.ok) throw new Error(`Failed to load course (${res.status})`);
  return res.json();
}

async function saveDraft(courseId: string, puckData: Data) {
  const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ puck_data: puckData }),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
  return res.json();
}

async function publishCourse(courseId: string, puckData: Data) {
  const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ puck_data: puckData }),
  });
  if (!res.ok) throw new Error(`Publish failed (${res.status})`);
  return res.json();
}

// ─── QueryClient singleton ───────────────────────────────────────────────────

const queryClient = new QueryClient();

// ─── Inner builder (needs QueryClient context) ───────────────────────────────

function BuilderInner({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const autoOpenAnalytics = searchParams.get("analytics") === "1";

  const [puckData, setPuckData] = useState<Data | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showGenModal, setShowGenModal] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [genAudience, setGenAudience] = useState("Beginner");
  const [genStatus, setGenStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [genError, setGenError] = useState("");

  // AI-006: Outline suggestion state
  const [outlineStep, setOutlineStep] = useState<"prompt" | "outline">("prompt");
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [outlineItems, setOutlineItems] = useState<Array<{
    type: string;
    reason: string;
    description: string;
    enabled: boolean;
  }>>([]); 

  const handleSuggestOutline = async () => {
    if (!genPrompt.trim()) return;
    setOutlineLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ prompt: genPrompt.trim(), target_audience: genAudience }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setOutlineItems((json.outline ?? []).map((b: { type: string; reason: string; description: string }) => ({ ...b, enabled: true })));
      setOutlineStep("outline");
    } catch {
      // fallback: skip to generate directly
      handleGenerate();
    } finally {
      setOutlineLoading(false);
    }
  };

  const resetGenModal = () => {
    setShowGenModal(false);
    setOutlineStep("prompt");
    setOutlineItems([]);
    setGenPrompt("");
    setGenStatus("idle");
    setGenError("");
  };

  // ── AI-005: Regenerate block state ───────────────────────────────────────
  const [showRegenPanel, setShowRegenPanel] = useState(false);
  const [regenBlockIdx, setRegenBlockIdx] = useState<number>(0);
  const [regenPrompt, setRegenPrompt] = useState("");
  const [regenStatus, setRegenStatus] = useState<"idle" | "loading" | "error">("idle");
  const [regenError, setRegenError] = useState("");

  const handleRegenerateBlock = async () => {
    if (!puckData || !regenPrompt.trim()) return;
    setRegenStatus("loading");
    setRegenError("");
    const block = puckData.content[regenBlockIdx] as { type: string; props: Record<string, unknown> };
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/regenerate-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          block_type: block.type,
          block_props: block.props,
          prompt: regenPrompt.trim(),
          block_index: regenBlockIdx,
        }),
      });
      if (!res.ok) throw new Error(`Regenerate failed (${res.status})`);
      const json = await res.json();
      if (json.props) {
        const newContent = [...puckData.content];
        newContent[regenBlockIdx] = { ...block, props: { ...block.props, ...json.props } };
        const newData: Data = { ...puckData, content: newContent };
        setPuckData(newData);
        saveMutation.mutate(newData);
      }
      setRegenStatus("idle");
      setShowRegenPanel(false);
      setRegenPrompt("");
    } catch (e) {
      setRegenStatus("error");
      setRegenError((e as Error).message);
    }
  };

  const BLOCK_ICON: Record<string, string> = {
    ModuleHeader: "🏷",
    RichContent: "📄",
    VideoBlock: "🎬",
    QuizBuilder: "✅",
    SocraticChat: "🤖",
    ReflectionJournal: "📔",
    CodeSandbox: "💻",
    Assignment: "📋",
    DiscussionSeed: "💬",
    PeerReviewRubric: "👥",
  };

  // ── VB-009: Block templates panel ────────────────────────────────────────
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState<string>("starter");

  // ── VB-008: Block order panel (state only — handlers after saveMutation) ────────────
  const [showBlockList, setShowBlockList] = useState(false);

  // ── AM-005: Analytics panel ────────────────────────────────────────────────
  const [showAnalytics, setShowAnalytics] = useState(autoOpenAnalytics);
  const [analyticsData, setAnalyticsData] = useState<null | {
    course_title: string;
    total_blocks: number;
    unique_learners: number;
    certificates_issued: number;
    reflections_submitted: number;
    avg_completion_pct: number;
    block_analytics: Array<{
      index: number;
      block_id: string;
      block_type: string;
      completed_learners: number;
      completion_rate: number;
    }>;
  }>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/analytics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setAnalyticsData(await res.json());
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Auto-load when opened from deep-link
  useEffect(() => {
    if (autoOpenAnalytics) loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── VB-007: Version history state ────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<Array<{ version_number: number; published_at: string; published_by: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadVersions = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/versions`);
      if (res.ok) setVersions(await res.json());
    } finally {
      setHistoryLoading(false);
    }
  };

  const restoreVersion = async (versionNumber: number) => {
    const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/versions/${versionNumber}`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.puck_data) {
      setPuckData(json.puck_data as Data);
      saveMutation.mutate(json.puck_data as Data);
      setShowHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenStatus("loading");
    setGenError("");
    const approvedOutline = outlineItems.length > 0
      ? outlineItems.filter(b => b.enabled).map(b => b.type)
      : undefined;
    try {
      const res = await fetch(`${API_BASE}/api/v1/puck/courses/${courseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ prompt: genPrompt.trim(), target_audience: genAudience, approved_outline: approvedOutline ?? null }),
      });
      if (!res.ok) throw new Error(`Generate failed (${res.status})`);
      const json = await res.json();
      if (json.puck_data) {
        setPuckData(json.puck_data as Data);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
      setGenStatus("done");
      resetGenModal();
    } catch (e) {
      setGenStatus("error");
      setGenError((e as Error).message);
    }
  };

  // ── Load course data ──────────────────────────────────────────────────────
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["puck-course", courseId],
    queryFn: () => fetchCourse(courseId),
  });

  useEffect(() => {
    if (course) {
      const raw = course.puck_data;
      if (raw && typeof raw === "object" && "content" in raw) {
        setPuckData(raw as Data);
      } else {
        setPuckData({ content: [], root: { props: {} } });
      }
    }
  }, [course]);

  // ── Save mutation ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (data: Data) => saveDraft(courseId, data),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => setSaveStatus("error"),
  });

  // ── Publish mutation ──────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (data: Data) => publishCourse(courseId, data),
    onMutate: () => setPublishStatus("publishing"),
    onSuccess: () => {
      setPublishStatus("published");
      setTimeout(() => setPublishStatus("idle"), 3000);
    },
    onError: () => setPublishStatus("error"),
  });

  // ── VB-008: Block order handlers (defined after saveMutation) ────────────
  const moveBlock = useCallback((fromIdx: number, toIdx: number) => {
    if (!puckData) return;
    const content = [...puckData.content];
    const [removed] = content.splice(fromIdx, 1);
    content.splice(toIdx, 0, removed);
    const newData: Data = { ...puckData, content };
    setPuckData(newData);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveMutation.mutate(newData), 2000);
  }, [puckData, saveMutation]);

  const deleteBlock = useCallback((idx: number) => {
    if (!puckData) return;
    const content = puckData.content.filter((_, i) => i !== idx);
    const newData: Data = { ...puckData, content };
    setPuckData(newData);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveMutation.mutate(newData), 2000);
  }, [puckData, saveMutation]);

  // ── VB-009: Insert template block ────────────────────────────────────────
  const insertTemplate = useCallback((tpl: BlockTemplate) => {
    if (!puckData) return;
    const newBlock = {
      type: tpl.blockType,
      props: { id: `tpl-${Date.now()}`, ...tpl.props },
    };
    const newData: Data = { ...puckData, content: [...puckData.content, newBlock] };
    setPuckData(newData);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveMutation.mutate(newData), 2000);
  }, [puckData, saveMutation]);

  // ── Auto-save every 10s on data change ───────────────────────────────────
  const handleChange = useCallback(
    (data: Data) => {
      setPuckData(data);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveMutation.mutate(data);
      }, 10_000);
    },
    [saveMutation]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading || puckData === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500">Loading builder…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="font-semibold text-zinc-800">Failed to load course</p>
          <p className="mt-1 text-sm text-zinc-500">{(error as Error).message}</p>
          <button
            onClick={() => router.push("/instructor")}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Preview mode ─────────────────────────────────────────────────────────
  if (isPreview) {
    return (
      <div className="min-h-screen bg-zinc-50">
        {/* Preview top bar — thin, clean */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-0 h-12">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Preview
            </span>
            <span className="text-sm font-medium text-zinc-700 truncate max-w-md">
              {course?.title}
            </span>
          </div>
          <button
            onClick={() => router.push(`/instructor/builder/${courseId}`)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            ← Editor
          </button>
        </div>
        {/* Preview canvas */}
        <div className="mx-auto max-w-3xl px-6 py-12 space-y-4">
          <Render config={vokasiPuckConfig} data={puckData} />
        </div>
      </div>
    );
  }

  // ── Editor mode ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-white">
      {/* ── Top bar — OpenRouter-inspired ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 h-[52px]">

        {/* Left: logo mark + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push("/instructor")}
            className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-zinc-300">/</span>
          <span className="truncate text-sm font-medium text-zinc-800 max-w-[320px]">
            {course?.title ?? "Course Builder"}
          </span>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2">

          {/* VB-009: Block Templates */}
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showTemplates
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <LayoutTemplate size={13} />
            Templates
          </button>

          {/* AM-005: Analytics */}
          <button
            onClick={() => { setShowAnalytics((v) => !v); if (!showAnalytics) loadAnalytics(); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showAnalytics
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <BarChart2 size={13} />
            Analytics
          </button>

          {/* VB-008: Block List */}
          <button
            onClick={() => setShowBlockList((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showBlockList
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <List size={13} />
            Blocks
          </button>

          {/* VB-006: View as Student */}
          <button
            onClick={() => window.open(`/courses/${courseId}/learn/puck`, "_blank")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <Eye size={13} />
            Student View
          </button>

          {/* VB-007: History */}
          <button
            onClick={() => { setShowHistory(true); loadVersions(); }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <History size={13} />
            History
          </button>

          {/* AI-007: Improve Block with AI */}
          <button
            onClick={() => { setRegenPrompt(""); setRegenStatus("idle"); setShowRegenPanel(true); }}
            disabled={!puckData || puckData.content.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-40"
          >
            <Wand2 size={13} />
            Improve
          </button>

          {/* AI Generate button */}
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Sparkles size={13} />
            AI Generate
          </button>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          {/* Auto-save status — subtle text only, like Linear */}
          <span className={`text-xs transition-colors ${
            saveStatus === "saving"  ? "text-amber-500" :
            saveStatus === "saved"   ? "text-emerald-600" :
            saveStatus === "error"   ? "text-red-500" :
                                       "text-zinc-400"
          }`}>
            {saveStatus === "saving"  ? "Saving…"    :
             saveStatus === "saved"   ? "Saved ✓"    :
             saveStatus === "error"   ? "Save error" :
                                        "Auto-save on"}
          </span>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          {/* Save draft */}
          <button
            onClick={() => puckData && saveMutation.mutate(puckData)}
            disabled={saveMutation.isPending}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40"
          >
            Save Draft
          </button>

          {/* Preview */}
          <button
            onClick={() => router.push(`/instructor/builder/${courseId}?preview=true`)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>

          {/* AM-004: SCORM Export */}
          <a
            href={`${API_BASE}/api/v1/puck/courses/${courseId}/scorm-export`}
            download
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Download size={13} />
            SCORM
          </a>

          {/* Publish — solid black CTA, OpenRouter-style */}
          <button
            onClick={() => puckData && publishMutation.mutate(puckData)}
            disabled={publishMutation.isPending}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
              publishStatus === "published"
                ? "bg-emerald-600 text-white"
                : publishStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-white hover:bg-zinc-700"
            }`}
          >
            {publishStatus === "publishing" ? (
              <><span className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" /> Publishing…</>
            ) : publishStatus === "published" ? (
              <>✓ Published</>
            ) : publishStatus === "error" ? (
              <>✗ Failed</>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Publish
              </>
            )}
          </button>
        </div>
      </header>

      {/* AM-005: Analytics Panel — right drawer */}
      {showAnalytics && (
        <div className="fixed right-0 top-[52px] bottom-0 z-40 flex flex-col w-80 bg-white border-l border-zinc-200 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-blue-500" />
              <span className="text-sm font-bold text-zinc-900">Course Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAnalytics}
                className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1"
                title="Refresh"
              >
                <RefreshCw size={11} />
              </button>
              <button onClick={() => setShowAnalytics(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={16} />
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            </div>
          ) : analyticsData ? (
            <div className="flex-1 overflow-y-auto">
              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-2 p-4">
                {[
                  { icon: <Users size={13} className="text-blue-500" />, label: "Learners", val: analyticsData.unique_learners, bg: "bg-blue-50" },
                  { icon: <BarChart2 size={13} className="text-emerald-500" />, label: "Avg Progress", val: `${analyticsData.avg_completion_pct}%`, bg: "bg-emerald-50" },
                  { icon: <Award size={13} className="text-amber-500" />, label: "Certificates", val: analyticsData.certificates_issued, bg: "bg-amber-50" },
                  { icon: <FileText size={13} className="text-teal-500" />, label: "Reflections", val: analyticsData.reflections_submitted, bg: "bg-teal-50" },
                ].map(({ icon, label, val, bg }) => (
                  <div key={label} className={`rounded-xl ${bg} px-3 py-2.5`}>
                    <div className="flex items-center gap-1 mb-1">{icon}<span className="text-[10px] text-zinc-500">{label}</span></div>
                    <p className="text-lg font-bold text-zinc-900 leading-none">{val}</p>
                  </div>
                ))}
              </div>

              {/* Per-block heatmap */}
              <div className="px-4 pb-2">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-2">Per-Block Completion</p>
                {analyticsData.block_analytics.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4 text-center">No learner data yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {analyticsData.block_analytics.map((b) => {
                      const pct = b.completion_rate;
                      const heatColor =
                        pct >= 80 ? "bg-emerald-500" :
                        pct >= 50 ? "bg-blue-400" :
                        pct >= 20 ? "bg-amber-400" :
                        "bg-red-400";
                      const BLOCK_ABBR: Record<string, string> = {
                        ModuleHeader: "Header", RichContent: "Content", VideoBlock: "Video",
                        SocraticChat: "AI Chat", QuizBuilder: "Quiz", CodeSandbox: "Code",
                        PeerReviewRubric: "Peer", ReflectionJournal: "Reflect",
                        Assignment: "Assign", DiscussionSeed: "Discuss",
                      };
                      const label = BLOCK_ABBR[b.block_type] ?? b.block_type;
                      return (
                        <div key={b.block_id} className="group flex items-center gap-2">
                          <span className="w-5 text-[10px] text-zinc-400 text-right shrink-0">{b.index}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] text-zinc-600 truncate">{label}</span>
                              <span className="text-[10px] font-semibold text-zinc-500 ml-1 shrink-0">{pct}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${heatColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 shrink-0">{b.completed_learners}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="px-4 pb-4 pt-3 border-t border-zinc-100 mt-3">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Heatmap key</p>
                <div className="flex gap-2">
                  {[
                    { color: "bg-emerald-500", label: "≥80%" },
                    { color: "bg-blue-400", label: "50%" },
                    { color: "bg-amber-400", label: "20%" },
                    { color: "bg-red-400", label: "<20%" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                      <span className="text-[10px] text-zinc-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-xs text-zinc-400">Failed to load analytics.</p>
            </div>
          )}
        </div>
      )}

      {/* VB-008: Block Order Panel — left drawer */}
      {showBlockList && puckData && (
        <div className="fixed left-0 top-[52px] bottom-0 z-40 flex flex-col w-72 bg-white border-r border-zinc-200 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <List size={14} className="text-zinc-500" />
              <span className="text-sm font-bold text-zinc-900">Block Order</span>
              <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                {puckData!.content.length}
              </span>
            </div>
            <button onClick={() => setShowBlockList(false)} className="text-zinc-400 hover:text-zinc-700">
              <X size={16} />
            </button>
          </div>
          <p className="px-4 py-2 text-[10px] text-zinc-400 border-b border-zinc-100 shrink-0">
            Use ↑↓ to reorder. Changes auto-save in 2s.
          </p>
          <div className="flex-1 overflow-y-auto py-2">
            {puckData!.content.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-zinc-400">No blocks yet. Use the editor to add blocks.</p>
            )}
            {puckData!.content.map((block, i) => {
              const blockType = (block as { type?: string }).type ?? "Block";
              const blockId = (block as { props?: { id?: string } }).props?.id ?? `block-${i}`;
              const BLOCK_COLORS: Record<string, string> = {
                ModuleHeader: "bg-zinc-900 text-white",
                RichContent: "bg-blue-600 text-white",
                VideoBlock: "bg-red-500 text-white",
                SocraticChat: "bg-indigo-600 text-white",
                QuizBuilder: "bg-amber-500 text-white",
                CodeSandbox: "bg-zinc-700 text-white",
                PeerReviewRubric: "bg-pink-500 text-white",
                ReflectionJournal: "bg-teal-600 text-white",
                Assignment: "bg-orange-500 text-white",
                DiscussionSeed: "bg-violet-600 text-white",
              };
              const colorCls = BLOCK_COLORS[blockType] ?? "bg-zinc-500 text-white";
              const isFirst = i === 0;
              const isLast = i === puckData!.content.length - 1;

              return (
                <div
                  key={blockId}
                  className="group mx-2 mb-1 flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 hover:border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  {/* Drag handle (visual only) */}
                  <GripVertical size={13} className="text-zinc-300 shrink-0 cursor-grab" />

                  {/* Block type badge */}
                  <div className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorCls}`}>
                    {blockType.replace(/([A-Z])/g, " $1").trim().slice(0, 10)}
                  </div>

                  {/* Block index */}
                  <span className="flex-1 min-w-0 text-xs text-zinc-500 truncate">
                    #{i + 1}
                  </span>

                  {/* Controls */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* AI-007: Improve with AI */}
                    <button
                      onClick={() => { setRegenBlockIdx(i); setRegenPrompt(""); setRegenStatus("idle"); setShowRegenPanel(true); }}
                      className="rounded p-1 text-zinc-400 hover:bg-violet-100 hover:text-violet-600"
                      title="Improve with AI"
                    >
                      <Wand2 size={12} />
                    </button>
                    <button
                      onClick={() => moveBlock(i, i - 1)}
                      disabled={isFirst}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => moveBlock(i, i + 1)}
                      disabled={isLast}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete block #${i + 1} (${blockType})?`)) deleteBlock(i);
                      }}
                      className="rounded p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600"
                      title="Delete block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI-005: Regenerate Block Panel */}
      {showRegenPanel && puckData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Wand2 size={16} className="text-violet-600" />
                <h2 className="text-base font-bold text-zinc-900">Improve Block with AI</h2>
              </div>
              <button onClick={() => setShowRegenPanel(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Select a block and describe how to improve it. All other blocks are preserved.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Block to Improve</label>
                <select
                  value={regenBlockIdx}
                  onChange={(e) => setRegenBlockIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  {puckData.content.map((b, i) => {
                    const bt = (b as { type?: string }).type ?? "Block";
                    const bid = (b as { props?: { id?: string } }).props?.id ?? `block-${i}`;
                    return <option key={bid} value={i}>{i + 1}. {bt}</option>;
                  })}
                </select>
              </div>

              {/* AI-007: Quick-prompt chips per block type */}
              {(() => {
                const selType = (puckData.content[regenBlockIdx] as { type?: string })?.type ?? "";
                const QUICK_PROMPTS: Record<string, string[]> = {
                  QuizBuilder: [
                    "Add 2 harder questions",
                    "Translate all questions to Bahasa Indonesia",
                    "Add a trick question to test deeper understanding",
                    "Increase passing score to 80%",
                  ],
                  ReflectionJournal: [
                    "Make the prompt more thought-provoking",
                    "Translate the prompt to Bahasa Indonesia",
                    "Add a follow-up question asking for real examples",
                    "Increase minimum words to 200",
                  ],
                  Assignment: [
                    "Make the instructions clearer and more detailed",
                    "Add a grading rubric breakdown",
                    "Translate instructions to Bahasa Indonesia",
                    "Add a real-world scenario context",
                  ],
                  RichContent: [
                    "Add a summary section at the end",
                    "Make the language simpler for beginners",
                    "Translate all content to Bahasa Indonesia",
                    "Add key takeaways as a bullet list",
                  ],
                  SocraticChat: [
                    "Make the seed question more open-ended",
                    "Translate the seed question to Bahasa Indonesia",
                    "Increase max turns to 8",
                    "Rewrite to focus on a real workplace scenario",
                  ],
                  ModuleHeader: [
                    "Add 2 more learning objectives",
                    "Translate to Bahasa Indonesia",
                    "Make the subtitle more engaging",
                    "Increase estimated minutes to 60",
                  ],
                  DiscussionSeed: [
                    "Make the opening post more provocative",
                    "Translate to Bahasa Indonesia",
                    "Add a guiding question for replies",
                    "Require 3 peer replies instead of 2",
                  ],
                  VideoBlock: [
                    "Improve the caption to be more descriptive",
                    "Translate the caption to Bahasa Indonesia",
                    "Add a note encouraging students to take notes",
                  ],
                  CodeSandbox: [
                    "Make the starter code more challenging",
                    "Translate instructions to Bahasa Indonesia",
                    "Add a hint in the starter code comments",
                    "Change language to JavaScript",
                  ],
                  PeerReviewRubric: [
                    "Add a 4th criterion for Originality",
                    "Translate to Bahasa Indonesia",
                    "Increase max points for Depth to 30",
                    "Make the instructions more specific",
                  ],
                };
                const chips = QUICK_PROMPTS[selType] ?? [];
                if (chips.length === 0) return null;
                return (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Quick improvements</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setRegenPrompt(chip)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            regenPrompt === chip
                              ? "border-violet-500 bg-violet-100 text-violet-700"
                              : "border-zinc-200 text-zinc-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Custom Instruction</label>
                <textarea
                  value={regenPrompt}
                  onChange={(e) => setRegenPrompt(e.target.value)}
                  placeholder="e.g. Make this quiz harder with 5 questions about common misconceptions"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
              {regenStatus === "error" && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{regenError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowRegenPanel(false)} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateBlock}
                  disabled={regenStatus === "loading" || !regenPrompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {regenStatus === "loading" ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/40 border-t-white" /> Regenerating…</>
                  ) : (
                    <><RefreshCw size={14} /> Regenerate</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VB-007: Version History Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 backdrop-blur-sm">
          <div className="h-full w-full max-w-sm bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <History size={16} className="text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-900">Version History</h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                </div>
              ) : versions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-500">No published versions yet.</p>
                  <p className="mt-1 text-xs text-zinc-400">Publish the course to create a snapshot.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {versions.map((v) => (
                    <li key={v.version_number} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-800">v{v.version_number}</p>
                        <p className="text-xs text-zinc-500">
                          {v.published_at ? new Date(v.published_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                        </p>
                        {v.published_by && <p className="text-xs text-zinc-400">{v.published_by}</p>}
                      </div>
                      <button
                        onClick={() => restoreVersion(v.version_number)}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Restore <ChevronRight size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal — two-step */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-600" />
                <h2 className="text-base font-bold text-zinc-900">Generate Course with AI</h2>
              </div>
              <button onClick={resetGenModal} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-5 mt-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${outlineStep === "prompt" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"}`}>1</span>
              <span className="text-xs text-zinc-500">Deskripsi</span>
              <div className="flex-1 h-px bg-zinc-200" />
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${outlineStep === "outline" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>2</span>
              <span className="text-xs text-zinc-500">Outline</span>
            </div>

            {/* ── Step 1: Prompt ── */}
            {outlineStep === "prompt" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Deskripsi Kursus</label>
                  <textarea
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="e.g. Modul 3 minggu tentang Kecerdasan Buatan untuk siswa SMK Teknik Komputer kelas 11"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Target Audience</label>
                  <select
                    value={genAudience}
                    onChange={(e) => setGenAudience(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Beginner">Pemula (Beginner)</option>
                    <option value="Intermediate">Menengah (Intermediate)</option>
                    <option value="Advanced">Lanjutan (Advanced)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={resetGenModal} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                    Batal
                  </button>
                  <button
                    onClick={handleSuggestOutline}
                    disabled={outlineLoading || !genPrompt.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {outlineLoading ? (
                      <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/40 border-t-white" /> Memuat…</>
                    ) : (
                      <><Sparkles size={14} /> Sarankan Outline →</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Outline checklist ── */}
            {outlineStep === "outline" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500">
                  AI menyarankan urutan blok berikut. Centang/hapus centang untuk menyesuaikan, lalu klik <strong>Generate</strong>.
                </p>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {outlineItems.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOutlineItems(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                      className={`w-full flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        item.enabled
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-zinc-200 bg-zinc-50 opacity-50"
                      }`}
                    >
                      <span className="text-base leading-none mt-0.5">{BLOCK_ICON[item.type] ?? "📦"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-800">{item.type}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{item.description}</p>
                        {item.reason && <p className="text-[11px] text-emerald-700 italic mt-0.5">"{item.reason}"</p>}
                      </div>
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center ${item.enabled ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"}`}>
                        {item.enabled && <span className="text-[9px] text-white font-bold">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-zinc-400">
                  {outlineItems.filter(b => b.enabled).length} dari {outlineItems.length} blok dipilih
                </p>

                {genStatus === "error" && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{genError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setOutlineStep("prompt")}
                    className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={genStatus === "loading" || outlineItems.filter(b => b.enabled).length === 0}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {genStatus === "loading" ? (
                      <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/40 border-t-white" /> Generating…</>
                    ) : (
                      <><Sparkles size={14} /> Generate Course</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VB-009: Block Templates Panel */}
      {showTemplates && (
        <div className="fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-zinc-200 bg-white shadow-2xl" style={{ top: 52 }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate size={15} className="text-violet-600" />
              <span className="text-sm font-bold text-zinc-900">Block Templates</span>
            </div>
            <button onClick={() => setShowTemplates(false)} className="text-zinc-400 hover:text-zinc-700">
              <X size={16} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 border-b border-zinc-200 px-4 py-2 overflow-x-auto">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTemplateCat(cat.id)}
                className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  templateCat === cat.id
                    ? "bg-violet-600 text-white"
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {BLOCK_TEMPLATES.filter((t) => t.category === templateCat).map((tpl) => (
              <div
                key={tpl.id}
                className="group rounded-xl border border-zinc-200 bg-white p-3 hover:border-violet-300 hover:bg-violet-50/40 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none mt-0.5">{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800">{tpl.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-4">{tpl.description}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{tpl.blockType}</p>
                  </div>
                </div>
                <button
                  onClick={() => { insertTemplate(tpl); setShowTemplates(false); }}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Plus size={11} /> Insert Block
                </button>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="border-t border-zinc-100 px-5 py-3">
            <p className="text-[10px] text-zinc-400">Block is appended to the end of your course. Reorder via Blocks panel.</p>
          </div>
        </div>
      )}

      {/* Puck editor — fills remaining height */}
      <div className="puck-root flex-1 overflow-hidden">
        <Puck
          config={vokasiPuckConfig}
          data={puckData}
          onChange={handleChange}
          onPublish={(data) => publishMutation.mutate(data)}
        />
      </div>
    </div>
  );
}

// ─── Page export (wraps with QueryClientProvider) ────────────────────────────

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : (params.courseId as string);

  return (
    <QueryClientProvider client={queryClient}>
      <BuilderInner courseId={courseId} />
    </QueryClientProvider>
  );
}
