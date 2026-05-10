"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

interface SandboxTemplate {
  id: string;
  template_code: string;
  name: string;
  description: string;
  language: string;
  category: string;
  difficulty: string;
  instructions: string;
  starter_files: { filename: string; content: string; language: string }[];
  tags: string[];
  estimated_minutes: number;
  usage_count: number;
}

const LANGUAGE_EMOJI: Record<string, string> = {
  python: "🐍",
  javascript: "⚡",
  typescript: "🔷",
  java: "☕",
  sql: "🗄️",
  no_code: "🧩",
};

const CATEGORY_LABELS: Record<string, string> = {
  exercise: "Exercise",
  project: "Project",
  playground: "Playground",
  challenge: "Challenge",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

interface SandboxTemplateBrowserProps {
  onTemplateSelect?: (template: SandboxTemplate) => void;
}

export function SandboxTemplateBrowser({ onTemplateSelect }: SandboxTemplateBrowserProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const [templates, setTemplates] = useState<SandboxTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [starting, setStarting] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (languageFilter) params.set("language", languageFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);

      const res = await fetch(`/api/sandbox/templates?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  }, [token, languageFilter, categoryFilter, difficultyFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const startSandbox = useCallback(
    async (template: SandboxTemplate) => {
      setStarting(template.template_code);
      try {
        const res = await fetch("/api/sandbox/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ templateCode: template.template_code }),
        });

        if (res.ok) {
          const session = await res.json();
          if (onTemplateSelect) {
            onTemplateSelect(template);
          } else {
            router.push(`/student/sandbox/${session.id}`);
          }
        } else {
          alert("Failed to start sandbox");
        }
      } catch {
        alert("Network error");
      } finally {
        setStarting(null);
      }
    },
    [token, router, onTemplateSelect]
  );

  // Get unique values for filters
  const languages = [...new Set(templates.map((t) => t.language))];
  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_EMOJI[l] ?? "📦"} {l}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] ?? c}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Template grid */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No templates found. Try different filters.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border p-4 space-y-2 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{LANGUAGE_EMOJI[t.language] ?? "📦"}</span>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.language}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[t.difficulty] ?? "bg-gray-100"}`}>
                  {t.difficulty}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>

              <div className="flex flex-wrap gap-1">
                {t.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expandable instructions */}
              {expandedTemplate === t.id && (
                <div className="rounded-md bg-muted/50 p-3 text-xs">
                  <p className="font-medium mb-1">Instructions:</p>
                  <pre className="whitespace-pre-wrap text-muted-foreground max-h-32 overflow-auto">
                    {t.instructions}
                  </pre>
                  {t.starter_files.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Files:</p>
                      {t.starter_files.map((f) => (
                        <div key={f.filename} className="flex items-center gap-1 text-muted-foreground">
                          <span>📄</span> {f.filename}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {t.estimated_minutes > 0 && <span>⏱ {t.estimated_minutes}min</span>}
                  <span>Used {t.usage_count}x</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)}
                    className="rounded border px-2 py-1 text-xs hover:bg-muted/50"
                  >
                    {expandedTemplate === t.id ? "Less" : "Preview"}
                  </button>
                  <button
                    onClick={() => startSandbox(t)}
                    disabled={starting === t.template_code}
                    className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {starting === t.template_code ? "Starting..." : "Start"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
