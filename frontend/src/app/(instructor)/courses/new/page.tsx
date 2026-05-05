"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Sparkles, Loader2, ChevronRight, BookOpen, Target, Zap } from "lucide-react";

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

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    domain: "",
    targetAudience: "",
    courseGoals: "",
    competencyWeights: {} as Record<string, number>,
  });
  const token = useAuthStore((s) => s.token);
  const handleCreate = async (withAi = false) => {
    if (!form.title.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
        {[{ n: 1, label: "Course Info" }, { n: 2, label: "Competencies" }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${step >= s.n ? "bg-[#0d9488] text-white" : "bg-zinc-100 text-zinc-400"}`}>
              {s.n} — {s.label}
            </div>
            {i < 1 && <ChevronRight className="w-4 h-4 text-zinc-300" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#0d9488]" /> Course Information</CardTitle>
            <CardDescription>Tell us about your course so we can personalize the AI generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input id="title" placeholder="e.g. AI Fundamentals for Indonesian Vocational Students"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" placeholder="What will students learn and be able to do after this course?"
                rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Primary Domain</Label>
                <select id="domain" className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                  value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}>
                  <option value="">Select domain…</option>
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input id="audience" placeholder="e.g. Grade 11 SMK students"
                  value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Course Goals (one per line)</Label>
              <Textarea id="goals" placeholder="Students will be able to write effective prompts\nStudents will evaluate AI output quality…"
                rows={4} value={form.courseGoals} onChange={(e) => setForm({ ...form, courseGoals: e.target.value })} />
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-[#0d9488] hover:bg-[#0f766e]" disabled={!form.title.trim()}>
              Continue to Competencies →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-[#0d9488]" /> Competency Weights</CardTitle>
            <CardDescription>Adjust how much each competency is emphasized. Total: {weightTotal}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {COMPETENCIES.map((comp) => (
              <div key={comp.key} className="flex items-center gap-4">
                <span className="w-44 text-sm text-zinc-700 shrink-0">{comp.label}</span>
                <input type="range" min={0} max={100} value={form.competencyWeights[comp.key] ?? 0}
                  onChange={(e) => setForm({ ...form, competencyWeights: { ...form.competencyWeights, [comp.key]: parseInt(e.target.value) } })}
                  className="flex-1 accent-[#0d9488]" />
                <span className="w-10 text-sm text-zinc-500 text-right">{form.competencyWeights[comp.key] ?? 0}%</span>
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={() => handleCreate(false)}
                className="w-full bg-zinc-900 hover:bg-zinc-800" disabled={generating}>
                <BookOpen className="w-4 h-4 mr-2" /> Create Empty Course
              </Button>
              <Button onClick={() => handleCreate(true)}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e]" disabled={generating}>
                {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>}
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full">← Back</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI generation preview tip */}
      {step === 2 && (
        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900 mb-1">AI Course Generation</p>
            <p className="text-xs text-indigo-700">Describe your course above, then click &quot;Generate with AI&quot; — VOKASI2 will create a full curriculum with modules, lessons, and competency-mapped blocks using OpenRouter.</p>
          </div>
        </div>
      )}
    </div>
  );
}