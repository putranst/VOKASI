"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Sparkles, Loader2, ChevronRight, BookOpen, Target, Zap, FileUp } from "lucide-react";
import dynamic from "next/dynamic";
import type { PuckBlock } from "@/lib/openrouter";

const GenerationProgress = dynamic(
  () => import("@/components/courses/GenerationProgress").then((m) => m.GenerationProgress),
  { ssr: false }
);

const TemplateBrowser = dynamic(
  () => import("@/components/templates/TemplateBrowser").then((m) => m.TemplateBrowser),
  { ssr: false }
);

const DocumentUploader = dynamic(
  () => import("@/components/documents/DocumentUploader").then((m) => m.DocumentUploader),
  { ssr: false }
);

const DOMAINS = [
  "Prompt Engineering", "Model Evaluation", "Data Analysis",
  "Workflow Automation", "Critical Thinking", "Creative Problem Solving",
  "AI-Human Collaboration", "Ethical AI Use",
];

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

type CreationMode = "ai" | "template" | "document";

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generating, setGenerating] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationMode>("ai");
  const [generationMode, setGenerationMode] = useState<"fast" | "heavy">("fast");
  const [generatedBlocks, setGeneratedBlocks] = useState<PuckBlock[] | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    domain: "",
    targetAudience: "",
    courseGoals: "",
    competencyWeights: {} as Record<string, number>,
  });
  const token = useAuthStore((s) => s.token);

  // Build SSE URL for streaming generation
  const getStreamUrl = useCallback(() => {
    const params = new URLSearchParams({
      title: form.title,
      mode: generationMode,
    });
    if (form.description) params.set("description", form.description);
    if (form.domain) params.set("domain", form.domain);
    if (form.targetAudience) params.set("targetAudience", form.targetAudience);
    if (form.courseGoals) params.set("courseGoals", form.courseGoals);
    return `/api/courses/generate/stream?${params.toString()}`;
  }, [form, generationMode]);

  // Save course with generated blocks
  const saveCourseWithBlocks = useCallback(
    async (blocks: PuckBlock[]) => {
      setGenerating(true);
      try {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...form,
            generateWithAI: false,
            puckData: { content: blocks },
          }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/instructor/courses/${data.id}/edit`);
        } else {
          alert(data.error || "Failed to save course");
        }
      } catch {
        alert("Network error — please try again");
      } finally {
        setGenerating(false);
      }
    },
    [form, token, router]
  );

  // Legacy: create via existing API (no streaming)
  const handleCreate = async (withAi = false) => {
    if (!form.title.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...form, generateWithAI: withAi }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/instructor/courses/${data.id}/edit`);
      } else {
        alert(data.error || "Failed to create course");
      }
    } catch {
      alert("Network error — please try again");
    } finally {
      setGenerating(false);
    }
  };

  const weightTotal = Object.values(form.competencyWeights).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Create New Course</h1>
        <p className="text-sm text-zinc-500 mt-1">Fill in the basics, then design your curriculum with AI assistance</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Course Info" },
          { n: 2, label: "Source & Mode" },
          { n: 3, label: "Competencies" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${step >= s.n ? "bg-[#0d9488] text-white" : "bg-zinc-100 text-zinc-400"}`}
            >
              {s.n} — {s.label}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-zinc-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Course Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0d9488]" /> Course Information
            </CardTitle>
            <CardDescription>Tell us about your course so we can personalize the AI generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g. AI Fundamentals for Indonesian Vocational Students"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="What will students learn and be able to do after this course?"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Primary Domain</Label>
                <select
                  id="domain"
                  className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                >
                  <option value="">Select domain…</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Grade 11 SMK students"
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Course Goals (one per line)</Label>
              <Textarea
                id="goals"
                placeholder={"Students will be able to write effective prompts\nStudents will evaluate AI output quality…"}
                rows={4}
                value={form.courseGoals}
                onChange={(e) => setForm({ ...form, courseGoals: e.target.value })}
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e]"
              disabled={!form.title.trim()}
            >
              Continue to Source & Mode →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Source & Mode Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0d9488]" /> Course Source
            </CardTitle>
            <CardDescription>Choose how to create your course content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source selection */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setCreationMode("ai"); setShowTemplates(false); setShowUploader(false); }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  creationMode === "ai" ? "border-[#0d9488] bg-[#0d9488]/5" : "hover:bg-muted/50"
                }`}
              >
                <Sparkles className="w-5 h-5 mb-2 text-[#0d9488]" />
                <p className="font-medium text-sm">AI Generate</p>
                <p className="text-xs text-muted-foreground">Generate from your description</p>
              </button>
              <button
                onClick={() => { setCreationMode("template"); setShowTemplates(true); setShowUploader(false); }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  creationMode === "template" ? "border-[#0d9488] bg-[#0d9488]/5" : "hover:bg-muted/50"
                }`}
              >
                <BookOpen className="w-5 h-5 mb-2 text-[#0d9488]" />
                <p className="font-medium text-sm">From Template</p>
                <p className="text-xs text-muted-foreground">Start from a proven structure</p>
              </button>
              <button
                onClick={() => { setCreationMode("document"); setShowTemplates(false); setShowUploader(true); }}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  creationMode === "document" ? "border-[#0d9488] bg-[#0d9488]/5" : "hover:bg-muted/50"
                }`}
              >
                <FileUp className="w-5 h-5 mb-2 text-[#0d9488]" />
                <p className="font-medium text-sm">Import Document</p>
                <p className="text-xs text-muted-foreground">Upload PDF/DOCX/PPTX</p>
              </button>
            </div>

            {/* AI mode selector */}
            {creationMode === "ai" && (
              <div className="space-y-3">
                <Label>Generation Quality</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGenerationMode("fast")}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      generationMode === "fast" ? "border-[#0d9488] bg-[#0d9488]/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-medium text-sm">⚡ Quick Draft</p>
                    <p className="text-xs text-muted-foreground">~30 seconds. Single-pass generation.</p>
                  </button>
                  <button
                    onClick={() => setGenerationMode("heavy")}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      generationMode === "heavy" ? "border-[#0d9488] bg-[#0d9488]/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-medium text-sm">🔬 High Quality</p>
                    <p className="text-xs text-muted-foreground">~2-3 min. Multi-stage with validation.</p>
                  </button>
                </div>
              </div>
            )}

            {/* Template browser */}
            {showTemplates && (
              <TemplateBrowser
                onBlocksReady={(blocks, templateName) => {
                  setGeneratedBlocks(blocks);
                  setCreationMode("template");
                }}
                initialTitle={form.title}
                initialDomain={form.domain}
              />
            )}

            {/* Document uploader */}
            {showUploader && (
              <DocumentUploader
                onBlocksReady={(blocks, title) => {
                  setGeneratedBlocks(blocks);
                  if (!form.title) setForm({ ...form, title });
                }}
              />
            )}

            {/* Generation progress (streaming) */}
            {creationMode === "ai" && generating && (
              <GenerationProgress
                endpoint={getStreamUrl()}
                onComplete={(result) => {
                  setGeneratedBlocks(result.blocks);
                  setGenerating(false);
                }}
                onError={() => setGenerating(false)}
                autoStart={true}
              />
            )}

            {/* Generated blocks preview */}
            {generatedBlocks && (
              <div className="rounded-lg border border-green-500/25 bg-green-50/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <p className="font-medium text-sm">
                    {generatedBlocks.length} blocks ready
                  </p>
                </div>
                <Button
                  onClick={() => saveCourseWithBlocks(generatedBlocks)}
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e]"
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    "Save Course & Continue to Editor →"
                  )}
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Back
              </Button>
              {creationMode === "ai" && !generating && !generatedBlocks && (
                <Button
                  onClick={() => { setStep(3); }}
                  className="flex-1 bg-[#0d9488] hover:bg-[#0f766e]"
                  disabled={!form.title.trim()}
                >
                  Continue to Competencies →
                </Button>
              )}
              {(creationMode === "template" || creationMode === "document") && generatedBlocks && (
                <Button variant="ghost" onClick={() => setStep(3)}>
                  Skip to Competencies →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Competencies */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0d9488]" /> Competency Weights
            </CardTitle>
            <CardDescription>
              Adjust how much each competency is emphasized. Total: {weightTotal}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {COMPETENCIES.map((comp) => (
              <div key={comp.key} className="flex items-center gap-4">
                <span className="w-44 text-sm text-zinc-700 shrink-0">{comp.label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.competencyWeights[comp.key] ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      competencyWeights: {
                        ...form.competencyWeights,
                        [comp.key]: parseInt(e.target.value),
                      },
                    })
                  }
                  className="flex-1 accent-[#0d9488]"
                />
                <span className="w-10 text-sm text-zinc-500 text-right">
                  {form.competencyWeights[comp.key] ?? 0}%
                </span>
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-3">
              {generatedBlocks ? (
                <Button
                  onClick={() => saveCourseWithBlocks(generatedBlocks)}
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e]"
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Save Course with {generatedBlocks.length} Blocks</>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleCreate(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800"
                    disabled={generating}
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Create Empty Course
                  </Button>
                  <Button
                    onClick={() => { setStep(2); setCreationMode("ai"); }}
                    className="w-full bg-[#0d9488] hover:bg-[#0f766e]"
                    disabled={generating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Generate with AI First
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => setStep(2)} className="w-full">
                ← Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI generation tip */}
      {step === 2 && creationMode === "ai" && !generating && !generatedBlocks && (
        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900 mb-1">AI Course Generation</p>
            <p className="text-xs text-indigo-700">
              Choose Quick Draft (~30s) for fast iteration or High Quality (~2-3min) for publication-ready
              content with multi-stage validation. You can also import from a template or upload a document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
