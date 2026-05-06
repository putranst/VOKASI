// GET /api/mentor-requests, POST /api/mentor-requests
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
    const { id: userId, role } = userRes.rows[0];

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "pending";

    let query: string;
    if (role === "mentor" || role === "instructor") {
      // Show requests addressed to this mentor
      query = `SELECT mr.*, u.full_name as student_name, c.title as course_title
        FROM mentor_requests mr
        JOIN users u ON u.id = mr.student_id
        JOIN courses c ON c.id = mr.course_id
        WHERE mr.mentor_id = $1 AND mr.status = $2
        ORDER BY mr.created_at DESC`;
    } else {
      // Show student's own requests
      query = `SELECT mr.*, m.full_name as mentor_name, c.title as course_title
        FROM mentor_requests mr
        JOIN users m ON m.id = mr.mentor_id
        JOIN courses c ON c.id = mr.course_id
        WHERE mr.student_id = $1 AND mr.status = $2
        ORDER BY mr.created_at DESC`;
    }

    const result = await pool.query(query, [userId, status]);
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

    const { mentorId, courseId, message, goals } = await req.json();
    if (!mentorId || !courseId) {
      return NextResponse.json({ error: "mentorId and courseId required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO mentor_requests (student_id, mentor_id, course_id, message, goals, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [userId, mentorId, courseId, message ?? "", JSON.stringify(goals ?? [])]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRes = await pool.query(
      `SELECT u.id, u.role FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (!userRes.rows.length) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role } = userRes.rows[0];
    if (role !== "mentor" && role !== "instructor") {
      return NextResponse.json({ error: "Only mentors can respond" }, { status: 403 });
    }

    const { requestId, action } = await req.json();
    if (!requestId || !action) return NextResponse.json({ error: "requestId and action required" }, { status: 400 });

    const newStatus = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "pending";
    const result = await pool.query(
      `UPDATE mentor_requests SET status = $1, responded_at = NOW() WHERE id = $2 AND mentor_id = $3 RETURNING *`,
      [newStatus, requestId, userId]
    );
    if (!result.rows.length) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
