// POST /api/sandbox/start
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

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

    const { templateId } = await req.json();

    // Terminate any existing active sessions for this user
    await pool.query(
      `UPDATE sandbox_sessions SET status = 'terminated' WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Create new session (container provisioning is handled by sandbox-worker service)
    const result = await pool.query(
      `INSERT INTO sandbox_sessions (user_id, template_id, status, expires_at)
       VALUES ($1, $2, 'active', NOW() + INTERVAL '2 hours')
       RETURNING id, user_id, template_id, status, created_at, expires_at`,
      [userId, templateId ?? "jupyter"]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}