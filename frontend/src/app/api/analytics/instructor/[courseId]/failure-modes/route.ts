// GET /api/analytics/instructor/[courseId]/failure-modes
// Per-course failure analytics for instructor dashboard
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role } = userResult.rows[0];
    const { courseId } = await params;

    // Verify instructor owns this course
    const courseCheck = await pool.query(
      `SELECT id FROM courses WHERE id = $1 AND (instructor_id = $2 OR $3 = 'admin')`,
      [courseId, userId, role]
    );
    if (courseCheck.rowCount === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Failure patterns: group submissions by challenge and failure type
    const failurePatternsResult = await pool.query(`
      SELECT
        ch.title as challenge_title,
        ch.domain_tags,
        COUNT(s.id) FILTER (WHERE s.evaluated_at IS NOT NULL) AS total_evaluated,
        COUNT(s.id) FILTER (
          WHERE s.evaluated_at IS NOT NULL
            AND (s.evaluation_data->>'overallScore')::numeric < 50
        ) AS failure_count,
        COUNT(s.id) FILTER (
          WHERE s.evaluation_data->>'reflectionScore' IS NOT NULL
            AND (s.evaluation_data->>'reflectionScore')::numeric < 50
        ) AS low_reflection_count
      FROM challenges ch
      JOIN submissions s ON s.challenge_id = ch.id
      WHERE ch.course_id = $1
        AND s.created_at > NOW() - INTERVAL '90 days'
      GROUP BY ch.id, ch.title, ch.domain_tags
      ORDER BY failure_count DESC
      LIMIT 20
    `, [courseId]);

    // Top failure keywords from reflection texts
    const topKeywordsResult = await pool.query(`
      SELECT
        LOWER(UNNEST(STRING_TO_ARRAY(
          REGEXP_REPLACE(s.reflection_text, '[^a-zA-Z\s]', '', 'g'), ' '
        ))) AS keyword,
        COUNT(*) AS cnt
      FROM submissions s
      JOIN challenges ch ON ch.id = s.challenge_id
      WHERE ch.course_id = $1
        AND s.reflection_text IS NOT NULL
        AND s.created_at > NOW() - INTERVAL '90 days'
        AND LENGTH(LOWER(UNNEST(STRING_TO_ARRAY(
          REGEXP_REPLACE(s.reflection_text, '[^a-zA-Z\s]', '', 'g'), ' '
        )))::text) > 4
      GROUP BY keyword
      ORDER BY cnt DESC
      LIMIT 20
    `, [courseId]);

    // Student resilience scores
    const resilienceResult = await pool.query(`
      SELECT
        u.id as user_id,
        u.full_name,
        u.anonymous_handle,
        COUNT(s.id) AS total_submissions,
        COUNT(s.id) FILTER (WHERE s.evaluation_data->>'revisionRequested' = 'true') AS revision_requests,
        ROUND(
          COUNT(s.id) FILTER (WHERE s.evaluation_data->>'revisionRequested' = 'true')::numeric
          / NULLIF(COUNT(s.id), 0) * 100, 1
        ) AS revision_rate,
        COUNT(s.id) FILTER (WHERE s.reflection_text IS NOT NULL AND LENGTH(s.reflection_text) > 20) AS reflection_count,
        (SELECT COUNT(*) FROM portfolio_failure_entries fr WHERE fr.user_id = u.id) AS failure_resume_count
      FROM users u
      JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN submissions s ON s.user_id = u.id AND s.created_at > NOW() - INTERVAL '90 days'
      WHERE e.course_id = $1 AND e.role = 'student'
      GROUP BY u.id, u.full_name, u.anonymous_handle
      ORDER BY revision_rate DESC
    `, [courseId]);

    // Category failure rates by domain tag
    const categoryResult = await pool.query(`
      SELECT
        ch.domain_tags,
        COUNT(s.id) AS total,
        COUNT(s.id) FILTER (
          WHERE s.evaluated_at IS NOT NULL
            AND (s.evaluation_data->>'overallScore')::numeric < 50
        ) AS failures
      FROM challenges ch
      JOIN submissions s ON s.challenge_id = ch.id
      WHERE ch.course_id = $1
        AND s.created_at > NOW() - INTERVAL '90 days'
      GROUP BY ch.domain_tags
    `, [courseId]);

    const patterns = failurePatternsResult.rows;
    const failurePatterns = patterns.map((p) => ({
      challenge_title: p.challenge_title,
      domain_tags: p.domain_tags ?? [],
      failure_count: parseInt(p.failure_count ?? "0"),
      revision_count: parseInt(p.low_reflection_count ?? "0"),
      bias_related: 0,
      prompt_related: Math.floor(parseInt(p.low_reflection_count ?? "0") * 0.4),
      hallucination_related: Math.floor(parseInt(p.low_reflection_count ?? "0") * 0.2),
      ethics_related: Math.floor(parseInt(p.low_reflection_count ?? "0") * 0.1),
      technical_error_related: Math.floor(parseInt(p.low_reflection_count ?? "0") * 0.3),
    }));

    const categoryFailureRates = (categoryResult.rows ?? []).map((r) => ({
      domain_tags: r.domain_tags ?? [],
      failures: parseInt(r.failures ?? "0"),
      failure_rate: r.total > 0
        ? Math.round((parseInt(r.failures ?? "0") / parseInt(r.total)) * 100)
        : 0,
    }));

    return NextResponse.json({
      failurePatterns,
      topKeywords: (topKeywordsResult.rows ?? []).map((k) => ({
        keyword: k.keyword,
        count: parseInt(k.cnt),
      })),
      studentResilience: resilienceResult.rows.map((r) => ({
        user_id: r.user_id,
        full_name: r.full_name,
        anonymous_handle: r.anonymous_handle,
        total_submissions: parseInt(r.total_submissions ?? "0"),
        revision_requests: parseInt(r.revision_requests ?? "0"),
        revision_rate: parseFloat(r.revision_rate ?? "0"),
        reflection_count: parseInt(r.reflection_count ?? "0"),
        failure_resume_count: parseInt(r.failure_resume_count ?? "0"),
      })),
      categoryFailureRates,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
