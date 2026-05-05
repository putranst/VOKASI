// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import { pool, verifyPassword, generateToken } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, role, institution_id,
              competency_vector, created_at, updated_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken();
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token) VALUES ($1, $2)`,
      [user.id, token]
    );

    const { password_hash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}