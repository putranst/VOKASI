// POST /api/courses/generate — AI course structure generation
// PRD v2.3 §5.3
import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { title, description, domain, targetAudience, courseGoals } = await req.json();

    const prompt = `You are an expert vocational curriculum designer. Create a complete course curriculum in JSON format.

Course: ${title || "Untitled Course"}
${description ? `Description: ${description}` : ""}
${domain ? `Domain: ${domain}` : ""}
${targetAudience ? `Audience: ${targetAudience}` : ""}
${courseGoals ? `Goals:\n${courseGoals}` : ""}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "structure": [
    { "id": "m1", "type": "module", "title": "Module 1 Title" },
    { "id": "m2", "type": "module", "title": "Module 2 Title" }
  ],
  "puckData": {
    "content": [
      { "type": "ModuleHeader", "props": { "title": "...", "subtitle": "...", "learningObjectives": "...\n...", "estimatedMinutes": 45 } },
      { "type": "RichContent", "props": { "html": "<p>...</p>" } },
      { "type": "QuizBuilder", "props": { "quizTitle": "...", "questions": [{ "question": "...", "options": "Option A\nOption B\nOption C\nOption D", "correctIndex": 0 }], "passingScore": 70 } }
    ]
  }
}

Create 4-6 modules. Each module: 1 ModuleHeader + 2 RichContent blocks + 1 VideoBlock + 1 assessment block (QuizBuilder or Assignment).`;

    const response = await chat({
      model: process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: "You are an expert vocational curriculum designer. Return ONLY JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    if (!response.ok) {
      return NextResponse.json({ error: `OpenRouter error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
