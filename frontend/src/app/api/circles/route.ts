// GET /api/circles — list available circles + student's circles
// POST /api/circles — join or create a circle
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // forming | active | completed

    let query = `
      SELECT c.id, c.name, c.topic, c.domain_tags, c.status,
             c.max_participants, c.scheduled_at, c.created_at,
        (SELECT COUNT(*) FROM circle_participants WHERE circle_id = c.id) as participant_count,
        COALESCE(
          (SELECT role FROM circle_participants WHERE circle_id = c.id AND user_id = $1),
          NULL
        ) as my_role,
        COALESCE(
          (SELECT id FROM circle_participants WHERE circle_id = c.id AND user_id = $1),
          NULL
        ) as my_participant_id
      FROM socratic_circles c
      WHERE 1=1
    `;
    const params: unknown[] = [userId];
    let idx = 2;

    if (status) {
      query += ` AND c.status = $${idx++}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/circles — join an existing circle OR find/create auto-matched circle
export async function POST(req: NextRequest) {
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

    const { circleId, topic, domainTags = [] } = await req.json();

    // JOIN existing circle
    if (circleId) {
      const circleResult = await pool.query(
        `SELECT c.max_participants,
          (SELECT COUNT(*) FROM circle_participants WHERE circle_id = c.id) as participant_count
         FROM socratic_circles c WHERE c.id = $1`,
        [circleId]
      );
      if (circleResult.rows.length === 0) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }
      const circle = circleResult.rows[0] as Record<string, unknown>;
      if ((circle.participant_count as number) >= (circle.max_participants as number)) {
        return NextResponse.json({ error: "Circle is full" }, { status: 400 });
      }

      // Assign role: first joiner is explainer, rest are questioners
      const countResult = await pool.query(
        `SELECT COUNT(*) as cnt FROM circle_participants WHERE circle_id = $1`,
        [circleId]
      );
      const role = (countResult.rows[0].cnt as number) === 0 ? "explainer" : "questioner";

      await pool.query(
        `INSERT INTO circle_participants (circle_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (circle_id, user_id) DO NOTHING`,
        [circleId, userId, role]
      );
      return NextResponse.json({ circleId, message: "Joined circle", role });
    }

    // AUTO-MATCH: find forming circle with room for more participants
    if (topic) {
      const matchResult = await pool.query(
        `SELECT c.id, c.topic, c.domain_tags,
          (SELECT COUNT(*) FROM circle_participants WHERE circle_id = c.id) as participant_count
         FROM socratic_circles c
         WHERE c.status = 'forming'
           AND (SELECT COUNT(*) FROM circle_participants WHERE circle_id = c.id) < c.max_participants
         ORDER BY c.created_at ASC
         LIMIT 1`
      );

      if (matchResult.rows.length > 0) {
        const circle = matchResult.rows[0] as Record<string, unknown>;
        const countResult = await pool.query(
          `SELECT COUNT(*) as cnt FROM circle_participants WHERE circle_id = $1`,
          [circle.id]
        );
        const role = (countResult.rows[0].cnt as number) === 0 ? "explainer" : "questioner";

        await pool.query(
          `INSERT INTO circle_participants (circle_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (circle_id, user_id) DO NOTHING`,
          [circle.id, userId, role]
        );
        return NextResponse.json({ circleId: circle.id, matched: true, role });
      }

      // No match — create new circle, self-assign as explainer
      const now = new Date();
      const weekNum = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
      const newCircle = await pool.query(
        `INSERT INTO socratic_circles (name, topic, domain_tags, max_participants, status, scheduled_at, week_number, year)
         VALUES ($1, $2, $3, 4, 'forming', NOW() + INTERVAL '7 days', $4, $5)
         RETURNING id`,
        [`Circle: ${topic}`, topic, domainTags, weekNum, now.getFullYear()]
      );
      const newCircleId = newCircle.rows[0].id;

      await pool.query(
        `INSERT INTO circle_participants (circle_id, user_id, role) VALUES ($1, $2, $3)`,
        [newCircleId, userId, "explainer"]
      );

      return NextResponse.json({ circleId: newCircleId, created: true, role: "explainer" });
    }

    return NextResponse.json({ error: "circleId or topic required" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}