// GET/POST /api/portfolio/failure-resume — list and create failure resume entries
// Also computes Resilience Streak and awards "Phoenix Rising" badge
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
      `SELECT * FROM portfolio_failure_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    // Get streak info
    const streakResult = await pool.query(
      `SELECT
         COUNT(*) as total_entries,
         COUNT(DISTINCT DATE(created_at)) as active_days,
         MAX(created_at) as last_entry_at
       FROM portfolio_failure_entries
       WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      entries: result.rows,
      streak: streakResult.rows[0],
    });
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

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = userResult.rows[0].id;

    const { failureTitle, failureDescription, lessonsLearned, recoverySteps } = await req.json();
    if (!failureTitle?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO portfolio_failure_entries (user_id, failure_title, failure_description, lessons_learned, recovery_steps)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, failureTitle.trim(), failureDescription, lessonsLearned, recoverySteps]
    );

    const entry = result.rows[0];

    // === RESILIENCE STREAK & BADGE LOGIC ===
    // Phoenix Rising badge: document 5 failures with lessons learned
    const badgeCheck = await pool.query(
      `SELECT COUNT(*) as count FROM portfolio_failure_entries
       WHERE user_id = $1 AND lessons_learned IS NOT NULL AND lessons_learned != ''`,
      [userId]
    );
    const lessonsCount = parseInt(badgeCheck.rows[0].count);

    if (lessonsCount >= 5) {
      // Check if user already has Phoenix Rising badge
      const existingBadge = await pool.query(
        `SELECT id FROM user_badges
         WHERE user_id = $1 AND badge_id = (SELECT id FROM badges WHERE name = 'Phoenix Rising')`,
        [userId]
      );
      if (existingBadge.rows.length === 0) {
        const phoenixBadge = await pool.query(
          `SELECT id FROM badges WHERE name = 'Phoenix Rising'`
        );
        if (phoenixBadge.rows.length > 0) {
          await pool.query(
            `INSERT INTO user_badges (user_id, badge_id, awarded_at)
             VALUES ($1, $2, NOW())`,
            [userId, phoenixBadge.rows[0].id]
          );
          entry.badge_awarded = "Phoenix Rising";
        }
      }
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
