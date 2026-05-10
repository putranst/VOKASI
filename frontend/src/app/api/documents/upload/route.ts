// POST /api/documents/upload — Upload PDF/DOCX for processing
// Stores file, creates DB record, triggers background processing

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { processDocument } from "@/lib/document-processor";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs/promises";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["pdf", "docx", "pptx"];

export async function POST(req: NextRequest) {
  try {
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
    const userId = userResult.rows[0].id;

    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) ?? null;
    const domain = (formData.get("domain") as string) ?? undefined;
    const targetAudience = (formData.get("targetAudience") as string) ?? undefined;
    const courseGoals = (formData.get("courseGoals") as string) ?? undefined;
    const mode = (formData.get("mode") as string) ?? "fast";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Validate file type
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Save file to disk
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const fileId = uuidv4();
    const filename = `${fileId}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Create DB record
    const insertResult = await pool.query(
      `INSERT INTO documents (id, user_id, title, filename, file_path, file_type, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'uploaded')
       RETURNING id, status, created_at`,
      [fileId, userId, title ?? file.name, file.name, filePath, ext, file.size]
    );

    const document = insertResult.rows[0];

    // Trigger background processing (non-blocking)
    processDocumentAsync(document.id, filePath, ext, {
      title: title ?? file.name,
      domain,
      targetAudience,
      courseGoals,
      mode: mode as "fast" | "heavy",
    }).catch((err) => {
      console.error("[Document Processing Error]", err);
    });

    return NextResponse.json({
      documentId: document.id,
      status: document.status,
      message: "Upload successful. Processing started.",
    });
  } catch (err) {
    console.error("[Document Upload Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Background processing function
async function processDocumentAsync(
  documentId: string,
  filePath: string,
  fileType: string,
  options: {
    title?: string;
    domain?: string;
    targetAudience?: string;
    courseGoals?: string;
    mode?: "fast" | "heavy";
  }
) {
  try {
    // Update status to processing
    await pool.query(
      `UPDATE documents SET status = 'processing', updated_at = now() WHERE id = $1`,
      [documentId]
    );

    // Run the processing pipeline
    const result = await processDocument(filePath, fileType, {
      title: options.title,
      domain: options.domain,
      targetAudience: options.targetAudience,
      courseGoals: options.courseGoals,
      mode: options.mode ?? "fast",
    });

    // Store results
    await pool.query(
      `UPDATE documents SET 
        status = 'completed',
        processing_result = $2,
        updated_at = now()
       WHERE id = $1`,
      [documentId, JSON.stringify(result)]
    );

    console.log(`[Document] ${documentId} processed: ${result.blocks.length} blocks in ${result.processingTimeMs}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Document] ${documentId} failed:`, message);

    await pool.query(
      `UPDATE documents SET status = 'failed', error_message = $2, updated_at = now() WHERE id = $1`,
      [documentId, message]
    );
  }
}
