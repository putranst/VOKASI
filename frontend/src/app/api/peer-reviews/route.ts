// GET /api/peer-reviews, POST /api/peer-reviews
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId } = userRes.rows[0];

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") ?? "assigned"; // assigned | given | received

    let query: string;
    if (view === "assigned") {
      // Peer reviews assigned to this user
      query = `SELECT pra.*, s.title as submission_title, s.content as submission_content,
        u.full_name as author_name, c.title as course_title
        FROM peer_review_assignments pra
        JOIN submissions s ON s.id = pra.submission_id
        JOIN users u ON u.id = s.user_id
        LEFT JOIN courses c ON c.id = s.course_id
        WHERE pra.reviewer_id = $1 AND pra.status IN ('pending', 'expired')
        ORDER BY pra.deadline_at ASC NULLS LAST`;
    } else if (view === "given") {
      // Reviews this user has written
      query = `SELECT pr.*, s.title as submission_title, u.full_name as author_name
        FROM peer_reviews pr
        JOIN submissions s ON s.id = pr.submission_id
        JOIN users u ON u.id = s.user_id
        WHERE pr.reviewer_id = $1 ORDER BY pr.created_at DESC`;
    } else {
      // Reviews received on this user's submissions
      query = `SELECT pr.*, u.full_name as reviewer_name, pr.scores
        FROM peer_reviews pr
        JOIN submissions s ON s.id = pr.submission_id
        JOIN users u ON u.id = pr.reviewer_id
        WHERE s.user_id = $1 ORDER BY pr.created_at DESC`;
    }

    const result = await pool.query(query, [userId]);
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

    const { assignmentId, scores, narrative, helpfulRating } = await req.json();
    if (!assignmentId || !scores || !narrative) {
      return NextResponse.json({ error: "assignmentId, scores, and narrative required" }, { status: 400 });
    }

    // Verify this assignment belongs to the user
    const assignRes = await pool.query(
      `SELECT * FROM peer_review_assignments WHERE id = $1 AND reviewer_id = $2 AND status = 'pending'`,
      [assignmentId, userId]
    );
    if (!assignRes.rows.length) {
      return NextResponse.json({ error: "Assignment not found or already completed" }, { status: 404 });
    }

    // Create the review
    const reviewRes = await pool.query(
      `INSERT INTO peer_reviews (submission_id, reviewer_id, scores, narrative, helpful_rating, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       ON CONFLICT (submission_id, reviewer_id) DO UPDATE SET scores = $3, narrative = $4, helpful_rating = $5, status = 'completed'
       RETURNING *`,
      [assignRes.rows[0].submission_id, userId, JSON.stringify(scores), narrative, helpfulRating ?? null]
    );

    // Mark assignment complete
    await pool.query(
      `UPDATE peer_review_assignments SET status = 'completed' WHERE id = $1`,
      [assignmentId]
    );

    // Award Peer Mentor badge if 10+ reviews written
    const countRes = await pool.query(
      `SELECT COUNT(*) as cnt FROM peer_reviews WHERE reviewer_id = $1`,
      [userId]
    );
    if (parseInt(countRes.rows[0].cnt) >= 10) {
      const badgeRes = await pool.query(`SELECT id FROM badges WHERE name = 'Peer Mentor'`);
      if (badgeRes.rows.length) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [userId, badgeRes.rows[0].id]
        );
      }
    }

    return NextResponse.json(reviewRes.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
