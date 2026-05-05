// POST /api/tutor/chat — streaming SocraticChat
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { socraticChatStream } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    const { sessionId, message, mode, context } = await req.json();

    // Get session messages for context
    let messages: { role: string; content: string }[] = [];
    if (sessionId) {
      const msgResult = await pool.query(
        `SELECT role, content FROM tutor_messages WHERE session_id = $1 ORDER BY created_at ASC`,
        [sessionId]
      );
      messages = msgResult.rows;
    }

    messages.push({ role: "user", content: message });

    const streamResponse = await socraticChatStream(
      messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      mode ?? "guide"
    );

    if (!streamResponse.ok) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    // For streaming, we proxy the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = streamResponse.body?.getReader();
        if (!reader) { controller.close(); return; }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("Tutor chat error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}