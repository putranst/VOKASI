// GET/PATCH/DELETE /api/courses/[id]
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT c.*, u.full_name as instructor_name FROM courses c
       JOIN users u ON u.id = c.instructor_id WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role } = userResult.rows[0];

    const courseCheck = await pool.query(`SELECT instructor_id FROM courses WHERE id = $1`, [id]);
    if (courseCheck.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (courseCheck.rows[0].instructor_id !== userId && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, structure, competencyWeights } = body;

    const result = await pool.query(
      `UPDATE courses SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         structure = COALESCE($4, structure),
         competency_weights = COALESCE($5, competency_weights)
       WHERE id = $6 RETURNING *`,
      [title, description, status, structure ? JSON.stringify(structure) : null,
       competencyWeights ? JSON.stringify(competencyWeights) : null, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}