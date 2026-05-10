// POST /api/courses/[id]/blocks/refine — AI-powered block refinement
// POST /api/courses/[id]/blocks/refine-batch — Batch refinement

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { chat, type PuckBlock } from "@/lib/openrouter";
import { checkRateLimit, EVALUATION_RATE_LIMIT, EVALUATION_RATE_WINDOW } from "@/lib/rate-limit";

const REFINE_SYSTEM = `You are an expert course content editor. You receive a specific Puck block and user instructions, then refine ONLY that block's content.

Rules:
- Keep the block type EXACTLY the same
- Only modify the props (content) of the block
- Preserve the overall structure and formatting
- Apply the user's requested changes precisely
- Return ONLY a valid JSON object with the refined block: { "type": "...", "props": { ... } }`;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth + rate limit
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

    const rl = checkRateLimit(`refine:${userResult.rows[0].id}`, EVALUATION_RATE_LIMIT, EVALUATION_RATE_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: rl.retryAfter },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? EVALUATION_RATE_WINDOW) } }
      );
    }

    const body = await req.json();
    const { blockIndex, blockType, currentContent, instructions, model } = body;

    if (!blockType || !currentContent || !instructions) {
      return NextResponse.json(
        { error: "Missing required fields: blockType, currentContent, instructions" },
        { status: 400 }
      );
    }

    const prompt = `Refine this Puck block based on the user's instructions.

BLOCK TYPE: ${blockType}
CURRENT CONTENT:
${JSON.stringify(currentContent, null, 2)}

USER INSTRUCTIONS:
${instructions}

Return the refined block as a JSON object: { "type": "${blockType}", "props": { ... } }`;

    const response = await chat({
      model: model ?? process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: REFINE_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    if (!response.ok) {
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: response.status });
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "{}";

    let refinedBlock: PuckBlock;
    try {
      refinedBlock = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) refinedBlock = JSON.parse(match[0]);
      else return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Generate human-readable change summary
    const changes = `Refined ${blockType} block per instructions: "${instructions.slice(0, 100)}"`;

    return NextResponse.json({
      blockIndex,
      refinedContent: refinedBlock.props,
      changes,
    });
  } catch (err) {
    console.error("[Block Refine Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
