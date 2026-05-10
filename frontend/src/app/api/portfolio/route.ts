// GET /api/portfolio
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const tokenResult = await pool.query(
      `SELECT user_id FROM auth_tokens WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = tokenResult.rows[0].user_id;

    // Get user competency vector
    const userResult = await pool.query(
      `SELECT competency_vector FROM users WHERE id = $1`,
      [userId]
    );

    const competencyVector = userResult.rows[0]?.competency_vector || {};

    // Transform competency vector to competencies array
    const competencies = Object.entries(competencyVector).map(([name, score]) => ({
      name: name.replace(/([A-Z])/g, " $1").trim(),
      score: score as number || 0,
      trend: "stable",
      max: 100,
    }));

    // Get artifacts (submissions, certificates)
    const artifactsResult = await pool.query(
      `SELECT s.id, s.content->>'title' as title, 'submission' as type, 
              c.title as course, s.score, s.created_at as date
       FROM submissions s
       JOIN courses c ON s.course_id = c.id
       WHERE s.user_id = $1
       UNION ALL
       SELECT ce.id, ce.title, 'certificate' as type, 
              '' as course, 100 as score, ce.issued_at as date
       FROM certificates ce
       WHERE ce.user_id = $1
       ORDER BY date DESC
       LIMIT 20`,
      [userId]
    );

    // Get endorsements (peer reviews received)
    const endorsementsResult = await pool.query(
      `SELECT pr.id, u.full_name as endorser_name, u.role as endorser_role,
              pr.feedback as message, pr.created_at
       FROM peer_reviews pr
       JOIN users u ON pr.reviewer_id = u.id
       WHERE pr.reviewee_id = $1
       ORDER BY pr.created_at DESC
       LIMIT 10`,
      [userId]
    );

    return NextResponse.json({
      competencies,
      artifacts: artifactsResult.rows,
      endorsements: endorsementsResult.rows,
    });
  } catch (err) {
    console.error("Portfolio API error:", err);
    // Return empty data instead of error to prevent page crash
    return NextResponse.json({
      competencies: [],
      artifacts: [],
      endorsements: [],
    });
  }
}
