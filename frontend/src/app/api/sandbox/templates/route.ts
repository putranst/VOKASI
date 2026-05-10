// GET /api/sandbox/templates — List sandbox templates (filterable)
// POST /api/sandbox/templates — Create template (admin/instructor)

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const language = url.searchParams.get("language");
    const category = url.searchParams.get("category");
    const difficulty = url.searchParams.get("difficulty");

    let query = `SELECT id, template_code, name, description, language, category, difficulty, instructions, starter_files, tags, estimated_minutes, usage_count FROM sandbox_templates WHERE is_active = true`;
    const params: unknown[] = [];

    if (language) {
      params.push(language);
      query += ` AND language = $${params.length}`;
    }
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (difficulty) {
      params.push(difficulty);
      query += ` AND difficulty = $${params.length}`;
    }

    query += ` ORDER BY usage_count DESC, created_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("[Sandbox Templates List Error]", err);
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
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "instructor"].includes(userResult.rows[0].role)) {
      return NextResponse.json({ error: "Admin or instructor only" }, { status: 403 });
    }

    const body = await req.json();
    const { template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes } = body;

    if (!template_code || !name || !language || !category || !starter_files) {
      return NextResponse.json(
        { error: "Missing required fields: template_code, name, language, category, starter_files" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO sandbox_templates (template_code, name, description, language, category, difficulty, instructions, starter_files, test_cases, tags, estimated_minutes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [template_code, name, description, language, category, difficulty ?? "beginner", instructions, JSON.stringify(starter_files), JSON.stringify(test_cases ?? []), tags ?? [], estimated_minutes ?? 30, userResult.rows[0].id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("[Sandbox Template Create Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
