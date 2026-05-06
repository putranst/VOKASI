// GET /api/leaderboard
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const track = searchParams.get("track");

    // Replace with real query when live:
    // SELECT u.id, u.anonymous_handle, AVG(s.reasoning_depth_score) as avg_score,
    //        COUNT(s.id) as submissions, MAX(s.reasoning_depth_score) as best_score
    // FROM users u JOIN submissions s ON s.user_id = u.id
    // WHERE ($1::text IS NULL OR u.track = $1)
    // GROUP BY u.id ORDER BY avg_score DESC NULLS LAST LIMIT $2

    const HANDLES = ["Phantom Raven","Cipher Sage","Neon Vertex","Iron Circuit","Quantum Bloom",
      "Shadow Codex","Crimson Pulse","Silver Thread","Dark Nebula","Nova Arc",
      "Ghost Kernel","Emerald Flux","Ruby Echo","Atlas Bit","Zero Field",
      "Hex Core","Prism Edge","Torch Loop","Glitch Orb","Orbit Mind"];
    const INSTS = ["SMK Negeri 2 Jakarta","Politeknik Negeri Bandung","Universitas Brawijaya",
      "Institut Teknologi Sepuluh Nopember","PTII Vocational School"];
    const TRENDS = ["up","down","stable"];

    const MOCK = HANDLES.slice(0, 20).map((handle, i) => ({
      rank: i + 1, handle,
      avgScore: Math.round((92 - i * 2.1) * 10) / 10,
      submissions: 24 + (i * 3) % 30,
      bestScore: Math.round(94 - i * 1.5),
      institution: INSTS[i % 5],
      trend: TRENDS[i % 3],
    }));

    return NextResponse.json(MOCK.slice(0, limit));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
