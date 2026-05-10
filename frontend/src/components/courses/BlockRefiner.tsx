"use client";

import { useState, useCallback } from "react";
import type { PuckBlock } from "@/lib/openrouter";

interface BlockRefinerProps {
  /** The block being refined */
  block: PuckBlock;
  /** Block index in the course */
  blockIndex: number;
  /** Course ID for API calls */
  courseId?: string;
  /** Called with refined block content */
  onRefined: (blockIndex: number, refinedContent: Record<string, unknown>) => void;
  /** Called to close the refiner */
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "Simplify", instruction: "Simplify the content. Use shorter sentences and easier vocabulary." },
  { label: "Add Examples", instruction: "Add 2-3 practical, real-world examples to illustrate the concepts." },
  { label: "Make Interactive", instruction: "Add interactive elements — questions to think about, hands-on exercises, or reflection prompts." },
  { label: "Add Quiz", instruction: "Add a 3-question quiz at the end of this content to test understanding." },
  { label: "More Detail", instruction: "Expand the content with more depth, details, and explanations." },
  { label: "Indonesian", instruction: "Translate and adapt the content for Indonesian learners. Use Bahasa Indonesia with English technical terms where appropriate." },
];

export function BlockRefiner({ block, blockIndex, courseId, onRefined, onClose }: BlockRefinerProps) {
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedContent, setRefinedContent] = useState<Record<string, unknown> | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const refine = useCallback(
    async (customInstructions?: string) => {
      const text = customInstructions ?? instructions;
      if (!text.trim()) return;

      setIsRefining(true);
      setError(null);
      setRefinedContent(null);

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const endpoint = courseId
          ? `/api/courses/${courseId}/blocks/refine`
          : `/api/courses/blocks/refine`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            blockIndex,
            blockType: block.type,
            currentContent: block.props,
            instructions: text,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Refinement failed");
        }

        const data = await res.json();
        setRefinedContent(data.refinedContent);
        setShowDiff(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refinement failed");
      } finally {
        setIsRefining(false);
      }
    },
    [instructions, block, blockIndex, courseId]
  );

  const applyRefinement = useCallback(() => {
    if (refinedContent) {
      onRefined(blockIndex, refinedContent);
      onClose();
    }
  }, [refinedContent, blockIndex, onRefined, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-medium">Refine Block</h3>
            <p className="text-xs text-muted-foreground">
              {block.type} — Block #{blockIndex + 1}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Quick actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => refine(action.instruction)}
                  disabled={isRefining}
                  className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted/50 disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom instruction */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Custom Instructions</p>
            <div className="flex gap-2">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe how you want to change this block..."
                rows={3}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
            <button
              onClick={() => refine()}
              disabled={isRefining || !instructions.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isRefining ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Refining...
                </span>
              ) : (
                "Refine"
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Diff view */}
          {showDiff && refinedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Changes</p>
                <div className="flex gap-2">
                  <button
                    onClick={applyRefinement}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    ✓ Apply
                  </button>
                  <button
                    onClick={() => {
                      setRefinedContent(null);
                      setShowDiff(false);
                    }}
                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted/50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => refine()}
                    disabled={isRefining}
                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted/50"
                  >
                    Refine Again
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Before</p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(block.props, null, 2)}
                  </pre>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-green-600">After</p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-green-50 p-3 text-xs dark:bg-green-950/20">
                    {JSON.stringify(refinedContent, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
