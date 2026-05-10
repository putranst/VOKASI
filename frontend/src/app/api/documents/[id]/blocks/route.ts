// GET /api/documents/[id]/blocks — Get generated Puck blocks for a completed document

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await pool.query(
      `SELECT u.id FROM users u JOIN auth_tokens t ON t.user_id = u.id WHERE t.token = $1`,
      [token]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document with processing result
    const result = await pool.query(
      `SELECT id, title, status, processing_result, error_message
       FROM documents WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = result.rows[0];

    if (doc.status !== "completed") {
      return NextResponse.json(
        { error: "Document not yet processed", status: doc.status },
        { status: 400 }
      );
    }

    const processingResult = doc.processing_result;
    const blocks = processingResult?.blocks ?? [];

    return NextResponse.json({
      documentId: doc.id,
      title: doc.title,
      blocks,
      blockCount: blocks.length,
      mode: processingResult?.mode ?? "unknown",
      processingTimeMs: processingResult?.processingTimeMs ?? 0,
    });
  } catch (err) {
    console.error("[Document Blocks Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
