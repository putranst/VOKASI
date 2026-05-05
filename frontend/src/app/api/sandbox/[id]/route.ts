// GET/POST /api/sandbox/[id]
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await pool.query(
      `SELECT s.* FROM sandbox_sessions s
       JOIN auth_tokens t ON t.user_id = s.user_id
       WHERE s.id = $1 AND t.token = $2`,
      [id, token]
    );

    if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = await req.json();

    if (action === "terminate") {
      await pool.query(
        `UPDATE sandbox_sessions SET status = 'terminated' WHERE id = $1 AND user_id = (SELECT user_id FROM auth_tokens WHERE token = $2)`,
        [id, token]
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "save") {
      const { content } = await req.json();
      await pool.query(
        `UPDATE sandbox_sessions SET version_history = version_history || $1::jsonb
         WHERE id = $2 AND user_id = (SELECT user_id FROM auth_tokens WHERE token = $3)`,
        [JSON.stringify([{ content, timestamp: new Date().toISOString() }]), id, token]
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}