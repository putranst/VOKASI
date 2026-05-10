// GET /api/simulations/history — get student's simulation history
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `SELECT s.id, s.simulation_type, s.title, s.status,
              s.current_turn, s.max_turns, s.difficulty_level,
              s.ai_evaluation, s.started_at, s.completed_at,
              p.name as persona_name, p.role as persona_role, p.company
       FROM simulation_sessions s
       JOIN simulation_personas p ON p.id = s.persona_id
       WHERE s.user_id = $1
       ORDER BY s.started_at DESC
       LIMIT 50`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
