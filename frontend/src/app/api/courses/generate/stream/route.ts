// GET /api/courses/generate/stream — SSE streaming course generation
// Supports both Fast (single-pass) and Heavy (multi-stage) modes
// Events: stage, progress, block, complete, error

import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { generateFast, type PuckBlock } from "@/lib/openrouter";
import { generateHeavy } from "@/lib/heavy-generator";

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userResult = await pool.query(
    `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
    [token]
  );
  if (userResult.rows.length === 0) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse query params
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "Untitled Course";
  const description = url.searchParams.get("description") ?? "";
  const domain = url.searchParams.get("domain") ?? undefined;
  const targetAudience = url.searchParams.get("targetAudience") ?? undefined;
  const courseGoals = url.searchParams.get("courseGoals") ?? undefined;
  const mode = (url.searchParams.get("mode") ?? "fast") as "fast" | "heavy";
  const modelParam = url.searchParams.get("model") ?? undefined;

  if (!["fast", "heavy"].includes(mode)) {
    return new Response(JSON.stringify({ error: "Invalid mode. Use 'fast' or 'heavy'." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build source content from title + description + goals
  const sourceContent = [
    title && `Course Title: ${title}`,
    description && `Description: ${description}`,
    domain && `Domain: ${domain}`,
    targetAudience && `Target Audience: ${targetAudience}`,
    courseGoals && `Course Goals:\n${courseGoals}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE events
      const send = (event: string, data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller may be closed if client disconnects
        }
      };

      try {
        send("stage", { stage: "starting", message: `Starting ${mode} generation...`, percent: 0 });

        let blocks: PuckBlock[];

        if (mode === "fast") {
          // Fast mode: single-pass generation
          send("stage", { stage: "generating", message: "Generating course content...", percent: 10 });

          blocks = await generateFast({
            content: sourceContent,
            title,
            domain,
            targetAudience,
            courseGoals,
            model: modelParam,
          });

          // Emit blocks incrementally (fast mode returns all at once, but we stream them)
          blocks.forEach((block, i) => {
            send("block", { index: i, block });
            send("progress", {
              percent: Math.round(10 + (80 * (i + 1)) / blocks.length),
              current: i + 1,
              total: blocks.length,
            });
          });

          send("stage", { stage: "complete", message: "Generation complete!", percent: 100 });
        } else {
          // Heavy mode: multi-stage pipeline with streaming
          blocks = await generateHeavy({
            content: sourceContent,
            title,
            domain,
            targetAudience,
            courseGoals,
            model: modelParam,
            onStage: (stage, message, percent) => {
              send("stage", { stage, message, percent });
            },
            onBlock: (index, block) => {
              send("block", { index, block });
            },
          });

          send("stage", { stage: "complete", message: "Heavy generation complete!", percent: 100 });
        }

        // Send final complete event
        send("complete", {
          blocks,
          summary: `Generated ${blocks.length} blocks for "${title}" using ${mode} mode.`,
          blockCount: blocks.length,
          moduleCount: blocks.filter((b) => b.type === "ModuleHeader").length,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Course Generation Error]", message);
        send("error", { message, stage: "error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
