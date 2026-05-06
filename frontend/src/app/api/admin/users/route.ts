// GET /api/admin/users
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const institutionId = searchParams.get("institutionId");
    const search = searchParams.get("search");

    let query = `SELECT u.id, u.full_name, u.email, u.role, u.status, u.created_at, i.name as institution_name,
      (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.user_id = u.id) as enrollment_count
      FROM users u LEFT JOIN institutions i ON i.id = u.institution_id WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;
    if (role) { query += ` AND u.role = $${idx++}`; params.push(role); }
    if (institutionId) { query += ` AND u.institution_id = $${idx++}`; params.push(institutionId); }
    if (search) { query += ` AND (u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    query += " ORDER BY u.created_at DESC LIMIT 100";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
