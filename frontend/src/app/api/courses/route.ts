// GET /api/courses, POST /api/courses (with optional AI generation)
// PRD v2.3 §5.3
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { chat } from "@/lib/openrouter";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("instructorId");
    const status = searchParams.get("status");

    let query = `SELECT c.*, u.full_name as instructor_name,
      (SELECT COUNT(*) FROM enrollments ce WHERE ce.course_id = c.id) as enrolled_count,
      (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count
      FROM courses c JOIN users u ON u.id = c.instructor_id WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;
    if (instructorId) { query += ` AND c.instructor_id = $${idx++}`; params.push(instructorId); }
    if (status) { query += ` AND c.status = $${idx++}`; params.push(status); }
    query += " ORDER BY c.created_at DESC";

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

    const userResult = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId } = userResult.rows[0];

    const body = await req.json();
    const { title, description, domain, targetAudience, courseGoals, competencyWeights, generateWithAI } = body;

    // AI course generation
    let structure: unknown[] = [];
    let puckData: Record<string, unknown> = { content: [], zones: {}, float: [] };

    if (generateWithAI) {
      const prompt = `You are an expert vocational curriculum designer. Create a complete course structure in JSON.

Course Title: ${title || "Untitled Course"}
Description: ${description || ""}
Domain: ${domain || "General AI"}
Target Audience: ${targetAudience || "Vocational students"}
Goals: ${courseGoals || ""}

Return ONLY a valid JSON object:
{
  "structure": [{ "id": "m1", "type": "module", "title": "Module 1 Title" }],
  "puckData": {
    "content": [
      { "type": "ModuleHeader", "props": { "title": "...", "subtitle": "...", "learningObjectives": "...\n...", "estimatedMinutes": 45 } },
      { "type": "RichContent", "props": { "html": "<p>...</p>" } },
      { "type": "QuizBuilder", "props": { "quizTitle": "...", "questions": [{ "question": "...", "options": "A\nB\nC\nD", "correctIndex": 1 }], "passingScore": 70 } }
    ]
  }
}

Create 4-6 modules. Each module: 1 ModuleHeader + 2 RichContent + 1 VideoBlock + 1 QuizBuilder.`;

      try {
        const response = await chat({
          model: process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: "You are an expert vocational curriculum designer. Return ONLY JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        if (response.ok) {
          const data = await response.json() as { choices?: { message?: { content?: string } }[] };
          const text = data.choices?.[0]?.message?.content ?? "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            structure = parsed.structure || [];
            puckData = parsed.puckData || { content: [], zones: {}, float: [] };
          }
        }
      } catch (aiErr) {
        console.error("AI generation failed:", aiErr);
        structure = [
          { id: "m1", type: "module", title: "Module 1: Introduction" },
          { id: "m2", type: "module", title: "Module 2: Core Concepts" },
        ];
      }
    }

    const result = await pool.query(
      `INSERT INTO courses (title, description, instructor_id, structure, competency_weights, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title || "Untitled Course",
        description || "",
        userId,
        JSON.stringify(structure),
        JSON.stringify(competencyWeights || {}),
        "draft",
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
