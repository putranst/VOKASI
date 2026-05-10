// GET /api/documents — List user's uploaded documents

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = userResult.rows[0].id;

    // Get user's documents
    const result = await pool.query(
      `SELECT id, title, filename, file_type, file_size, status, error_message, created_at, updated_at
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("[Documents List Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
