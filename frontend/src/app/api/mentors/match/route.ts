// GET /api/mentors/match?student_id=xxx
// pgvector cosine similarity matching — mentors complement student's weaknesses
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/*
PostgreSQL setup for vector matching (run once):
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE users ADD COLUMN competency_vector vector(12);
CREATE INDEX ON users USING ivfflat (competency_vector vector_cosine_ops);

-- pgvector cosine similarity SQL (use when live):
SELECT u.id, u.full_name, u.email, 1 - (u.competency_vector <=> $student_vector::vector) AS similarity
FROM users u
WHERE u.role IN ('mentor', 'instructor')
  AND 1 - (u.competency_vector <=> $student_vector::vector) > 0.5
ORDER BY u.competency_vector <=> $student_vector::vector
LIMIT 5;
*/
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (authResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json({ error: "student_id required" }, { status: 400 });
    }

    // Mock response — replace with pgvector query above when live
    const mentors = [
      { id: "m1", name: "Dr. Rina Marlina", role: "mentor", expertise: ["Prompt Engineering", "AI Automation"], bio: "Former AI researcher at Google, now mentoring vocational students in Indonesia.", rating: 4.9, students: 23, availability: "high", similarity: 0.91 },
      { id: "m2", name: "Ahmad Fauzi", role: "mentor", expertise: ["Model Evaluation", "Data Analysis"], bio: "ML engineer at a Jakarta fintech. Passionate about fair AI and model benchmarking.", rating: 4.7, students: 15, availability: "medium", similarity: 0.87 },
      { id: "m3", name: "Sarah Putri", role: "instructor", expertise: ["AI Automation", "Critical Thinking"], bio: "AI educator with 8 years experience. Specializes in CrewAI and agentic workflows.", rating: 4.8, students: 89, availability: "high", similarity: 0.84 },
      { id: "m4", name: "Budi Santoso", role: "mentor", expertise: ["Critical Thinking", "Prompt Engineering"], bio: "Ethics consultant for AI startups. Helps students think through real-world AI implications.", rating: 4.6, students: 11, availability: "low", similarity: 0.79 },
    ];

    return NextResponse.json(mentors);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
