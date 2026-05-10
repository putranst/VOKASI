// GET /api/analytics/instructor/failure-patterns?courseId=xxx
// Aggregated class-level failure pattern analysis per challenge
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = userResult.rows[0];
    if (user.role !== "instructor" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Get challenges for instructor's courses
    let query = `
      SELECT
        ch.id as challenge_id,
        ch.title as challenge_title,
        ch.difficulty,
        ch.domain_tags,
        COUNT(DISTINCT s.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN s.status = 'submitted' OR s.status = 'evaluated' THEN s.id END) as evaluated_count,
        AVG(
          CASE WHEN s.ai_feedback IS NOT NULL
          THEN ((s.ai_feedback->'scores'->>'decomposition')::numeric +
                (s.ai_feedback->'scores'->>'toolUsage')::numeric +
                (s.ai_feedback->'scores'->>'outputQuality')::numeric +
                (s.ai_feedback->'scores'->>'reflection')::numeric) / 4.0
          ELSE NULL END
        ) as avg_overall_score,
        MIN(CASE WHEN s.ai_feedback IS NOT NULL
          THEN (s.ai_feedback->'scores'->>'reflection')::numeric ELSE NULL END) as min_reflection_score
      FROM challenges ch
      LEFT JOIN submissions s ON s.challenge_id = ch.id
      WHERE ch.instructor_id = $1
    `;
    const params: unknown[] = [user.id];
    let idx = 2;

    if (courseId) {
      query += ` AND ch.course_id = $${idx++}`;
      params.push(courseId);
    }

    query += ` GROUP BY ch.id ORDER BY avg_overall_score ASC NULLS LAST LIMIT 50`;

    const result = await pool.query(query, params);

    const challengeIds = result.rows.map((r: Record<string,unknown>) => r.challenge_id as string);

    // Get failure_resume aggregate for these challenges (from portfolios)
    let failurePatterns: Record<string, { what_went_wrong: string; count: number }[]> = {};
    if (challengeIds.length > 0) {
      const failureResult = await pool.query(`
        SELECT
          unnest(p.failure_resume->0->'whatWentWrong') as themes,
          count(*) as cnt
        FROM portfolios p
        JOIN submissions s ON s.user_id = p.user_id
        WHERE s.challenge_id = ANY($1)
          AND jsonb_typeof(p.failure_resume) = 'array'
          AND jsonb_array_length(p.failure_resume) > 0
        GROUP BY themes
        ORDER BY cnt DESC
        LIMIT 10
      `, [challengeIds]);

      // Reorganize by challenge (simplified — return top themes across all)
      failurePatterns = { "all": failureResult.rows };
    }

    return NextResponse.json({
      challenges: result.rows,
      top_failure_themes: failurePatterns["all"] ?? [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
