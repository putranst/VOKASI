// GET /api/admin/institutions, POST /api/admin/institutions
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
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");

    let query = `SELECT i.*, COUNT(u.id) as user_count, COUNT(c.id) as course_count
      FROM institutions i
      LEFT JOIN users u ON u.institution_id = i.id
      LEFT JOIN courses c ON c.instructor_id IN (SELECT id FROM users WHERE institution_id = i.id)
      WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;
    if (plan) { query += ` AND i.plan = $${idx++}`; params.push(plan); }
    if (status) { query += ` AND i.status = $${idx++}`; params.push(status); }
    query += " GROUP BY i.id ORDER BY i.created_at DESC";

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
      `SELECT u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, domain, plan, adminEmail } = await req.json();
    const result = await pool.query(
      `INSERT INTO institutions (name, domain, plan, status) VALUES ($1, $2, $3, 'trial') RETURNING *`,
      [name, domain, plan ?? "free"]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
