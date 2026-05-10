// POST /api/sandbox/[id]/log-mistake
// Append an error to the sandbox mistake_log, linked to a submission
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sandboxId } = await params;
    const { errorDescription, stackTrace, studentReflection, relatedSubmissionId } = await req.json();

    if (!errorDescription?.trim()) {
      return NextResponse.json({ error: "errorDescription is required" }, { status: 400 });
    }

    // Verify user owns this sandbox session
    const sessionResult = await pool.query(
      `SELECT s.id, s.user_id FROM sandbox_sessions s
       JOIN auth_tokens t ON t.user_id = s.user_id
       WHERE s.id = $1 AND t.token = $2`,
      [sandboxId, token]
    );
    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: "Sandbox not found" }, { status: 404 });
    }
    const userId = sessionResult.rows[0].user_id;

    const mistakeEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      errorDescription: errorDescription.trim(),
      stackTrace: stackTrace ?? null,
      studentReflection: studentReflection ?? null,
      relatedSubmissionId: relatedSubmissionId ?? null,
    };

    // Append to sandbox_sessions.mistake_log
    const result = await pool.query(
      `UPDATE sandbox_sessions
       SET mistake_log = mistake_log || $1::jsonb
       WHERE id = $2
       RETURNING mistake_log`,
      [JSON.stringify([mistakeEntry]), sandboxId]
    );

    // If linked to a submission, also add a reflection note to that submission
    if (relatedSubmissionId) {
      const reflectionNote = `🔴 Mistake logged from sandbox (${new Date().toISOString()}): ${errorDescription.trim()}${studentReflection ? `\n\nStudent reflection: ${studentReflection}` : ""}`;

      await pool.query(
        `UPDATE submissions
         SET reflection = COALESCE(reflection, '') || E'\n\n' || $1,
             reflection_prompt_triggered = true
         WHERE id = $2 AND user_id = $3`,
        [reflectionNote, relatedSubmissionId, userId]
      );
    }

    return NextResponse.json({
      entry: mistakeEntry,
      totalMistakes: (result.rows[0].mistake_log as unknown[]).length,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/sandbox/[id]/mistake-log
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sandboxId } = await params;

    const result = await pool.query(
      `SELECT s.mistake_log FROM sandbox_sessions s
       JOIN auth_tokens t ON t.user_id = s.user_id
       WHERE s.id = $1 AND t.token = $2`,
      [sandboxId, token]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      mistakes: result.rows[0].mistake_log ?? [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
