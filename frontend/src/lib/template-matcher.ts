// VOKASI2 — Template Matching Algorithm
// Multi-factor weighted scoring adapted from MAIC-UI's TemplateRegistry
// Weights: keywords 0.4, category 0.3, domain 0.15, grade_level 0.15

export interface TemplateMatchRequirements {
  title: string;
  description?: string;
  domain?: string;
  targetAudience?: string;
  difficulty?: string;
}

export interface TemplateRow {
  id: string;
  template_code: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  grade_levels: string[];
  domain_tags: string[];
  block_structure: unknown;
  usage_count: number;
  average_rating: number;
}

export interface MatchedTemplate extends TemplateRow {
  match_score: number;
  match_explanation: string;
}

// ─── Scoring Functions ──────────────────────────────────────────────────

/** Jaccard similarity between two string sets */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/** Extract keywords from text (simple tokenization) */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "and", "but", "or",
    "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
    "every", "all", "any", "few", "more", "most", "other", "some", "such",
    "than", "too", "very", "just", "about", "up", "out", "if", "then",
    "that", "this", "these", "those", "it", "its", "they", "them", "their",
    "we", "our", "you", "your", "he", "him", "his", "she", "her",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/** Category match — exact or fuzzy (tech→technology, business→management) */
function categoryScore(requirement: string, template: string): number {
  if (!requirement || !template) return 0;
  const r = requirement.toLowerCase();
  const t = template.toLowerCase();

  // Exact match
  if (r === t) return 1.0;

  // Fuzzy synonyms
  const synonyms: Record<string, string[]> = {
    tech: ["technology", "software", "engineering", "programming", "development"],
    business: ["management", "entrepreneurship", "marketing", "finance", "commerce"],
    creative: ["design", "art", "media", "multimedia", "visual"],
    science: ["research", "data", "analytics", "scientific"],
    health: ["medical", "healthcare", "wellness", "clinical"],
    education: ["teaching", "pedagogy", "learning", "training"],
  };

  for (const [, syns] of Object.entries(synonyms)) {
    const group = syns.concat(syns[0]);
    if (group.includes(r) && group.includes(t)) return 0.8;
  }

  // Substring match
  if (r.includes(t) || t.includes(r)) return 0.6;

  return 0;
}

/** Difficulty/grade level match */
function gradeLevelScore(requirement: string, grades: string[]): number {
  if (!requirement || grades.length === 0) return 0.5; // neutral if no data

  const difficultyMap: Record<string, number> = {
    beginner: 1,
    basic: 1,
    intermediate: 2,
    medium: 2,
    advanced: 3,
    expert: 3,
  };

  const reqLevel = difficultyMap[requirement.toLowerCase()] ?? 2;
  const gradeLevels = grades.map((g) => difficultyMap[g.toLowerCase()] ?? 2);

  // Closest match
  const closest = gradeLevels.reduce(
    (min, level) => Math.min(min, Math.abs(level - reqLevel)),
    Infinity
  );

  // 0 distance = 1.0, 1 distance = 0.6, 2 distance = 0.2
  return Math.max(0, 1 - closest * 0.4);
}

// ─── Main Matching Function ─────────────────────────────────────────────

const WEIGHTS = {
  keywords: 0.4,
  category: 0.3,
  domain: 0.15,
  gradeLevel: 0.15,
};

const USAGE_BONUS_FACTOR = 0.01;
const USAGE_BONUS_CAP = 0.1;

export function matchTemplates(
  requirements: TemplateMatchRequirements,
  templates: TemplateRow[]
): MatchedTemplate[] {
  const reqKeywords = extractKeywords(
    [requirements.title, requirements.description, requirements.domain]
      .filter(Boolean)
      .join(" ")
  );

  const scored: MatchedTemplate[] = templates.map((t) => {
    // Keyword similarity
    const keywordSim = jaccardSimilarity(reqKeywords, t.keywords);

    // Category match
    const catScore = categoryScore(requirements.domain ?? "", t.category);

    // Domain tag overlap
    const domainTags = requirements.domain ? [requirements.domain] : [];
    const domainSim = jaccardSimilarity(domainTags, t.domain_tags);

    // Grade level match
    const gradeScore = gradeLevelScore(
      requirements.difficulty ?? "",
      t.grade_levels
    );

    // Weighted sum
    const baseScore =
      keywordSim * WEIGHTS.keywords +
      catScore * WEIGHTS.category +
      domainSim * WEIGHTS.domain +
      gradeScore * WEIGHTS.gradeLevel;

    // Usage bonus (popularity)
    const usageBonus = Math.min(
      t.usage_count * USAGE_BONUS_FACTOR,
      USAGE_BONUS_CAP
    );

    const finalScore = Math.min(baseScore + usageBonus, 1.0);

    // Human-readable explanation
    const explanation = buildExplanation(keywordSim, catScore, domainSim, gradeScore, usageBonus);

    return {
      ...t,
      match_score: Math.round(finalScore * 1000) / 1000,
      match_explanation: explanation,
    };
  });

  // Sort by score descending
  return scored.sort((a, b) => b.match_score - a.match_score);
}

function buildExplanation(
  keyword: number,
  category: number,
  domain: number,
  grade: number,
  usage: number
): string {
  const parts: string[] = [];

  if (keyword > 0.5) parts.push("strong keyword match");
  else if (keyword > 0.2) parts.push("moderate keyword match");

  if (category > 0.8) parts.push("exact category match");
  else if (category > 0.5) parts.push("related category");

  if (domain > 0.3) parts.push("domain overlap");

  if (grade > 0.8) parts.push("difficulty fit");
  else if (grade < 0.4) parts.push("difficulty mismatch");

  if (usage > 0.02) parts.push("popular template");

  return parts.length > 0 ? parts.join(", ") : "low match";
}
