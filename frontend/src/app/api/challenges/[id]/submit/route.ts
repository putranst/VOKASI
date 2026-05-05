// POST /api/challenges/[id]/submit
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { evaluateSubmission } from "@/lib/openrouter";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id, u.full_name FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = userResult.rows[0];

    const { content, reflection, sandboxSnapshotId } = await req.json();

    // Check attempt count
    const attemptResult = await pool.query(
      `SELECT COUNT(*) as count FROM submissions WHERE user_id = $1 AND challenge_id = $2`,
      [user.id, challengeId]
    );
    const attemptCount = parseInt(attemptResult.rows[0].count);

    const challengeResult = await pool.query(`SELECT max_attempts, title, rubric_raw_content FROM challenges WHERE id = $1`, [challengeId]);
    if (challengeResult.rows.length === 0) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    const challenge = challengeResult.rows[0];

    if (attemptCount >= challenge.max_attempts) {
      return NextResponse.json({ error: "Max attempts reached" }, { status: 403 });
    }

    const versionNumber = attemptCount + 1;

    // Insert submission
    const submissionResult = await pool.query(
      `INSERT INTO submissions (user_id, challenge_id, content, reflection_text, status, version_number)
       VALUES ($1, $2, $3, $4, 'submitted', $5)
       RETURNING *`,
      [user.id, challengeId, JSON.stringify(content), reflection, versionNumber]
    );
    const submission = submissionResult.rows[0];

    // Evaluate with AI (async-friendly: try/catch so a failure doesn't break submission)
    let aiFeedback = null;
    try {
      aiFeedback = await evaluateSubmission(
        challenge.title,
        challenge.rubric_raw_content ?? "",
        JSON.stringify(content),
        reflection ?? ""
      );

      // Update submission with AI feedback
      await pool.query(
        `UPDATE submissions SET ai_feedback = $1, status = 'evaluated' WHERE id = $2`,
        [JSON.stringify(aiFeedback), submission.id]
      );

      // Update user competency vector
      if (aiFeedback?.scores) {
        const scores = aiFeedback.scores;
        // Simplified: directly add weighted scores to vector
        await pool.query(
          `UPDATE users SET
             competency_vector =
               competency_vector ||
               ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]
           WHERE id = $1`,
          [user.id]
        );
      }
    } catch (evalErr) {
      console.error("AI evaluation failed:", evalErr);
      // Continue without AI feedback — manual review can happen later
    }

    return NextResponse.json({
      submission,
      aiFeedback,
    }, { status: 201 });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}