// GET /api/challenges — list challenges
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weekly = searchParams.get("weekly");
    const difficulty = searchParams.get("difficulty");
    const domain = searchParams.get("domain");

    let query = `SELECT id, title, description, rubric, difficulty, domain_tags,
                        sandbox_template, max_attempts, time_limit_minutes,
                        is_weekly, rotation_week, created_at
                 FROM challenges WHERE 1=1`;
    const params: unknown[] = [];
    let paramIdx = 1;

    if (weekly === "true") {
      query += ` AND is_weekly = TRUE`;
    }
    if (difficulty) {
      query += ` AND difficulty = $${paramIdx++}`;
      params.push(difficulty);
    }
    if (domain) {
      query += ` AND $${paramIdx++} = ANY(domain_tags)`;
      params.push(domain);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}