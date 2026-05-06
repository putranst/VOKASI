// GET /api/notifications, PATCH /api/notifications/:id
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const NOTIF_TYPES = [
  "submission_evaluated",  // Your submission has been evaluated
  "badge_earned",           // New badge awarded
  "mentor_request_accepted", // Mentor accepted your request
  "peer_review_received",  // New peer review on your work
  "certificate_ready",     // Certificate minted and ready
  "streak_reminder",       // Don't break your streak
  "enrollment_confirmed",  // You're enrolled in a new course
  "challenge_deadline",    // Upcoming challenge deadline
  "reflection_prompt",     // Weekly reflection prompt
  "system_announcement",   // Platform-wide announcement
];

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1 ${unreadOnly ? "AND is_read = false" : ""}
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userRes.rows[0].id;

    const { type, title, body, link, metadata } = await req.json();
    if (!type || !NOTIF_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid notification type. Allowed: ${NOTIF_TYPES.join(", ")}` }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, title ?? "", body ?? "", link ?? null, JSON.stringify(metadata ?? {})]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
