// GET /api/analytics/student/[userId]
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // User can only see their own analytics
    const userCheck = await pool.query(
      `SELECT 1 FROM auth_tokens WHERE token = $1 AND user_id = $2`, [token, userId]
    );
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch portfolio for heatmap
    const portfolioResult = await pool.query(
      `SELECT competency_heatmap FROM portfolios WHERE user_id = $1`, [userId]
    );

    // Fetch challenge history
    const historyResult = await pool.query(
      `SELECT s.challenge_id, c.title, COUNT(s.id) as attempts,
              MAX((s.ai_feedback->'scores'->>'decomposition')::numeric * 0.25 +
                  (s.ai_feedback->'scores'->>'toolUsage')::numeric * 0.25 +
                  (s.ai_feedback->'scores'->>'outputQuality')::numeric * 0.25 +
                  (s.ai_feedback->'scores'->>'reflection')::numeric * 0.25) as best_score,
              MAX(s.created_at) as last_attempt_at
       FROM submissions s
       JOIN challenges c ON c.id = s.challenge_id
       WHERE s.user_id = $1 AND s.status = 'evaluated'
       GROUP BY s.challenge_id, c.title
       ORDER BY last_attempt_at DESC
       LIMIT 20`,
      [userId]
    );

    // Calculate velocity (change in competency over last 30 days)
    // Simplified: compare first vs last submission scores
    const velocityResult = await pool.query(
      `SELECT
        AVG(early.score) as early_avg,
        AVG(late.score) as late_avg
       FROM (
         SELECT *,
           ((ai_feedback->'scores'->>'decomposition')::numeric * 0.25 +
            (ai_feedback->'scores'->>'toolUsage')::numeric * 0.25 +
            (ai_feedback->'scores'->>'outputQuality')::numeric * 0.25 +
            (ai_feedback->'scores'->>'reflection')::numeric * 0.25) as score
         FROM submissions
         WHERE user_id = $1 AND status = 'evaluated' AND ai_feedback IS NOT NULL
         ORDER BY created_at
       ) scored`,
      [userId]
    );

    const earlyAvg = parseFloat(velocityResult.rows[0]?.early_avg ?? "0");
    const lateAvg = parseFloat(velocityResult.rows[0]?.late_avg ?? "0");
    const velocity = lateAvg - earlyAvg;

    // Sandbox hours
    const sandboxResult = await pool.query(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (LEAST(expires_at, NOW()) - created_at))), 0) as total_seconds
       FROM sandbox_sessions WHERE user_id = $1 AND status != 'terminated'`,
      [userId]
    );
    const sandboxHours = parseFloat(sandboxResult.rows[0]?.total_seconds ?? "0") / 3600;

    // Reflection depth
    const reflectionResult = await pool.query(
      `SELECT AVG(depth_score) as avg_depth FROM reflections WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      userId,
      competencyHeatmap: portfolioResult.rows[0]?.competency_heatmap ?? {},
      competencyVelocity: Math.round(velocity * 100) / 100,
      reflectionDepthScore: parseFloat(reflectionResult.rows[0]?.avg_depth ?? "0") || 0,
      challengeHistory: historyResult.rows.map((r) => ({
        challengeId: r.challenge_id,
        title: r.title,
        attempts: parseInt(r.attempts),
        bestScore: Math.round(parseFloat(r.best_score ?? "0") * 100) / 100,
        lastAttemptAt: r.last_attempt_at,
      })),
      sandboxHours: Math.round(sandboxHours * 10) / 10,
      socraticCirclesAttended: 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}