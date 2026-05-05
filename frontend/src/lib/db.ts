// VOKASI2 — Database Client (Next.js API Routes)
import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pool: Pool | undefined };

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

export async function hashPassword(password: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const { compare } = await import("bcryptjs");
  return compare(password, hash);
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

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
