// GET /api/simulations/types — list available simulation types with descriptions
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const SIMULATION_TYPE_INFO = {
  client_brief: {
    name: "Client Brief",
    nameId: "Brief Klien",
    description: "Hadap klien dengan persyaratan yang tidak jelas. Latih kemampuan bertanya clarifying dan mengelola ekspektasi.",
    descriptionEn: "Face clients with vague requirements. Practice asking clarifying questions and managing expectations.",
    icon: "💬",
    estimatedMinutes: 15,
    competencyDimensions: ["critical_thinking", "communication", "domain_application"],
    difficultyLevels: 3,
  },
  crisis_scenario: {
    name: "Crisis Scenario",
    nameId: "Skenario Krisis",
    description: "Model AI gagal di produksi. Kamu harus mendiagnosis masalah, mengomunikasikan solusi, dan memimpin pemulihan.",
    descriptionEn: "An AI model fails in production. Diagnose the issue, communicate the fix, and lead recovery.",
    icon: "⚡",
    estimatedMinutes: 20,
    competencyDimensions: ["debugging", "communication", "data_ethics", "critical_thinking"],
    difficultyLevels: 3,
  },
  ethics_board: {
    name: "Ethics Board",
    nameId: "Dewan Etik",
    description: "Pertahankan keputusan deployment AI di hadapan panel regulator. Kembangkan args yang kuat dan antisipasi keberatan.",
    descriptionEn: "Defend an AI deployment decision before a regulatory panel. Build strong arguments and anticipate objections.",
    icon: "⚖",
    estimatedMinutes: 25,
    competencyDimensions: ["data_ethics", "critical_thinking", "communication", "model_evaluation"],
    difficultyLevels: 3,
  },
  team_simulation: {
    name: "Team Simulation",
    nameId: "Simulasi Tim",
    description: "Kolaborasikan dengan persona AI untuk menyelesaikan proyek AI yang kompleks. Latih kepemimpinan dan kolaborasi.",
    descriptionEn: "Collaborate with AI personas to solve a complex AI project. Practice leadership and collaboration skills.",
    icon: "👥",
    estimatedMinutes: 30,
    competencyDimensions: ["collaboration", "communication", "automation", "teaching_others"],
    difficultyLevels: 3,
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    // Return available types (all 4 are always available)
    // In a full impl, we'd filter by institution or user tier
    const types = Object.entries(SIMULATION_TYPE_INFO).map(([key, info]) => ({
      type: key,
      ...info,
    }));

    // If user_id provided, also return their competency level per type
    let userCompetencyLevel: Record<string, number> = {};
    if (userId) {
      const result = await pool.query(
        `SELECT competency_vector FROM users WHERE id = $1`,
        [userId]
      );
      if (result.rows.length > 0) {
        const vec = result.rows[0].competency_vector;
        if (vec && Array.isArray(vec)) {
          const avg =
            vec.reduce((a: number, b: number) => a + b, 0) / vec.length;
          userCompetencyLevel.overall = Math.ceil(avg / 33); // 0-100 -> 1-3
        }
      }
    }

    return NextResponse.json({ types, userCompetencyLevel });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
