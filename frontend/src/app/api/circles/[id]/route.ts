// GET /api/circles/[id] — get circle details with participants
// POST /api/circles/[id]/prepare — submit preparation (topic + notes)
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const result = await pool.query(
      `SELECT c.*,
        json_agg(
          json_build_object(
            'id', cp.id,
            'user_id', cp.user_id,
            'role', cp.role,
            'preparation_topic', cp.preparation_topic,
            'attendance_status', cp.attendance_status,
            'ai_explanation_score', cp.ai_explanation_score,
            'ai_questioning_score', cp.ai_questioning_score,
            'is_anonymous', cp.is_anonymous
          )
        ) FILTER (WHERE cp.id IS NOT NULL) as participants,
        COALESCE(
          (SELECT cp2.role FROM circle_participants cp2 WHERE cp2.circle_id = c.id AND cp2.user_id = (
            SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $2
          )),
          NULL
        ) as my_role
       FROM socratic_circles c
       LEFT JOIN circle_participants cp ON cp.circle_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id, token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { preparationTopic, preparationNotes, attendanceStatus, isAnonymous } = await req.json();

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    const participantResult = await pool.query(
      `SELECT id FROM circle_participants WHERE circle_id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (participantResult.rows.length === 0) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }
    const participantId = participantResult.rows[0].id;

    const updateResult = await pool.query(
      `UPDATE circle_participants
       SET preparation_topic = COALESCE($1, preparation_topic),
           preparation_notes = COALESCE($2, preparation_notes),
           attendance_status = COALESCE($3, attendance_status),
           is_anonymous = COALESCE($4, is_anonymous)
       WHERE id = $5
       RETURNING *`,
      [preparationTopic, preparationNotes, attendanceStatus, isAnonymous, participantId]
    );

    // === Circle Companion Badge Trigger ===
    // Award badge if: (a) user attended AND (b) they've now completed 3 sessions
    if (attendanceStatus === "present") {
      const badgeResult = await pool.query(
        `SELECT id FROM badges WHERE name = 'Circle Companion'`
      );
      const badgeId = badgeResult.rows[0]?.id;
      if (badgeId) {
        const attendedCount = await pool.query(
          `SELECT COUNT(*) as cnt FROM circle_participants cp
           JOIN socratic_circles c ON c.id = cp.circle_id
           WHERE cp.user_id = $1 AND cp.attendance_status = 'present'
             AND c.status = 'completed'`,
          [userId]
        );
        if (parseInt(attendedCount.rows[0].cnt) >= 3) {
          await pool.query(
            `INSERT INTO user_badges (user_id, badge_id, awarded_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, badge_id) DO NOTHING`,
            [userId, badgeId]
          );
        }
      }
    }

    return NextResponse.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
