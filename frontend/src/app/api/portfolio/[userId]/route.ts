// GET /api/portfolio/[userId]
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const result = await pool.query(
      `SELECT p.*, u.full_name, u.email
       FROM portfolios p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const portfolio = result.rows[0];
    // Only return full data if owner or admin
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!portfolio.is_public) {
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const ownerCheck = await pool.query(
        `SELECT 1 FROM auth_tokens WHERE token = $1 AND user_id = $2`, [token, userId]
      );
      if (ownerCheck.rows.length === 0) {
        const adminCheck = await pool.query(
          `SELECT 1 FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1 AND u.role = 'admin'`, [token]
        );
        if (adminCheck.rows.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(portfolio);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}