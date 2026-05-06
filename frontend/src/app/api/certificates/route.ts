// GET /api/certificates — list user certificates
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import crypto from "crypto";

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

    const result = await pool.query(
      `SELECT cert.*, c.title as course_title, u.full_name as instructor_name, i.name as institution_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = c.instructor_id
       JOIN institutions i ON i.id = c.institution_id
       WHERE cert.user_id = $1
       ORDER BY cert.issued_at DESC`,
      [userId]
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
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;

    const { courseId, competencyScore } = await req.json();

    // Check if certificate already exists
    const existing = await pool.query(
      "SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
    if (existing.rows.length) return NextResponse.json({ error: "Certificate already issued" }, { status: 409 });

    // Check if course is completed (all modules done)
    const completionCheck = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM modules WHERE course_id = $1) as total_modules,
        (SELECT COUNT(*) FROM lesson_completions lc JOIN modules m ON m.id = lc.module_id WHERE m.course_id = $1 AND lc.user_id = $2) as completed`,
      [courseId, userId]
    );
    const { total_modules, completed } = completionCheck.rows[0];
    if (completed < total_modules) {
      return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    const grade = competencyScore >= 75 ? "Meritorious" : competencyScore >= 65 ? "Competent" : "Proficient";
    const certId = `VOKASI2-${courseId.slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;

    const result = await pool.query(
      `INSERT INTO certificates (user_id, course_id, competency_score, grade, certificate_id, issued_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [userId, courseId, competencyScore, grade, certId]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
