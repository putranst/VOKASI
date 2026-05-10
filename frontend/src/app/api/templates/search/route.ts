// POST /api/templates/search — Search templates with matching algorithm

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { matchTemplates, type TemplateMatchRequirements, type TemplateRow } from "@/lib/template-matcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, domain, targetAudience, difficulty } = body as TemplateMatchRequirements;

    if (!title) {
      return NextResponse.json({ error: "Title is required for template search" }, { status: 400 });
    }

    // Fetch all active templates
    const result = await pool.query(
      `SELECT id, template_code, name, description, category, keywords, grade_levels, domain_tags, block_structure, usage_count, average_rating
       FROM course_templates WHERE is_active = true ORDER BY usage_count DESC`
    );

    const templates: TemplateRow[] = result.rows;
    const matched = matchTemplates(
      { title, description, domain, targetAudience, difficulty },
      templates
    );

    // Return top 10 matches
    return NextResponse.json(matched.slice(0, 10));
  } catch (err) {
    console.error("[Template Search Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
