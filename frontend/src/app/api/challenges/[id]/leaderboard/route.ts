// GET /api/challenges/[id]/leaderboard
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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