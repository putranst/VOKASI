// POST /api/sandbox/start — Start sandbox session (with optional template)
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
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

    const { templateId, templateCode } = await req.json();

    // Terminate any existing active sessions for this user
    await pool.query(
      `UPDATE sandbox_sessions SET status = 'terminated' WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Resolve template — either by ID or by code
    let template: Record<string, unknown> | null = null;
    let resolvedTemplateId = templateId ?? "jupyter";
    let preloadedFiles: unknown[] = [];

    if (templateCode || (templateId && templateId !== "jupyter" && templateId !== "playground")) {
      const tplResult = await pool.query(
        `SELECT id, template_code, name, language, starter_files, instructions
         FROM sandbox_templates
         WHERE (template_code = $1 OR id::text = $1) AND is_active = true`,
        [templateCode ?? templateId]
      );

      if (tplResult.rows.length > 0) {
        template = tplResult.rows[0];
        resolvedTemplateId = template.template_code as string;
        preloadedFiles = (template.starter_files as unknown[]) ?? [];

        // Increment usage count
        await pool.query(
          `UPDATE sandbox_templates SET usage_count = usage_count + 1 WHERE id = $1`,
          [template.id]
        );
      }
    }

    // Create new session with template info and preloaded files
    const result = await pool.query(
      `INSERT INTO sandbox_sessions (user_id, template_id, status, preloaded_files, expires_at)
       VALUES ($1, $2, 'active', $3, NOW() + INTERVAL '2 hours')
       RETURNING id, user_id, template_id, status, preloaded_files, started_at, expires_at`,
      [userId, resolvedTemplateId, JSON.stringify(preloadedFiles)]
    );

    const session = result.rows[0];

    return NextResponse.json({
      ...session,
      template: template ? {
        name: template.name,
        language: template.language,
        instructions: template.instructions,
      } : null,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
