// POST /api/circles/[id]/complete
// Instructor or last participant marks circle as complete, triggering Circle Companion badge
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Get user
    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    // Verify circle exists and user is a participant
    const circleResult = await pool.query(
      `SELECT c.id, c.status FROM socratic_circles c
       JOIN circle_participants cp ON cp.circle_id = c.id
       WHERE c.id = $1 AND cp.user_id = $2`,
      [id, userId]
    );
    if (circleResult.rows.length === 0) {
      return NextResponse.json({ error: "Circle not found or not a participant" }, { status: 404 });
    }

    // Mark circle as completed
    await pool.query(
      `UPDATE socratic_circles SET status = 'completed' WHERE id = $1 AND status != 'completed'`,
      [id]
    );

    // Award Circle Companion badge to all participants who attended
    const badgeResult = await pool.query(
      `SELECT id FROM badges WHERE name = 'Circle Companion'`
    );
    const badgeId = badgeResult.rows[0]?.id;
    const awarded: string[] = [];

    if (badgeId) {
      const participants = await pool.query(
        `SELECT user_id FROM circle_participants
         WHERE circle_id = $1 AND attendance_status = 'present'`,
        [id]
      );
      for (const row of participants.rows) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id, awarded_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [row.user_id, badgeId]
        );
        awarded.push(row.user_id);
      }
    }

    return NextResponse.json({ completed: true, badgeAwarded: awarded.length > 0 ? "Circle Companion" : null, participantsAwarded: awarded.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
