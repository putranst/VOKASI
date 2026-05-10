// GET /api/badges, POST /api/badges
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userRes = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`, [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;
    const result = await pool.query(
      `SELECT b.*, ub.awarded_at, ub.badge_id as user_badge_id
       FROM badges b LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
       ORDER BY b.category, b.name`, [userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userRes = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`, [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role } = userRes.rows[0];
    if (role !== "admin" && role !== "instructor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { userId: targetUserId, badgeId } = await req.json();
    if (!targetUserId || !badgeId) return NextResponse.json({ error: "userId and badgeId required" }, { status: 400 });
    const result = await pool.query(
      `INSERT INTO user_badges (user_id, badge_id, awarded_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, badge_id) DO NOTHING RETURNING *`, [targetUserId, badgeId]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
