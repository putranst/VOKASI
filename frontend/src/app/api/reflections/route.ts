// GET/POST /api/reflections
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    let query = `SELECT r.*, c.title as course_title
      FROM reflections r
      LEFT JOIN courses c ON c.id = r.course_id
      WHERE r.user_id = $1`;
    const params: unknown[] = [userId];
    if (courseId) { query += " AND r.course_id = $2"; params.push(courseId); }
    query += " ORDER BY r.week_number DESC, r.created_at DESC";

    const result = await pool.query(query, params);
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
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;

    const { weekNumber, weekLabel, challenges, learnings, nextWeekGoals, courseId, competencyGrowth } = await req.json();

    const result = await pool.query(
      `INSERT INTO reflections (user_id, course_id, week_number, week_label, challenges, learnings, next_week_goals, competency_growth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, courseId ?? null, weekNumber ?? 1, weekLabel, challenges, learnings, nextWeekGoals, JSON.stringify(competencyGrowth ?? {})]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
