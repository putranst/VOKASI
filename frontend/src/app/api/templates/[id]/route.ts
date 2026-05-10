// GET /api/templates/[id] — Template detail
// POST /api/templates/[id]/customize — Customize template for course

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { customizeTemplate } from "@/lib/template-customizer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT * FROM course_templates WHERE id = $1 AND is_active = true`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("[Template Detail Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get template
    const tplResult = await pool.query(
      `SELECT * FROM course_templates WHERE id = $1 AND is_active = true`,
      [id]
    );
    if (tplResult.rows.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const template = tplResult.rows[0];
    const body = await req.json();
    const { title, description, domain, targetAudience, courseGoals, model } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Customize template via LLM
    const blocks = await customizeTemplate({
      templateBlocks: template.block_structure,
      title,
      description,
      domain,
      targetAudience,
      courseGoals,
      model,
    });

    // Increment usage count
    await pool.query(
      `UPDATE course_templates SET usage_count = usage_count + 1 WHERE id = $1`,
      [id]
    );

    // Record usage
    await pool.query(
      `INSERT INTO template_usage (template_id, user_id, customization_score)
       VALUES ($1, $2, $3)`,
      [id, userResult.rows[0].id, 0] // score calculated later if needed
    );

    return NextResponse.json({
      templateId: id,
      templateName: template.name,
      blocks,
      blockCount: blocks.length,
    });
  } catch (err) {
    console.error("[Template Customize Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
