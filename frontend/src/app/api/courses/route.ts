// GET/POST /api/courses
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name as instructor_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollment_count
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       WHERE c.status = 'published'
       ORDER BY c.created_at DESC
       LIMIT 50`
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

    const userResult = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role } = userResult.rows[0];
    if (role !== "instructor" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, structure, competencyWeights, institutionId } = await req.json();

    const result = await pool.query(
      `INSERT INTO courses (title, description, instructor_id, structure, competency_weights, institution_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description ?? "", userId, JSON.stringify(structure ?? []), JSON.stringify(competencyWeights ?? {}), institutionId ?? null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}