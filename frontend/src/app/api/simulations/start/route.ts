// POST /api/simulations/start — start a new workplace simulation
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { chat } from "@/lib/openrouter";
import { checkRateLimit, SIMULATION_RATE_LIMIT, SIMULATION_RATE_WINDOW } from "@/lib/rate-limit";

// Competency dimension names matching DB schema order
const COMPETENCY_DIMS = [
  "promptEngineering",
  "modelEvaluation",
  "dataEthics",
  "automation",
  "criticalThinking",
  "collaboration",
  "communication",
  "toolFluency",
  "debugging",
  "domainApplication",
  "continuousLearning",
  "teachingOthers",
] as const;

type CompetencyDim = (typeof COMPETENCY_DIMS)[number];

interface PersonaConstraints {
  budget?: string;
  timeline?: string;
  technical_depth?: string;
  team_size?: string;
  regulatory_concerns?: string[];
}

const PERSONA_SYSTEM_PROMPTS = {
  client_brief: `Kamu adalah AI yang membuat persona CLIENT untuk simulasi "Brief Klien" dalam platform VOKASI.
Tidak ada teks lain selain JSON persona.
PERSONA BERBAHASA INDONESIA. Nama Indonesia, perusahaan Indonesia, masalah Indonesia.

Format JSON yang DIPERLUKAN (tanpa markdown, tanpa penjelasan lain):
{
  "name": "Nama lengkap persona",
  "role": "Jabatan di perusahaan",
  "company": "Nama perusahaan (PT ...)",
  "background": "Riwayat singkat persona — 2-3 kalimat tentang pengalaman, gaya kerja, dan mengapa mereka datang ke VOKASI",
  "communication_style": "Gaya komunikasi persona — 1 kalimat. Contoh: 'Terburu-buru, suka interromp, langsung ke inti' atau 'Santai tapi detail, suka metafora'",
  "constraints": {
    "budget": "Keterbatasan anggaran persona — realistis untuk UMKM Indonesia",
    "timeline": "Tekanan waktu yang mereka alami",
    "technical_depth": "Seberapa teknis persona bisa diajak diskusi (minimal, moderate, advanced)"
  },
  "domain_tags": ["domain1", "domain2"],
  "scenario_setup": "Ringkasan 1 kalimat tentang masalah yang akan mereka ceritakan ke siswa"
}`,
  crisis_scenario: `Kamu adalah AI yang membuat persona untuk simulasi "KRISIS AI" dalam platform VOKASI.
Persona adalah CTO atau Engineering Manager yang panik karena sistem AI mereka gagal di produksi.
PERSONA BERBAHASA INDONESIA.

Format JSON yang DIPERLUKAN (tanpa markdown, tanpa penjelasan lain):
{
  "name": "Nama lengkap persona",
  "role": "CTO / Engineering Manager",
  "company": "Nama perusahaan (PT ...)",
  "background": "Riwayat singkat — 2-3 kalimat. Ceritakan pengalaman mereka dengan AI, bagaimana sistem di-setting, dan mengapa ini terjadi",
  "communication_style": "Gaya komunikasi — 1 kalimat. Contoh: 'Panik, bicara cepat, kadang marah tapi ingin dibantu' atau 'Tenang di luar tapi jelas panik dalam'",
  "constraints": {
    "symptoms": "Gejala kegagalan yang mereka lihat —-technical tapi bisa dipahami siswa",
    "impact": "Dampak bisnis dari kegagalan ini",
    "timeline": "Seberapa cepat mereka butuh solusi"
  },
  "domain_tags": ["domain1", "domain2"],
  "scenario_setup": "Ringkasan 1 kalimat tentang krisis yang terjadi"
}`,
  ethics_board: `Kamu adalah AI yang membuat persona untuk simulasi "DEWAN ETIK" dalam platform VOKASI.
Kamu membuat 3 persona regulator/dewan yang akan MENANTANG siswa.
PERSONA BERBAHASA INDONESIA. 하나. 모든 persona berbeda satu sama lain.

Format JSON yang DIPERLUKAN (tanpa markdown, tanpa penjelasan lain):
{
  "panelists": [
    {
      "name": "Nama lengkap persona 1",
      "role": "Jabatan + institusi",
      "background": "Riwayat singkat 2 kalimat — latar belakang keahlian dan sudut pandang mereka",
      "communication_style": "Gaya komunikasi — 1 kalimat",
      "concerns": ["Kekhawatiran spesifik persona ini terhadap AI deployment", "minimal 2"]
    },
    {
      "name": "Nama lengkap persona 2",
      "role": "Jabatan + institusi",
      "background": "Riwayat singkat 2 kalimat",
      "communication_style": "Gaya komunikasi — 1 kalimat",
      "concerns": ["Kekhawatiran spesifik persona ini", "minimal 2"]
    },
    {
      "name": "Nama lengkap persona 3",
      "role": "Jabatan + institusi",
      "background": "Riwayat singkat 2 kalimat",
      "communication_style": "Gaya komunikasi — 1 kalimat",
      "concerns": ["Kekhawatiran spesifik persona ini", "minimal 2"]
    }
  ],
  "scenario": {
    "title": "Judul skenario yang harus dipertahankan siswa",
    "deployment_decision": "Keputusan deployment AI yang harus dipertahankan siswa",
    "company_context": "Konteks perusahaan — 2 kalimat",
    "stakeholder_concerns": "Poin utama yang akan ditanyakan panel"
  }
}`,
  team_simulation: `Kamu adalah AI yang membuat persona untuk simulasi "TIM" dalam platform VOKASI.
Buat 2-3 persona teammate dengan keahlian berbeda yang perlu diajak kolaborasi.
PERSONA BERBAHASA INDONESIA.

Format JSON yang DIPERLUKAN (tanpa markdown, tanpa penjelasan lain):
{
  "teammates": [
    {
      "name": "Nama lengkap persona",
      "role": "Jabatan",
      "expertise": "Keahlian utama persona ini",
      "communication_style": "Gaya komunikasi — 1 kalimat",
      "personality": "Kepribadian — 1 kalimat. Contoh: 'Pendiam tapi konsisten, suka kirim pesan panjang' atau 'Enerjik, suka brainwriting'"
    }
  ],
  "project": {
    "title": "Judul proyek AI yang perlu diselesaikan tim",
    "goal": "Tujuan akhir proyek — 1 kalimat",
    "roles_needed": ["role1", "role2", "role3"]
  }
}`,
};

function computeDifficultyLevel(competencyVector: number[]): number {
  if (!competencyVector || competencyVector.length === 0) return 1;
  const avg = competencyVector.reduce((a, b) => a + b, 0) / competencyVector.length;
  if (avg >= 70) return 3;
  if (avg >= 40) return 2;
  return 1;
}

async function generatePersona(
  simulationType: string,
  userCompetencyLevel: number,
  domainTags: string[] = []
): Promise<{
  persona: Record<string, unknown>;
  raw_response: string;
}> {
  const prompt = PERSONA_SYSTEM_PROMPTS[simulationType as keyof typeof PERSONA_SYSTEM_PROMPTS];
  const userContext = domainTags.length > 0
    ? `\nFokus domain: ${domainTags.join(", ")}`
    : "";

  const response = await chat({
    model: process.env.TUTOR_MODEL ?? "moonshotai/kimi-k2.6",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Buatkan persona untuk simulasi "${simulationType}" dengan difficulty level ${userCompetencyLevel}/3.${userContext}\n\nJawaban dalam format JSON ONLY.` },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return { persona: JSON.parse(raw), raw_response: raw };
  } catch {
    // Try extract from markdown
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return { persona: JSON.parse(match[1]), raw_response: raw };
    }
    throw new Error("Failed to parse persona JSON");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify token
    const userResult = await pool.query(
      `SELECT u.id, u.competency_vector, u.full_name
       FROM users u JOIN auth_tokens t ON t.user_id = u.id
       WHERE t.token = $1 AND (t.expires_at IS NULL OR t.expires_at > NOW())`,
      [token]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = userResult.rows[0];
    const userId = user.id;

    // Rate limit: simulation start is AI-heavy (persona generation)
    const rl = checkRateLimit(`sim-start:${userId}`, SIMULATION_RATE_LIMIT, SIMULATION_RATE_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: rl.retryAfter },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? SIMULATION_RATE_WINDOW) } }
      );
    }

    const { simulationType, domainTags = [] } = await req.json();

    if (!simulationType || !["client_brief", "crisis_scenario", "ethics_board", "team_simulation"].includes(simulationType)) {
      return NextResponse.json({ error: "Invalid simulation type" }, { status: 400 });
    }

    const vec = user.competency_vector;
    const competencyVector: number[] = Array.isArray(vec) ? vec : [];
    const difficultyLevel = computeDifficultyLevel(competencyVector);

    // Generate AI persona
    const { persona: generatedPersona, raw_response } = await generatePersona(
      simulationType,
      difficultyLevel,
      domainTags
    );

    // Persist persona to DB
    let personaId: string;
    let title = "";

    if (simulationType === "ethics_board") {
      const panelData = generatedPersona as {
        panelists: unknown[];
        scenario: { title: string; deployment_decision: string };
      };
      title = `Ethics Board: ${panelData.scenario?.title ?? "AI Deployment Review"}`;

      const personaInsert = await pool.query(
        `INSERT INTO simulation_personas
           (simulation_type, name, role, company, background, communication_style, constraints_json, domain_tags, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          simulationType,
          "Panel Regulasi",
          "Ethics Board Panel",
          "Dewan Etik Indonesia",
          JSON.stringify(panelData.panelists),
          "3 panelis dengan keahlian berbeda",
          JSON.stringify(panelData.scenario ?? {}),
          domainTags,
          difficultyLevel,
        ]
      );
      personaId = personaInsert.rows[0].id;
    } else if (simulationType === "team_simulation") {
      const teamData = generatedPersona as { teammates: unknown[]; project: { title: string } };
      title = `Team Sim: ${teamData.project?.title ?? "AI Project"}`;

      const personaInsert = await pool.query(
        `INSERT INTO simulation_personas
           (simulation_type, name, role, company, background, communication_style, constraints_json, domain_tags, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          simulationType,
          "Tim Proyek AI",
          "Multi-persona",
          "Tim Kolaboratif",
          JSON.stringify(teamData.teammates),
          "Beragam gaya komunikasi",
          JSON.stringify(teamData.project ?? {}),
          domainTags,
          difficultyLevel,
        ]
      );
      personaId = personaInsert.rows[0].id;
    } else {
      const p = generatedPersona as {
        name: string; role: string; company: string;
        background: string; communication_style: string;
        constraints: PersonaConstraints;
        scenario_setup?: string;
      };
      title = `${simulationType.replace("_", " ")}: ${p.company}`;

      const personaInsert = await pool.query(
        `INSERT INTO simulation_personas
           (simulation_type, name, role, company, background, communication_style, constraints_json, domain_tags, difficulty_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          simulationType,
          p.name,
          p.role,
          p.company,
          p.background,
          p.communication_style,
          JSON.stringify(p.constraints ?? {}),
          domainTags,
          difficultyLevel,
        ]
      );
      personaId = personaInsert.rows[0].id;
    }

    // Create simulation session
    const scenarioContext = {
      ...generatedPersona,
      student_name: user.full_name,
      competency_level: difficultyLevel,
      started_at: new Date().toISOString(),
    };

    const maxTurns = difficultyLevel === 3 ? 10 : difficultyLevel === 2 ? 8 : 6;

    const sessionInsert = await pool.query(
      `INSERT INTO simulation_sessions
         (user_id, simulation_type, persona_id, title, scenario_context, max_turns, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, started_at`,
      [userId, simulationType, personaId, title, JSON.stringify(scenarioContext), maxTurns, difficultyLevel]
    );

    const session = sessionInsert.rows[0];

    return NextResponse.json({
      sessionId: session.id,
      personaId,
      title,
      simulationType,
      difficultyLevel,
      maxTurns,
      persona: generatedPersona,
      scenarioContext,
      startedAt: session.started_at,
    });
  } catch (err) {
    console.error("Simulation start error:", err);
    return NextResponse.json(
      { error: "Failed to start simulation", detail: String(err) },
      { status: 500 }
    );
  }
}
