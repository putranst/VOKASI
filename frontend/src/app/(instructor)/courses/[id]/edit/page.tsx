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
} from "lucide-react";

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

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"outline" | "competencies">("outline");

  useEffect(() => {
    // Load demo course — in production, fetch from /api/courses/[id]
    setCourse({
      id: courseId,
      title: "AI Fundamentals for Vocational Students",
      description: "Introduction to prompt engineering and AI workflows",
      status: "draft",
      structure: [
        { id: "m1", type: "module", title: "Module 1: Introduction to AI" },
        { id: "m2", type: "module", title: "Module 2: Prompt Engineering Basics" },
        { id: "m3", type: "module", title: "Module 3: Evaluating AI Output" },
      ],
      competencyWeights: { prompt_engineering: 30, model_evaluation: 20, data_analysis: 10,
        workflow_automation: 15, critical_thinking: 10, creative_problem_solving: 5,
        communication: 5, collaboration: 5 },
      puckData: {
        content: [
          { type: "ModuleHeader", props: { title: "Module 1: Introduction to AI", subtitle: "Getting started", learningObjectives: "Understand AI fundamentals\nApply basic concepts", estimatedMinutes: 45 } },
          { type: "RichContent", props: { html: "<p>Welcome to the AI Fundamentals course. In this module, you will learn the basics of artificial intelligence, how AI models work, and how to interact with them effectively.</p>" } },
          { type: "QuizBuilder", props: { quizTitle: "Module 1 Quiz", questions: [{ question: "What is a prompt?", options: "A command to a computer\nA question asked to an AI\nA programming language\nA type of software", correctIndex: 1 }], passingScore: 70 } },
        ],
      },
    });
    setLoading(false);
  }, [courseId]);
  const token = useAuthStore((s) => s.token);
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

  const handlePublish = async () => {
    if (!course) return;
    setCourse({ ...course, status: course.status === "published" ? "draft" : "published" });
    setHasChanges(true);
  };

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
          <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e]" onClick={save} disabled={saving || !hasChanges}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

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