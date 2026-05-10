// GET /api/leaderboard
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const track = searchParams.get("track");

    const query = `
      SELECT 
        u.id, 
        u.anonymous_handle,
        AVG(s.reasoning_depth_score) as avg_score,
        COUNT(s.id) as submissions,
        MAX(s.reasoning_depth_score) as best_score,
        u.institution_id
      FROM users u 
      JOIN submissions s ON s.user_id = u.id
      WHERE ($1::text IS NULL OR u.track = $1)
        AND s.reasoning_depth_score IS NOT NULL
      GROUP BY u.id
      ORDER BY avg_score DESC NULLS LAST
      LIMIT $2
    `;

    const result = await pool.query(query, [track, limit]);

    // Get institution names
    const instIds = [...new Set(result.rows.map(r => r.institution_id).filter(Boolean))];
    let instMap: Record<string, string> = {};
    if (instIds.length > 0) {
      const instResult = await pool.query(
        `SELECT id, name FROM institutions WHERE id = ANY($1::uuid[])`,
        [instIds]
      );
      instMap = Object.fromEntries(instResult.rows.map(r => [r.id, r.name]));
    }

    const leaderboard = result.rows.map((row, i) => ({
      rank: i + 1,
      handle: row.anonymous_handle,
      avgScore: parseFloat(row.avg_score) || 0,
      submissions: parseInt(row.submissions) || 0,
      bestScore: parseInt(row.best_score) || 0,
      institution: instMap[row.institution_id] || "Unknown",
      trend: "stable" // TODO: calculate trend based on recent performance
    }));

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
