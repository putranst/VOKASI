"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { PuckBlock } from "@/lib/openrouter";

const DocumentUploader = dynamic(
  () => import("@/components/documents/DocumentUploader").then((m) => m.DocumentUploader),
  { ssr: false }
);

interface Document {
  id: string;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("/api/documents", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleBlocksReady = useCallback((blocks: PuckBlock[], title: string) => {
    console.log(`Received ${blocks.length} blocks for "${title}"`);
    // TODO: Navigate to course editor with blocks
    setShowUploader(false);
    fetchDocuments();
  }, [fetchDocuments]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      uploaded: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };
    return styles[status] ?? "bg-gray-100 text-gray-700";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Import</h1>
          <p className="text-muted-foreground">
            Upload PDFs, DOCX, or PPTX files to auto-generate course content.
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {showUploader ? "Close" : "+ Upload Document"}
        </button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <DocumentUploader onBlocksReady={handleBlocksReady} />
      )}

      {/* Document list */}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Your Documents</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No documents uploaded yet. Upload a PDF, DOCX, or PPTX to get started.
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {doc.file_type === "pdf" ? "📄" : doc.file_type === "docx" ? "📝" : "📊"}
                  </span>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.filename} · {formatSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
