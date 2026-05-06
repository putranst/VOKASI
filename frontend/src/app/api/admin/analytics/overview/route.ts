// GET /api/admin/analytics/overview
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length || userRes.rows[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [instCount, userCount, courseCount, submissionCount, certCount] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM institutions"),
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM courses WHERE status = 'published'"),
      pool.query("SELECT COUNT(*) FROM submissions WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM certificates"),
    ]);

    const weeklySubmissions = await pool.query(`
      SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) as count
      FROM submissions WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY day ORDER BY day
    `);

    const competencyAvg = await pool.query(`
      SELECT AVG(competency_scores_vector <-> '(0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5)'::vector) as avg_distance
      FROM users WHERE competency_scores IS NOT NULL
    `);

    return NextResponse.json({
      institutions: parseInt(instCount.rows[0].count),
      users: parseInt(userCount.rows[0].count),
      activeCourses: parseInt(courseCount.rows[0].count),
      weeklySubmissions: parseInt(submissionCount.rows[0].count),
      certificatesIssued: parseInt(certCount.rows[0].count),
      weeklySubmissionsTrend: weeklySubmissions.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
