// VOKASI2 — Heavy Mode Multi-Stage Generator
// Adapted from MAIC-UI's heavy_generator.py (2-3 min, multi-stage with validation)
// Pipeline: Analyze → Plan → Generate → Validate → Polish

import { chat, type PuckBlock } from "./openrouter";
import { validateBlocks } from "./content-validator";

export interface HeavyOptions {
  content: string;
  title?: string;
  domain?: string;
  targetAudience?: string;
  courseGoals?: string;
  model?: string;
  onStage?: (stage: string, message: string, percent: number) => void;
  onBlock?: (index: number, block: PuckBlock) => void;
}

interface ContentAnalysis {
  keyConcepts: string[];
  learningObjectives: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  topicBreakdown: { topic: string; subtopics: string[]; estimatedMinutes: number }[];
  suggestedBlockTypes: string[];
}

interface BlockPlan {
  moduleIndex: number;
  moduleTitle: string;
  blocks: { type: string; purpose: string; contentHint: string }[];
}

// ─── Stage 1: Content Analysis ──────────────────────────────────────────

async function analyzeContent(
  content: string,
  title: string,
  domain: string | undefined,
  model: string
): Promise<ContentAnalysis> {
  const prompt = `Analyze this educational content and return a structured analysis.

Title: ${title}
${domain ? `Domain: ${domain}` : ""}

Content:
${content.slice(0, 10000)}

Return ONLY a JSON object:
{
  "keyConcepts": ["concept1", "concept2", ...],
  "learningObjectives": ["objective1", "objective2", ...],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "prerequisites": ["prereq1", "prereq2", ...],
  "topicBreakdown": [
    { "topic": "Topic Name", "subtopics": ["sub1", "sub2"], "estimatedMinutes": 30 }
  ],
  "suggestedBlockTypes": ["ModuleHeader", "RichContent", "QuizBuilder", ...]
}`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: "You are an expert curriculum analyst. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  if (!response.ok) throw new Error(`Stage 1 failed: ${response.status}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "{}";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Stage 1: Failed to parse analysis JSON");
  return JSON.parse(match[0]);
}

// ─── Stage 2: Block Structure Planning ──────────────────────────────────

async function planBlocks(
  analysis: ContentAnalysis,
  title: string,
  targetAudience: string | undefined,
  model: string
): Promise<BlockPlan[]> {
  const prompt = `Based on this content analysis, plan the block structure for a course.

Analysis:
${JSON.stringify(analysis, null, 2)}

Course Title: ${title}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}

Return ONLY a JSON array of module plans:
[
  {
    "moduleIndex": 0,
    "moduleTitle": "Module 1: ...",
    "blocks": [
      { "type": "ModuleHeader", "purpose": "Introduce module", "contentHint": "..." },
      { "type": "RichContent", "purpose": "Explain key concept X", "contentHint": "..." },
      { "type": "QuizBuilder", "purpose": "Test understanding of X", "contentHint": "3 questions on..." }
    ]
  }
]

Rules:
- Each module MUST start with ModuleHeader
- Each module MUST have at least 1 QuizBuilder
- Mix RichContent with practical blocks (CodeSandbox, Assignment, ReflectionJournal)
- Aim for 4-6 modules
- Each module: 5-8 blocks`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: "You are an expert curriculum planner. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 3000,
  });

  if (!response.ok) throw new Error(`Stage 2 failed: ${response.status}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "[]";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Stage 2: Failed to parse plan JSON");
  return JSON.parse(match[0]);
}

// ─── Stage 3: Block Content Generation (parallel) ───────────────────────

async function generateModuleBlocks(
  plan: BlockPlan,
  sourceContent: string,
  analysis: ContentAnalysis,
  model: string,
  onBlock?: (index: number, block: PuckBlock) => void,
  globalOffset: number = 0
): Promise<PuckBlock[]> {
  const prompt = `Generate the actual Puck block content for this module.

Module Plan:
${JSON.stringify(plan, null, 2)}

Source Content (relevant excerpts):
${sourceContent.slice(0, 8000)}

Key Concepts: ${analysis.keyConcepts.join(", ")}
Learning Objectives: ${analysis.learningObjectives.join(", ")}

Return ONLY a JSON array of blocks with REAL content:
[
  { "type": "ModuleHeader", "props": { "title": "...", "subtitle": "...", "learningObjectives": "...", "estimatedMinutes": 30 } },
  { "type": "RichContent", "props": { "html": "<h2>...</h2><p>Substantial content here (200+ words)...</p>" } },
  ...
]

CRITICAL:
- RichContent html must be SUBSTANTIAL (200+ words per block, with headings, examples, lists)
- QuizBuilder questions must have clear correct answers
- Use real content from the source material, not placeholders
- CodeSandbox should have meaningful starter code and instructions`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: "You are an expert course content writer. Return ONLY valid JSON array." },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 6000,
  });

  if (!response.ok) throw new Error(`Stage 3 failed for module ${plan.moduleIndex}: ${response.status}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "[]";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Stage 3: Failed to parse blocks for module ${plan.moduleIndex}`);
  const blocks: PuckBlock[] = JSON.parse(match[0]);

  // Emit blocks as they're generated
  blocks.forEach((block, i) => {
    onBlock?.(globalOffset + i, block);
  });

  return blocks;
}

// ─── Stage 4: Validation ────────────────────────────────────────────────

function validateAndFix(blocks: PuckBlock[]): PuckBlock[] {
  const result = validateBlocks(blocks);

  if (result.fixedBlocks) {
    console.log(`[Heavy] Auto-fixed ${result.warnings.filter((w) => w.startsWith("Auto-fix")).length} issues`);
    return result.fixedBlocks;
  }

  if (!result.valid) {
    console.warn("[Heavy] Validation errors:", result.errors.filter((e) => e.severity === "error"));
  }

  return blocks;
}

// ─── Stage 5: Polish (optional) ─────────────────────────────────────────

async function polishBlocks(
  blocks: PuckBlock[],
  analysis: ContentAnalysis,
  model: string
): Promise<PuckBlock[]> {
  // Only polish if there are RichContent blocks to improve
  const richContentCount = blocks.filter((b) => b.type === "RichContent").length;
  if (richContentCount < 2) return blocks;

  const prompt = `Polish these course blocks for consistency and quality.

Key Concepts: ${analysis.keyConcepts.join(", ")}
Difficulty: ${analysis.difficulty}

Current Blocks (JSON):
${JSON.stringify(blocks.slice(0, 20), null, 2)}

Improve:
- Consistent tone and formatting across RichContent blocks
- Ensure learning objectives from ModuleHeaders are actually covered in content
- Add transitions between modules ("In the previous module, we learned... Now we'll explore...")
- Make quiz questions clearer and more precise

Return the SAME JSON array structure with improved content. Keep all block types and structure identical — only improve the content within props.`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: "You are an expert content editor. Improve the content while keeping the exact same JSON structure. Return ONLY valid JSON array." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 8000,
  });

  if (!response.ok) {
    console.warn("[Heavy] Polish stage failed, returning unpolished blocks");
    return blocks;
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    console.warn("[Heavy] Failed to parse polished blocks, returning unpolished");
    return blocks;
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    console.warn("[Heavy] Failed to parse polished JSON, returning unpolished");
    return blocks;
  }
}

// ─── Main Heavy Pipeline ────────────────────────────────────────────────

export async function generateHeavy(options: HeavyOptions): Promise<PuckBlock[]> {
  const {
    content,
    title = "Untitled Course",
    domain,
    targetAudience,
    courseGoals,
    model = process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
    onStage,
    onBlock,
  } = options;

  const TOTAL_STAGES = 5;

  // Stage 1: Analyze
  onStage?.("analyzing", "Stage 1/5: Analyzing content structure...", Math.round((1 / TOTAL_STAGES) * 100));
  const analysis = await analyzeContent(content, title, domain, model);
  console.log(`[Heavy] Stage 1 complete: ${analysis.keyConcepts.length} concepts, ${analysis.topicBreakdown.length} topics`);

  // Stage 2: Plan
  onStage?.("planning", "Stage 2/5: Planning block structure...", Math.round((2 / TOTAL_STAGES) * 100));
  const plans = await planBlocks(analysis, title, targetAudience, model);
  console.log(`[Heavy] Stage 2 complete: ${plans.length} modules planned`);

  // Stage 3: Generate blocks (sequential per module to respect rate limits)
  onStage?.("generating", "Stage 3/5: Generating module content...", Math.round((3 / TOTAL_STAGES) * 100));
  const allBlocks: PuckBlock[] = [];
  for (const plan of plans) {
    const moduleBlocks = await generateModuleBlocks(plan, content, analysis, model, onBlock, allBlocks.length);
    allBlocks.push(...moduleBlocks);
    // Update progress within stage 3
    const subProgress = 3 / TOTAL_STAGES + (1 / TOTAL_STAGES) * ((plans.indexOf(plan) + 1) / plans.length);
    onStage?.("generating", `Stage 3/5: Generated module ${plans.indexOf(plan) + 1}/${plans.length}...`, Math.round(subProgress * 100));
  }
  console.log(`[Heavy] Stage 3 complete: ${allBlocks.length} blocks generated`);

  // Stage 4: Validate
  onStage?.("validating", "Stage 4/5: Validating content...", Math.round((4 / TOTAL_STAGES) * 100));
  const validatedBlocks = validateAndFix(allBlocks);
  console.log(`[Heavy] Stage 4 complete: ${validatedBlocks.length} validated blocks`);

  // Stage 5: Polish
  onStage?.("polishing", "Stage 5/5: Polishing final output...", Math.round((5 / TOTAL_STAGES) * 100));
  const polishedBlocks = await polishBlocks(validatedBlocks, analysis, model);
  console.log(`[Heavy] Stage 5 complete: ${polishedBlocks.length} polished blocks`);

  return polishedBlocks;
}
