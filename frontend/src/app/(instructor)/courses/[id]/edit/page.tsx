"use client";
/**
 * VOKASI2 — Puck Visual Course Editor
 * PRD v2.3 §5.3 Visual Course Builder
 */
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Eye, EyeOff, Loader2, BookOpen,
  BarChart3, ChevronRight, GripVertical, Plus, Trash2,
  Sparkles, Wand2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlockRefiner } from "@/components/courses/BlockRefiner";
import type { PuckBlock } from "@/lib/openrouter";

// Dynamically import Puck to avoid SSR issues
const PuckEditor = dynamic(() => import("@/components/puck/PuckEditor"), { ssr: false });

interface CourseOutlineItem { id: string; type: "module" | "lesson"; title: string; }
interface CourseData {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  structure: CourseOutlineItem[];
  competencyWeights: Record<string, number>;
  puckData: Record<string, unknown>;
}

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useAuthStore();
  const token = useAuthStore((s) => s.token);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"outline" | "competencies">("outline");
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiGoals, setAiGoals] = useState("");

  // BlockRefiner state
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();

        // Map API response to CourseData
        const mapped: CourseData = {
          id: data.id ?? courseId,
          title: data.title ?? "Untitled Course",
          description: data.description ?? "",
          status: data.status ?? "draft",
          structure: data.structure ?? [],
          competencyWeights: data.competency_weights ?? data.competencyWeights ?? {},
          puckData: data.puck_content ?? data.puckData ?? { content: [] },
        };
        setCourse(mapped);
      } catch (err) {
        console.error("Failed to load course:", err);
        // Fallback to empty course so the editor is still usable
        setCourse({
          id: courseId,
          title: "Untitled Course",
          description: "",
          status: "draft",
          structure: [],
          competencyWeights: {},
          puckData: { content: [] },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, token]);

  const save = useCallback(async () => {
    if (!course) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title: course.title, description: course.description, status: course.status, structure: course.structure, competencyWeights: course.competencyWeights }),
      });
      if (res.ok) setHasChanges(false);
      else alert("Failed to save — please try again");
    } finally {
      setSaving(false);
    }
  }, [course, token]);

  const handleAIGenerate = async () => {
    if (!token || !aiTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic: aiTopic,
          audience: aiAudience || "Siswa SMK/SMA semester awal yang baru belajar AI",
          goals: aiGoals || "Memahami konsep dasar AI, bisa menulis prompt yang efektif, dan mengevaluasi output AI",
          domainTags: [],
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      const generated = data.puckData ?? data;
      // Update course with generated content
      setCourse((prev) => prev ? {
        ...prev,
        title: data.title ?? prev.title,
        description: data.description ?? prev.description,
        puckData: generated,
        structure: data.structure ?? prev.structure,
        competencyWeights: data.competencyWeights ?? prev.competencyWeights,
      } : prev);
      setShowAIGenerate(false);
      setAiTopic("");
    } catch (err) {
      console.error(err);
      alert("Gagal membuat konten dengan AI. Coba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!course) return;
    setCourse({ ...course, status: course.status === "published" ? "draft" : "published" });
    setHasChanges(true);
  };

  // BlockRefiner: get current puck content blocks
  const puckContent: PuckBlock[] =
    course && (course.puckData as Record<string, unknown>)?.content
      ? ((course.puckData as Record<string, unknown>).content as PuckBlock[])
      : [];

  // BlockRefiner: handle block selection from selector dialog
  const handleSelectBlock = (index: number) => {
    setSelectedBlockIndex(index);
    setShowBlockSelector(false);
  };

  // BlockRefiner: handle refined content applied
  const handleBlockRefined = useCallback(
    (blockIndex: number, refinedContent: Record<string, unknown>) => {
      setCourse((prev) => {
        if (!prev) return prev;
        const pd = prev.puckData as Record<string, unknown>;
        const content = [...((pd.content ?? []) as PuckBlock[])];
        if (blockIndex < 0 || blockIndex >= content.length) return prev;
        content[blockIndex] = { ...content[blockIndex], props: refinedContent };
        return { ...prev, puckData: { ...pd, content } };
      });
      setHasChanges(true);
      setSelectedBlockIndex(null);
    },
    []
  );

  // BlockRefiner: close refiner modal
  const handleCloseRefiner = useCallback(() => {
    setSelectedBlockIndex(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d9488]" />
      </div>
    );
  }

  if (!course) return null;

  const COMPETENCIES = [
    { key: "prompt_engineering", label: "Prompt Engineering" },
    { key: "model_evaluation", label: "Model Evaluation" },
    { key: "data_analysis", label: "Data Analysis" },
    { key: "workflow_automation", label: "Workflow Automation" },
    { key: "critical_thinking", label: "Critical Thinking" },
    { key: "creative_problem_solving", label: "Creative Problem Solving" },
    { key: "communication", label: "Communication" },
    { key: "collaboration", label: "Collaboration" },
    { key: "research_literacy", label: "Research Literacy" },
    { key: "technical_writing", label: "Technical Writing" },
    { key: "ai_human_collaboration", label: "AI-Human Collaboration" },
    { key: "ethical_ai_use", label: "Ethical AI Use" },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Editor Topbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/instructor/courses" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="w-4 h-4" /> Courses
          </Link>
          <ChevronRight className="w-4 h-4 text-zinc-300" />
          <span className="text-sm font-medium text-zinc-900 max-w-[300px] truncate">{course.title}</span>
          <Badge variant={course.status === "published" ? "default" : "secondary"}
            className={course.status === "published" ? "bg-emerald-100 text-emerald-700": "bg-zinc-100 text-zinc-500"}>
            {course.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePublish}>
            {course.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
            onClick={() => setShowAIGenerate(true)}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate with AI
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            onClick={() => setShowBlockSelector(true)}
          >
            <Wand2 className="w-4 h-4 mr-1.5" />
            Refine Block
          </Button>
          <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e]" onClick={save} disabled={saving || !hasChanges}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* AI Generate Modal */}
      <Dialog open={showAIGenerate} onOpenChange={setShowAIGenerate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Generate Kursus dengan AI
            </DialogTitle>
            <DialogDescription>
              AI akan membuat outline kursus dan konten Puck Editor berdasarkan topik dan tujuan pembelajaranmu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="ai-topic">Topik Kursus *</Label>
              <Input
                id="ai-topic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Contoh: Prompt Engineering untuk AI Generatif"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ai-audience">Target Audiens</Label>
              <Input
                id="ai-audience"
                value={aiAudience}
                onChange={(e) => setAiAudience(e.target.value)}
                placeholder="Contoh: Siswa SMK semester 4 yang sudah pernah pakai ChatGPT"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ai-goals">Tujuan Pembelajaran</Label>
              <Textarea
                id="ai-goals"
                value={aiGoals}
                onChange={(e) => setAiGoals(e.target.value)}
                placeholder={"Contoh: 1. Pahami apa itu prompt engineering\n2. Bisa tulis prompt yang menghasilkan output berkualitas\n3. Evaluasi dan iterate prompt"}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIGenerate(false)}>
              Batal
            </Button>
            <Button
              className="bg-[#0d9488] hover:bg-[#0f766e]"
              onClick={handleAIGenerate}
              disabled={generating || !aiTopic.trim()}
            >
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {generating ? "Generating..." : "Generate Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Selector Dialog */}
      <Dialog open={showBlockSelector} onOpenChange={setShowBlockSelector}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-amber-500" />
              Select a Block to Refine
            </DialogTitle>
            <DialogDescription>
              Choose a content block from the course editor to refine with AI.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2 py-2">
            {puckContent.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No blocks found. Add content in the editor first.</p>
            ) : (
              puckContent.map((block, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectBlock(i)}
                  className="w-full flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-left hover:bg-amber-50 hover:border-amber-200 transition-colors"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 text-xs font-medium text-zinc-600 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {block.type}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {(() => {
                        const p = block.props as Record<string, unknown>;
                        const label = p.title ?? p.quizTitle ?? p.html ?? p.label ?? "";
                        const s = typeof label === "string" ? label : JSON.stringify(label);
                        return s.length > 60 ? s.slice(0, 60) + "…" : s || "No preview";
                      })()}
                    </p>
                  </div>
                  <Wand2 className="w-4 h-4 text-zinc-300 shrink-0" />
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockSelector(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BlockRefiner Modal */}
      {selectedBlockIndex !== null && selectedBlockIndex < puckContent.length && (
        <BlockRefiner
          block={puckContent[selectedBlockIndex]}
          blockIndex={selectedBlockIndex}
          courseId={courseId}
          onRefined={handleBlockRefined}
          onClose={handleCloseRefiner}
        />
      )}

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Course Outline */}
        <aside className="w-64 border-r border-zinc-200 bg-zinc-50 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Course Outline</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {course.structure.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-100 cursor-pointer group text-sm">
                <GripVertical className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.type === "module" ? "bg-[#0d9488]" : "bg-zinc-300"}`} />
                <span className="flex-1 text-zinc-700 truncate text-xs">{item.title}</span>
                <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button className="mt-2 flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <Plus className="w-3.5 h-3.5" /> Add Module
            </button>
          </div>

          <div className="p-3 border-t border-zinc-200">
            <button
              onClick={() => setActiveTab(activeTab === "outline" ? "competencies" : "outline")}
              className="flex items-center gap-2 text-xs text-[#0d9488] hover:text-[#0f766e] font-medium">
              <BarChart3 className="w-3.5 h-3.5" />
              {activeTab === "outline" ? "View Competencies" : "View Outline"}
            </button>
          </div>

          {activeTab === "competencies" && (
            <div className="p-3 border-t border-zinc-200 bg-white max-h-60 overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Competency Weights</p>
              {COMPETENCIES.map((c) => (
                <div key={c.key} className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-600">{c.label}</span>
                  <span className="text-xs font-medium text-[#0d9488]">{course.competencyWeights[c.key] ?? 0}%</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Center — Puck Editor */}
        <div className="flex-1 overflow-hidden">
          {previewMode ? (
            <div className="h-full overflow-y-auto bg-white p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">{course.title}</h1>
                <p className="text-zinc-500 mb-8">{course.description}</p>
                <div className="text-sm text-zinc-400">Preview mode — click "Exit Preview" to edit</div>
              </div>
            </div>
          ) : (
            <PuckEditor
              initialData={course.puckData || { content: [], zones: {}, float: [] }}
              onChange={(data) => { setHasChanges(true); setCourse({ ...course, puckData: data }); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
