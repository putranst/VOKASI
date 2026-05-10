// VOKASI2 — Template Customization via LLM
// Takes a template's block structure + course requirements → AI customizes content
// Adapted from MAIC-UI's TemplateCustomizer

import { chat, type PuckBlock } from "./openrouter";

export interface CustomizeOptions {
  templateBlocks: PuckBlock[];
  title: string;
  description?: string;
  domain?: string;
  targetAudience?: string;
  courseGoals?: string;
  model?: string;
}

const CUSTOMIZE_SYSTEM = `You are an expert course content customizer. You receive a course template (Puck blocks) and course requirements, then customize the content while preserving the template structure.

Rules:
- Keep ALL block types and their order EXACTLY the same
- Replace placeholder content with domain-specific material
- Adjust language complexity for the target audience
- Keep quiz structure but change questions/answers to match the new topic
- Update ModuleHeader titles, subtitles, and learning objectives
- Replace RichContent html with topic-relevant content (200+ words per block)
- Update VideoBlock captions (keep URL structure)
- Update Assignment descriptions and ReflectionJournal prompts
- Return ONLY a valid JSON array of customized blocks`;

export async function customizeTemplate(options: CustomizeOptions): Promise<PuckBlock[]> {
  const {
    templateBlocks,
    title,
    description,
    domain,
    targetAudience,
    courseGoals,
    model = process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
  } = options;

  const prompt = `Customize this course template for a new course.

COURSE REQUIREMENTS:
Title: ${title}
${description ? `Description: ${description}` : ""}
${domain ? `Domain: ${domain}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${courseGoals ? `Goals: ${courseGoals}` : ""}

TEMPLATE (Puck blocks to customize):
${JSON.stringify(templateBlocks.slice(0, 30), null, 2)}

Return the customized blocks as a JSON array. Keep the exact same block types, order, and structure — only change the content within each block's props.`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: CUSTOMIZE_SYSTEM },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 8000,
  });

  if (!response.ok) {
    throw new Error(`Template customization failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "[]";

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse customized template blocks");
  }
}
