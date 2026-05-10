// POST /api/courses/[id]/blocks/refine-batch — Batch block refinement

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { chat, type PuckBlock } from "@/lib/openrouter";
import { checkRateLimit, EVALUATION_RATE_LIMIT, EVALUATION_RATE_WINDOW } from "@/lib/rate-limit";

const BATCH_REFINE_SYSTEM = `You are an expert course content editor. You receive multiple Puck blocks and a single instruction that applies to all of them. Refine each block's content according to the instruction.

Rules:
- Keep each block type EXACTLY the same
- Only modify the props (content) of each block
- Apply the instruction consistently across all blocks
- Return ONLY a valid JSON array of refined blocks`;

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

    const rl = checkRateLimit(`refine-batch:${userResult.rows[0].id}`, EVALUATION_RATE_LIMIT, EVALUATION_RATE_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded.", retryAfter: rl.retryAfter },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { blocks, instructions, model } = body as {
      blocks: PuckBlock[];
      instructions: string;
      model?: string;
    };

    if (!blocks || !Array.isArray(blocks) || !instructions) {
      return NextResponse.json(
        { error: "Missing required fields: blocks (array), instructions" },
        { status: 400 }
      );
    }

    if (blocks.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 blocks per batch refinement" },
        { status: 400 }
      );
    }

    const prompt = `Refine these ${blocks.length} Puck blocks according to the instruction.

INSTRUCTION: ${instructions}

BLOCKS:
${JSON.stringify(blocks, null, 2)}

Return a JSON array of the same ${blocks.length} blocks with refined content. Keep types and structure identical.`;

    const response = await chat({
      model: model ?? process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: BATCH_REFINE_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 6000,
    });

    if (!response.ok) {
      return NextResponse.json({ error: `AI error: ${response.status}` }, { status: response.status });
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "[]";

    let refinedBlocks: PuckBlock[];
    try {
      refinedBlocks = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) refinedBlocks = JSON.parse(match[0]);
      else return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const results = refinedBlocks.map((block, i) => ({
      blockIndex: i,
      refinedContent: block.props,
      changes: `Refined per: "${instructions.slice(0, 80)}"`,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[Batch Refine Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
