// POST /api/auth/register
import { NextRequest, NextResponse } from "next/server";
import { pool, hashPassword, generateToken } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role, institutionId, nisn, nim } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, institution_id, nisn, nim)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, institution_id, nisn, nim, competency_vector, created_at, updated_at`,
      [email.trim().toLowerCase(), passwordHash, fullName, role ?? "student", institutionId ?? null, nisn ?? null, nim ?? null]
    );

    const user = result.rows[0];
    const token = generateToken();
    await pool.query(`INSERT INTO auth_tokens (user_id, token) VALUES ($1, $2)`, [user.id, token]);

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}