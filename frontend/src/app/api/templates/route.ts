// GET /api/templates — List all templates (paginated, filterable)
// POST /api/templates — Admin creates template

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    let query = `SELECT id, template_code, name, description, category, keywords, grade_levels, domain_tags, usage_count, average_rating, created_at FROM course_templates WHERE is_active = true`;
    const params: unknown[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY usage_count DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("[Templates List Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth + admin check
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
    if (userResult.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure } = body;

    if (!template_code || !name || !category || !block_structure) {
      return NextResponse.json(
        { error: "Missing required fields: template_code, name, category, block_structure" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO course_templates (template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [template_code, name, description, category, keywords ?? [], grade_levels ?? [], domain_tags ?? [], JSON.stringify(block_structure), userResult.rows[0].id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("[Template Create Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
