"use client";

import { useState, useCallback } from "react";
import type { PuckBlock } from "@/lib/openrouter";

interface Template {
  id: string;
  template_code: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  usage_count: number;
  average_rating: number;
  match_score?: number;
  match_explanation?: string;
}

interface TemplateBrowserProps {
  /** Called when user selects a template and blocks are ready */
  onBlocksReady: (blocks: PuckBlock[], templateName: string) => void;
  /** Pre-fill search requirements */
  initialTitle?: string;
  initialDomain?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  tech: "💻",
  business: "💼",
  creative: "🎨",
  science: "🔬",
  health: "🏥",
  education: "📚",
};

export function TemplateBrowser({ onBlocksReady, initialTitle, initialDomain }: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [customizing, setCustomizing] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [domain, setDomain] = useState(initialDomain ?? "");
  const [error, setError] = useState<string | null>(null);

  const searchTemplates = useCallback(async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/templates/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, domain }),
      });

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setTemplates(data);
      setSearched(true);
    } catch {
      setError("Failed to search templates");
    } finally {
      setLoading(false);
    }
  }, [title, domain]);

  const useTemplate = useCallback(
    async (template: Template) => {
      setCustomizing(template.id);
      setError(null);

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`/api/templates/${template.id}/customize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ title, domain }),
        });

        if (!res.ok) throw new Error("Customization failed");
        const data = await res.json();
        onBlocksReady(data.blocks, template.name);
      } catch {
        setError(`Failed to customize "${template.name}"`);
      } finally {
        setCustomizing(null);
      }
    },
    [title, domain, onBlocksReady]
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium">Search Templates</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title or topic..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && searchTemplates()}
          />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Domain (e.g., tech, business)"
            className="w-40 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={searchTemplates}
            disabled={loading || !title.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Template grid */}
      {searched && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? "s" : ""} found
          </p>

          {templates.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No matching templates found. Try a different search or create a course from scratch.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border p-4 space-y-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_EMOJI[t.category] ?? "📦"}</span>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{t.category}</p>
                      </div>
                    </div>
                    {t.match_score !== undefined && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {Math.round(t.match_score * 100)}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>

                  {t.match_explanation && (
                    <p className="text-xs text-muted-foreground italic">{t.match_explanation}</p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Used {t.usage_count} time{t.usage_count !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => useTemplate(t)}
                      disabled={customizing === t.id}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {customizing === t.id ? "Customizing..." : "Use Template"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
