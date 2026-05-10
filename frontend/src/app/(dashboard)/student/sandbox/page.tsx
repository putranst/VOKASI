"use client";
import dynamic from "next/dynamic";

const SandboxTemplateBrowser = dynamic(
  () => import("@/components/sandbox/SandboxTemplateBrowser").then((m) => m.SandboxTemplateBrowser),
  { ssr: false }
);

export default function SandboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Sandbox</h1>
        <p className="text-muted-foreground">
          Choose a template to start coding, or use an empty playground to experiment freely.
        </p>
      </div>

      <SandboxTemplateBrowser />
    </div>
  );
}
