// GET /api/enrollments, POST /api/enrollments
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
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    let query = `SELECT e.*, c.title as course_title, c.status as course_status,
      u.full_name as instructor_name, i.name as institution_name,
      (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count,
      (SELECT COUNT(*) FROM lesson_completions lc JOIN modules m ON m.id = lc.module_id WHERE m.course_id = c.id AND lc.user_id = e.user_id) as completed_modules
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON u.id = c.instructor_id
      JOIN institutions i ON i.id = c.institution_id
      WHERE e.user_id = $1`;
    const params: unknown[] = [userId];
    let idx = 2;
    if (status) { query += ` AND e.status = $${idx++}`; params.push(status); }
    if (courseId) { query += ` AND e.course_id = $${idx++}`; params.push(courseId); }
    query += " ORDER BY e.enrolled_at DESC";

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

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    // Check if already enrolled
    const existing = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
    if (existing.rows.length) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

    const result = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
       VALUES ($1, $2, 'enrolled', NOW()) RETURNING *`,
      [userId, courseId]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
