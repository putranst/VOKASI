// GET /api/challenges/[id]/leaderboard
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (authResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const result = await pool.query(
      `SELECT s.user_id, u.full_name as handle,
              (s.ai_feedback->'scores'->>'decomposition')::numeric * 0.25 +
              (s.ai_feedback->'scores'->>'toolUsage')::numeric * 0.25 +
              (s.ai_feedback->'scores'->>'outputQuality')::numeric * 0.25 +
              (s.ai_feedback->'scores'->>'reflection')::numeric * 0.25 as score
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       WHERE s.challenge_id = $1 AND s.status = 'evaluated' AND s.ai_feedback IS NOT NULL
       ORDER BY score DESC NULLS LAST
       LIMIT 50`,
      [challengeId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}