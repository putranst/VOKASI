// GET /api/simulations/[id] — get simulation session state
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const result = await pool.query(
      `SELECT s.*, p.name as persona_name, p.role as persona_role,
              p.company as persona_company, p.background as persona_background,
              p.communication_style, p.constraints_json, p.domain_tags,
              p.background as persona_context
       FROM simulation_sessions s
       JOIN simulation_personas p ON p.id = s.persona_id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    const session = result.rows[0];

    // Verify ownership
    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0 || userResult.rows[0].id !== session.user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
