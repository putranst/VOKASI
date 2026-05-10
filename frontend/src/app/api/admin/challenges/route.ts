import { NextResponse } from "next/server";

// GET /api/admin/challenges
export async function GET() {
  const challenges = [
    { id: "1", title: "AI Prompt Analysis", category: "prompt-engineering", difficulty: "Medium", points: 100, submissions: 45, status: "active" },
    { id: "2", title: "Ethics Case Study", category: "data-ethics", difficulty: "Hard", points: 150, submissions: 23, status: "active" },
    { id: "3", title: "Tool Comparison", category: "tool-fluency", difficulty: "Easy", points: 50, submissions: 89, status: "active" },
  ];

  return NextResponse.json({ challenges });
}
