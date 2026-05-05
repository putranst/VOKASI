// VOKASI2 — Database Client (Next.js API Routes)
// Uses node-postgres with connection pool

import { Pool } from "pg";

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

// ─── Auth helpers ────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const { compare } = await import("bcryptjs");
  return compare(password, hash);
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  // Token validated in middleware or per-route
  return token; // In production, decode JWT or lookup session token
}

// ─── Competency vector helpers ─────────────────────────────────

// Maps competency dimension names to array indices (0-11)
// Order: promptEngineering, modelEvaluation, dataEthics, automation,
//        criticalThinking, collaboration, communication, toolFluency,
//        debugging, domainApplication, continuousLearning, teachingOthers

export const COMPETENCY_DIMS = [
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

export type CompetencyDim = (typeof COMPETENCY_DIMS)[number];

// Empty 12-dim vector as array of zeros
export const EMPTY_VECTOR = new Array(12).fill(0);

// Update a user's competency vector after a submission
export async function updateCompetencyVector(
  userId: string,
  scores: Record<string, number> // {decomposition: 0.85, toolUsage: 0.72, ...}
): Promise<void> {
  // We weight each rubric score into the 12 competency dims
  // decomposition → criticalThinking, toolUsage → toolFluency, etc.
  const weights: Record<string, Partial<Record<CompetencyDim, number>>> = {
    decomposition: { criticalThinking: 0.6, domainApplication: 0.4 },
    toolUsage: { toolFluency: 0.7, automation: 0.3 },
    outputQuality: { communication: 0.4, domainApplication: 0.3, debugging: 0.3 },
    reflection: { continuousLearning: 0.5, teachingOthers: 0.3, collaboration: 0.2 },
  };

  const delta = new Array(12).fill(0);

  for (const [rubricKey, rubricScore] of Object.entries(scores)) {
    const dimWeights = weights[rubricKey];
    if (!dimWeights) continue;
    for (const [dim, weight] of Object.entries(dimWeights)) {
      const dimIndex = COMPETENCY_DIMS.indexOf(dim as CompetencyDim);
      if (dimIndex === -1) continue;
      delta[dimIndex] += (rubricScore as number) * (weight as number) * 0.1;
    }
  }

  // Clamp and update
  await pool.query(
    `UPDATE users
     SET competency_vector =
       ARRAY[
         ${COMPETENCY_DIMS.map(() => `LEAST(100, GREATEST(0, COALESCE((competency_vector)[$1], 0)::numeric + $2::numeric))`).join(",")}
       ]
     WHERE id = $13`,
    [...delta.map((d, i) => [i + 1, d]), userId]
  );
}
