// GET /api/admin/users — admin-only
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminCheck = await pool.query(
      `SELECT 1 FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1 AND u.role = 'admin'`,
      [token]
    );
    if (adminCheck.rows.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let query = `SELECT id, email, full_name, role, institution_id, nisn, nim, created_at FROM users WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (role) {
      query += ` AND role = $${idx++}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;
    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}