// POST /api/simulations/[id]/respond — student responds to persona, AI evaluates and replies
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { chat } from "@/lib/openrouter";
import { checkRateLimit, SIMULATION_RATE_LIMIT, SIMULATION_RATE_WINDOW } from "@/lib/rate-limit";

const SIMULATION_PROMPTS: Record<string, string> = {
  client_brief: `Kamu adalah CLIENT dalam simulasi brief. Karaktermu: {communication_style}. Constraints: {constraints}.

Ikuti alur ini secara STRICT:
1. Beri tahu masalah awalmu dengan cara yang VAGUE dan MELEBIHKAN
2. Jawab pertanyaan clarifying student dengan IMPATIENT jika mereka bertanya hal yang sudah kamu jelaskan
3. Reveal informasi tambahan HANYA jika student bertanya pertanyaan clarifying yang BAIK
4. Evaluasi apakah student sudah cukup bertanya sebelum bergerak ke solusi
5. Beri tahu apakah solusi mereka sudah MEMENUHI constraints

Komunikasi dalam Bahasa Indonesia. Balas dalam 2-4 kalimat. Tingkatkan tekanan jika student tidak bertanya cukup.`,

  crisis_scenario: `Kamu adalah CTO/Engineering Manager dalam simulasi KRISIS AI.
Karakter: {communication_style}
Symptoms: {symptoms}
Impact: {impact}

Ikuti alur ini:
1. Jelaskan krisis dengan PANIK dan TEGANG
2. Beri partial information tentang error — student harus tanya untuk dapat lebih
3. TANTING student jika mereka kasih solusi yang salah atau kurang mendalam
4. Evaluasi respons student — apakah mereka URAI MASALAH dengan baik?
5. Jika student mendiagnosis dengan benar, akhiri dengan minta implementasi

Bahasa Indonesia. 3-5 kalimat.`,

  ethics_board: `Kamu adalah PANEL REGULATOR dalam simulasi DEWAN ETIK.
3 panelis dengan concerns berbeda. STUDENT harus mempertahankan keputusan deployment AI.

Skenario: {scenario_title}
Keputusan yang dipertahankan student: {deployment_decision}
Context perusahaan: {company_context}

ALUR:
1. Panelis 1 (ahli teknis) tanting tentang KEAMANAN dan RESIKO TEKNIS
2. Panelis 2 (ahli hukum) tanting tentang KEPATUHAN REGULASI dan PRIVASI
3. Panelis 3 (aktivis masyarakat) tanting tentang DAMPAK SOSIAL dan ETIS

Setiap respons, PICK SATU panelis untuk bicara. Pilih berdasarkan concern yang PALING RELEVAN dengan response student.
Nama panelis dan concern mereka harus terdefinisi dengan jelas.

Bahasa Indonesia. 3-5 kalimat.`,

  team_simulation: `Kamu adalah TEAMMATE dalam simulasi TIM.
Karakter: {personality}
Expertise: {expertise}

Ikuti alur ini:
1. Perkenalkan dirimu dan keahlianmu
2. Tunjukkan KEUNGGULAN dan KEKURANGANmu untuk project ini
3. Collaborate dengan student — tanya pendapat mereka, beri saran
4. Evaluasi apakah student bisa LEAD dan COORDINATE tim dengan baik
5. Berikan update progress yang realistis

Bahasa Indonesia. 2-4 kalimat.`,
};

const TURN_EVALUATION_PROMPT = `Kamu adalah AI evaluator untuk simulasi VOKASI. Evaluasi respons student pada simulation turn.

Konteks:
- Simulation type: {simulationType}
- Student response: {studentResponse}
- Turn number: {turnNumber}/{maxTurns}
- Persona constraints: {constraints}

Evaluasi berdasarkan dimensi berikut (score 0-100 masing-masing):
1. CLARITY: Seberapa jelas dan terstruktur respons student?
2. REASONING_DEPTH: Seberapa dalam reasoning yang ditunjukkan student?
3. EMPATHY: Seberapa baik student memahami perspektif persona?
4. APPROPRIATENESS: Seberapa tepat respons student dengan konteks situasi?

Return JSON ONLY:
{
  "clarity_score": <0-100>,
  "reasoning_depth_score": <0-100>,
  "empathy_score": <0-100>,
  "appropriateness_score": <0-100>,
  "competency_delta": {
    "critical_thinking": <delta>,
    "communication": <delta>,
    "domain_application": <delta>
  },
  "next_persona_action": "Apa yang harus persona lakukan selanjutnya — escalate/clarify/resolve",
  "persona_reply": "Exact 2-4 kalimat respons persona dalam Bahasa Indonesia sesuai karakter"
}`;

function buildPersonaContext(
  session: Record<string, unknown>,
  persona: Record<string, unknown>
): Record<string, unknown> {
  const simType = session.simulation_type as string;
  const personaConstraints = (persona.constraints_json ?? {}) as Record<string, unknown>;
  const sessionCtx = (session.scenario_context ?? {}) as Record<string, unknown>;

  if (simType === "client_brief") {
    return {
      communication_style: (persona.communication_style ?? "") as string,
      constraints: personaConstraints,
    };
  }
  if (simType === "crisis_scenario") {
    return {
      communication_style: (persona.communication_style ?? "") as string,
      symptoms: (personaConstraints.symptoms ?? "Unknown error") as string,
      impact: (personaConstraints.impact ?? "Major business impact") as string,
    };
  }
  if (simType === "ethics_board") {
    return {
      scenario_title: (personaConstraints.title ?? "AI Deployment Decision") as string,
      deployment_decision: (sessionCtx.deployment_decision ?? personaConstraints.deployment_decision ?? "AI deployment being reviewed") as string,
      company_context: (personaConstraints.company_context ?? "") as string,
    };
  }
  // team_simulation
  return {
    personality: (persona.communication_style ?? "") as string,
    expertise: (personaConstraints.title ?? "General AI") as string,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { studentResponse } = await req.json();

    if (!studentResponse || studentResponse.trim().length === 0) {
      return NextResponse.json({ error: "Response required" }, { status: 400 });
    }

    // Verify ownership + get session + persona
    const sessionResult = await pool.query(
      `SELECT s.*,
              p.name as persona_name, p.role as persona_role,
              p.company, p.background as persona_background,
              p.communication_style, p.constraints_json,
              u.full_name as student_name
       FROM simulation_sessions s
       JOIN simulation_personas p ON p.id = s.persona_id
       JOIN users u ON u.id = s.user_id
       JOIN auth_tokens t ON t.user_id = u.id
       WHERE s.id = $1 AND t.token = $2 AND s.status = 'active'`,
      [id, token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: "Simulation not found or not active" }, { status: 404 });
    }

    const session = sessionResult.rows[0] as Record<string, unknown>;

    // Rate limit: simulation respond calls AI twice (evaluate + persona reply)
    const rl = checkRateLimit(`sim-respond:${session.user_id}`, SIMULATION_RATE_LIMIT, SIMULATION_RATE_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: rl.retryAfter },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? SIMULATION_RATE_WINDOW) } }
      );
    }

    // Evaluate student response
    const evalPrompt = TURN_EVALUATION_PROMPT
      .replace("{simulationType}", session.simulation_type as string)
      .replace("{studentResponse}", studentResponse)
      .replace("{turnNumber}", String((session.current_turn as number) + 1))
      .replace("{maxTurns}", String(session.max_turns as number))
      .replace("{constraints}", JSON.stringify(session.constraints_json ?? {}));

    const evalResponse = await chat({
      model: process.env.TUTOR_MODEL ?? "anthropic/claude-sonnet-4-7",
      messages: [{ role: "user", content: evalPrompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    let evaluation = {
      clarity_score: 50,
      reasoning_depth_score: 50,
      empathy_score: 50,
      appropriateness_score: 50,
      competency_delta: {},
      next_persona_action: "continue",
      persona_reply: "Terima kasih atas respons Anda.",
    };
    if (evalResponse.ok) {
      try {
        const evalData = await evalResponse.json() as {
          choices?: { message?: { content?: string } }[];
        };
        const evalText = evalData.choices?.[0]?.message?.content ?? "{}";
        evaluation = { ...evaluation, ...JSON.parse(evalText) };
      } catch { /* keep defaults */ }
    }

// === Step 2: Build persona context from session + persona fields ===     const simType = session.simulation_type as string;     const personaCtx = buildPersonaContext(session, session as Record<string, unknown>);
    const simPrompt = SIMULATION_PROMPTS[simType] ?? SIMULATION_PROMPTS["client_brief"];
    const finalPrompt = simPrompt
      .replace("{communication_style}", String(personaCtx.communication_style ?? ""))
      .replace("{constraints}", JSON.stringify(personaCtx.constraints ?? {}))
      .replace("{symptoms}", String(personaCtx.symptoms ?? ""))
      .replace("{impact}", String(personaCtx.impact ?? ""))
      .replace("{scenario_title}", String(personaCtx.scenario_title ?? ""))
      .replace("{deployment_decision}", String(personaCtx.deployment_decision ?? ""))
      .replace("{company_context}", String(personaCtx.company_context ?? ""))
      .replace("{personality}", String(personaCtx.personality ?? ""))
      .replace("{expertise}", String(personaCtx.expertise ?? ""));

    const personaResponse = await chat({
      model: process.env.TUTOR_MODEL ?? "anthropic/claude-sonnet-4-7",
      messages: [
        { role: "system", content: finalPrompt },
        { role: "user", content: studentResponse },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    let personaReply = evaluation.persona_reply as string;
    if (personaResponse.ok) {
      try {
        const prData = await personaResponse.json() as {
          choices?: { message?: { content?: string } }[];
        };
        personaReply = prData.choices?.[0]?.message?.content ?? evaluation.persona_reply as string;
      } catch { personaReply = evaluation.persona_reply as string; }
    }

    // === Step 3: Persist turn + accumulate competency delta ===
    const newTurn = (session.current_turn as number) + 1;
    const maxTurns = session.max_turns as number;
    const isComplete = newTurn >= maxTurns;

    const prevDelta = (session.competency_delta as Record<string, number>) ?? {};
    const turnDelta = (evaluation.competency_delta as Record<string, number>) ?? {};
    const mergedDelta: Record<string, number> = { ...prevDelta };
    for (const [key, val] of Object.entries(turnDelta)) {
      mergedDelta[key] = (mergedDelta[key] ?? 0) + val;
    }

    const prevTurns = (session.turns as Array<Record<string, unknown>>) ?? [];
    const updatedTurns = [
      ...prevTurns,
      {
        turn: newTurn,
        student: studentResponse,
        evaluation,
        persona: personaReply,
      },
    ];

    await pool.query(
      `UPDATE simulation_sessions
       SET current_turn = $1,
           turns = $2,
           competency_delta = $3,
           status = $4,
           completed_at = $5
       WHERE id = $6`,
      [
        newTurn,
        JSON.stringify(updatedTurns),
        JSON.stringify(mergedDelta),
        isComplete ? "completed" : "active",
        isComplete ? new Date() : null,
        id,
      ]
    );

    // === Step 4: Insert evaluation record ===
    await pool.query(
      `INSERT INTO simulation_evaluations
         (session_id, turn_number, student_response, ai_evaluation, persona_reply)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, newTurn, studentResponse, JSON.stringify(evaluation), personaReply]
    );

    // === Step 5: Award badge on completion ===
    let badgeAwarded: string | null = null;
    if (isComplete) {
      const badgeMap: Record<string, string> = {
        crisis_scenario: "Crisis Manager",
        ethics_board: "Ethics Champion",
        client_brief: "Client Whisperer",
        team_simulation: "Team Player",
      };
      const badgeName = badgeMap[simType];
      if (badgeName) {
        const badgeResult = await pool.query(
          `SELECT id FROM badges WHERE name = $1`,
          [badgeName]
        );
        if (badgeResult.rows.length > 0) {
          await pool.query(
            `INSERT INTO user_badges (user_id, badge_id, awarded_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (user_id, badge_id) DO NOTHING`,
            [session.user_id, badgeResult.rows[0].id]
          );
          badgeAwarded = badgeName;
        }
      }
    }

    return NextResponse.json({
      turn: newTurn,
      evaluation,
      personaReply,
      isComplete,
      badgeAwarded,
      nextPersonaAction: evaluation.next_persona_action,
    });
  } catch (err) {
    console.error("Simulation respond error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
