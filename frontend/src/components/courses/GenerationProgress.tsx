"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PuckBlock } from "@/lib/openrouter";

interface StageEvent {
  stage: string;
  message: string;
  percent: number;
}

interface BlockEvent {
  index: number;
  block: PuckBlock;
}

interface CompleteEvent {
  blocks: PuckBlock[];
  summary: string;
  blockCount: number;
  moduleCount: number;
}

interface ErrorEvent {
  message: string;
  stage: string;
}

interface GenerationProgressProps {
  /** SSE endpoint URL (without auth — token is added automatically) */
  endpoint: string;
  /** Called when generation completes */
  onComplete: (result: CompleteEvent) => void;
  /** Called on error */
  onError?: (error: ErrorEvent) => void;
  /** Auto-start on mount */
  autoStart?: boolean;
}

export function GenerationProgress({
  endpoint,
  onComplete,
  onError,
  autoStart = true,
}: GenerationProgressProps) {
  const [stage, setStage] = useState<StageEvent | null>(null);
  const [progress, setProgress] = useState(0);
  const [blocks, setBlocks] = useState<PuckBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startGeneration = useCallback(() => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setBlocks([]);
    setStage(null);

    // Get auth token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const url = token ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}token=${token}` : endpoint;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("stage", (e) => {
      const data: StageEvent = JSON.parse(e.data);
      setStage(data);
      setProgress(data.percent);
    });

    eventSource.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      setProgress(data.percent);
    });

    eventSource.addEventListener("block", (e) => {
      const data: BlockEvent = JSON.parse(e.data);
      setBlocks((prev) => {
        const next = [...prev];
        next[data.index] = data.block;
        return next;
      });
    });

    eventSource.addEventListener("complete", (e) => {
      const data: CompleteEvent = JSON.parse(e.data);
      setProgress(100);
      setIsGenerating(false);
      eventSource.close();
      onComplete(data);
    });

    eventSource.addEventListener("error", (e) => {
      // EventSource error — could be SSE error or connection issue
      if (e instanceof MessageEvent && e.data) {
        try {
          const data: ErrorEvent = JSON.parse(e.data);
          setError(data.message);
          onError?.(data);
        } catch {
          setError("Generation failed — unknown error");
        }
      } else {
        setError("Connection lost. Please try again.");
      }
      setIsGenerating(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      if (isGenerating) {
        setError("Connection error. Please try again.");
        setIsGenerating(false);
        eventSource.close();
      }
    };
  }, [endpoint, onComplete, onError, isGenerating]);

  const cancelGeneration = useCallback(() => {
    eventSourceRef.current?.close();
    setIsGenerating(false);
    setError("Generation cancelled.");
  }, []);

  useEffect(() => {
    if (autoStart) {
      startGeneration();
    }
    return () => {
      eventSourceRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Block type emoji mapping
  const blockEmoji: Record<string, string> = {
    ModuleHeader: "📚",
    RichContent: "📝",
    VideoBlock: "🎬",
    QuizBuilder: "❓",
    CodeSandbox: "💻",
    Assignment: "📋",
    ReflectionJournal: "🪞",
    DiscussionSeed: "💬",
    PeerReviewRubric: "📊",
    SocraticChat: "🤖",
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isGenerating ? "Generating Course..." : error ? "Generation Failed" : "Generation Complete"}
        </h3>
        {isGenerating && (
          <button
            onClick={cancelGeneration}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stage?.message ?? "Preparing..."}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button
            onClick={startGeneration}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Generated blocks preview */}
      {blocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Generated Blocks ({blocks.filter(Boolean).length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {blocks.filter(Boolean).map((block, i) => (
              <div
                key={i}
                className="rounded-md border bg-muted/50 p-2 text-xs space-y-1"
              >
                <span className="text-base">{blockEmoji[block.type] ?? "📦"}</span>
                <p className="font-medium truncate">{block.type}</p>
                {"title" in (block.props ?? {}) && (
                  <p className="text-muted-foreground truncate">
                    {(block.props as Record<string, unknown>).title as string}
                  </p>
                )}
                {"quizTitle" in (block.props ?? {}) && (
                  <p className="text-muted-foreground truncate">
                    {(block.props as Record<string, unknown>).quizTitle as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage indicator dots */}
      {isGenerating && (
        <div className="flex items-center gap-1.5 pt-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
        </div>
      )}
    </div>
  );
}
