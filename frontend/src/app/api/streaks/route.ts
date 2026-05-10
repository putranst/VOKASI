// GET /api/streaks — get current user's streak
// POST /api/streaks — record activity, update streak, check badge awards
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
      `SELECT id, current_streak, longest_streak, last_activity, updated_at
       FROM streaks WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create streak row if missing
      const newStreak = await pool.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity)
         VALUES ($1, 0, 0, CURRENT_DATE) RETURNING *`,
        [userId]
      );
      return NextResponse.json(newStreak.rows[0]);
    }

    return NextResponse.json(result.rows[0]);
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

    // Get or create streak row
    let streakRow = await pool.query(
      `SELECT * FROM streaks WHERE user_id = $1`,
      [userId]
    );

    if (streakRow.rows.length === 0) {
      streakRow = await pool.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity)
         VALUES ($1, 1, 1, CURRENT_DATE) RETURNING *`,
        [userId]
      );
      return NextResponse.json({ ...streakRow.rows[0], isNew: true });
    }

    const streak = streakRow.rows[0] as { current_streak: number; longest_streak: number; last_activity: Date };
    const lastActivity = new Date(streak.last_activity);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivity.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / 86400000);
    let newStreak = streak.current_streak;
    let newLongest = streak.longest_streak;

    if (diffDays === 0) {
      // Already recorded activity today — no change
      return NextResponse.json({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity: streak.last_activity,
        message: "Activity already recorded today",
      });
    } else if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = streak.current_streak + 1;
      newLongest = Math.max(streak.longest_streak, newStreak);
    } else {
      // Gap > 1 day — reset
      newStreak = 1;
    }

    await pool.query(
      `UPDATE streaks
       SET current_streak = $1, longest_streak = $2, last_activity = CURRENT_DATE
       WHERE user_id = $3`,
      [newStreak, newLongest, userId]
    );

    // Check badge awards
    const awarded: string[] = [];

    if (newStreak === 7) {
      const badgeResult = await pool.query(
        `SELECT id FROM badges WHERE name = 'Weekly Warrior'`
      );
      if (badgeResult.rows[0]) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id, awarded_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [userId, badgeResult.rows[0].id]
        );
        awarded.push("Activity Streak");
      }
    }

    if (newStreak === 30) {
      const badgeResult = await pool.query(
        `SELECT id FROM badges WHERE name = 'Monthly Mentor'`
      );
      if (badgeResult.rows[0]) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id, awarded_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [userId, badgeResult.rows[0].id]
        );
        awarded.push("Consistency Champion");
      }
    }

    return NextResponse.json({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity: today.toISOString().split("T")[0],
      awarded,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}