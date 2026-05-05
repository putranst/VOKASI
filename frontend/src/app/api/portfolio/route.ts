// PATCH /api/portfolio — update current user's portfolio
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    const body = await req.json();
    const { artifacts, failureResume, isPublic } = body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (artifacts !== undefined) {
      updates.push(`artifacts = $${idx++}`);
      values.push(JSON.stringify(artifacts));
    }
    if (failureResume !== undefined) {
      updates.push(`failure_resume = $${idx++}`);
      values.push(JSON.stringify(failureResume));
    }
    if (isPublic !== undefined) {
      updates.push(`is_public = $${idx++}`);
      values.push(isPublic);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE portfolios SET ${updates.join(", ")} WHERE user_id = $${idx} RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
