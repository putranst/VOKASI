"use client";
/**
 * VOKASI2 — Puck Editor Wrapper
 * SSR-safe dynamic import wrapper
 */
import { Puck } from "@measured/puck";
import { vokasiPuckConfig } from "@/lib/puck/config";
import "@measured/puck/dist/index.css";
import "./puck-override.css";

interface PuckEditorProps {
  initialData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function PuckEditor({ initialData, onChange }: PuckEditorProps) {
  return (
    <div className="h-full [&_.PuckEditor_row]:h-full">
      <Puck
        config={vokasiPuckConfig}
        data={initialData as Parameters<typeof Puck>[0]["data"]}
        onChange={(data) => onChange(data as Record<string, unknown>)}
        header={{ title: null, description: null }}
      />
    </div>
  );
}