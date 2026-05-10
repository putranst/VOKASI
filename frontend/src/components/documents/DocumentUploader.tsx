"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PuckBlock } from "@/lib/openrouter";
import { GenerationProgress } from "@/components/courses/GenerationProgress";

interface UploadState {
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  documentId?: string;
  error?: string;
  blocks?: PuckBlock[];
}

interface DocumentUploaderProps {
  /** Called when blocks are ready to import into course */
  onBlocksReady?: (blocks: PuckBlock[], title: string) => void;
  /** Redirect to course editor after import */
  courseId?: string;
}

const ACCEPTED_TYPES = ".pdf,.docx,.pptx";

export function DocumentUploader({ onBlocksReady, courseId }: DocumentUploaderProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [mode, setMode] = useState<"fast" | "heavy">("fast");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "docx", "pptx"].includes(ext)) {
      setState({ status: "error", error: "Unsupported file type. Please upload PDF, DOCX, or PPTX." });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setState({ status: "error", error: "File too large. Maximum size is 50MB." });
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    setState({ status: "idle" });
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setState({ status: "uploading" });
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (title) formData.append("title", title);
    if (domain) formData.append("domain", domain);
    formData.append("mode", mode);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }

      const data = await res.json();
      setState({ status: "processing", documentId: data.documentId });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }, [selectedFile, title, domain, mode]);

  const handleProcessingComplete = useCallback((result: { blocks: PuckBlock[] }) => {
    setState({ status: "complete", blocks: result.blocks });
    if (onBlocksReady) {
      onBlocksReady(result.blocks, title);
    }
  }, [onBlocksReady, title]);

  const handleImportToCourse = useCallback(() => {
    if (state.blocks && courseId) {
      // TODO: Call API to merge blocks into course
      router.push(`/instructor/courses/${courseId}/edit`);
    }
  }, [state.blocks, courseId, router]);

  // File size formatter
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // File type icon
  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf": return "📄";
      case "docx": return "📝";
      case "pptx": return "📊";
      default: return "📎";
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : selectedFile
            ? "border-green-500 bg-green-50/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {selectedFile ? (
          <div className="space-y-2">
            <span className="text-4xl">{fileIcon(selectedFile.name)}</span>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(selectedFile.size)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setState({ status: "idle" });
              }}
              className="text-sm text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-4xl">📤</span>
            <p className="font-medium">Drop your document here or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF, DOCX, or PPTX — max 50MB</p>
          </div>
        )}
      </div>

      {/* Options */}
      {selectedFile && state.status === "idle" && (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Web Development Fundamentals"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Domain (optional)</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., Technology, Business, Design"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Generation Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("fast")}
                className={`flex-1 rounded-md border p-3 text-left transition-colors ${
                  mode === "fast" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <p className="font-medium">⚡ Quick Draft</p>
                <p className="text-xs text-muted-foreground">~30 seconds. Good for drafts.</p>
              </button>
              <button
                onClick={() => setMode("heavy")}
                className={`flex-1 rounded-md border p-3 text-left transition-colors ${
                  mode === "heavy" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <p className="font-medium">🔬 High Quality</p>
                <p className="text-xs text-muted-foreground">~2-3 min. Multi-stage with validation.</p>
              </button>
            </div>
          </div>

          <button
            onClick={handleUpload}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Generate Course Content
          </button>
        </div>
      )}

      {/* Upload progress */}
      {state.status === "uploading" && (
        <div className="rounded-lg border p-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Uploading document...</p>
        </div>
      )}

      {/* Processing progress (SSE) */}
      {state.status === "processing" && state.documentId && (
        <GenerationProgress
          endpoint={`/api/documents/${state.documentId}/blocks/stream`}
          onComplete={handleProcessingComplete}
          onError={(err) => setState({ status: "error", error: err.message })}
          autoStart={false}
        />
      )}

      {/* Complete */}
      {state.status === "complete" && state.blocks && (
        <div className="rounded-lg border border-green-500/25 bg-green-50/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <p className="font-medium">Generation Complete!</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Generated {state.blocks.length} blocks from your document.
          </p>
          <div className="flex gap-2">
            {onBlocksReady && (
              <button
                onClick={() => onBlocksReady(state.blocks!, title)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Use These Blocks
              </button>
            )}
            {courseId && (
              <button
                onClick={handleImportToCourse}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                Import to Course
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && state.error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{state.error}</p>
          <button
            onClick={() => setState({ status: "idle" })}
            className="mt-2 text-sm text-muted-foreground hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
