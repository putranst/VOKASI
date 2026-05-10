// VOKASI2 — OpenRouter AI Client
// PRD v2.3 §5: Single OpenRouter API call, streaming, model selection

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

/** Generic chat — returns raw Response for streaming, parsed JSON for non-streaming */
export async function chat(options: ChatOptions): Promise<Response> {
  const {
    model = process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
    messages,
    temperature = 0.7,
    max_tokens = 2048,
  } = options;
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "VOKASI2",
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });
}

/** Alias for openrouterChat — used by API routes for generic chat */
export const openrouterChat = chat;


// Types for Puck block generation
export interface PuckBlock {
  type: string;
  props: Record<string, unknown>;
}

export interface GenerateBlocksOptions {
  content: string;
  title?: string;
  domain?: string;
  targetAudience?: string;
  courseGoals?: string;
  mode?: "fast" | "heavy";
  model?: string;
  max_tokens?: number;
  onProgress?: (stage: string, message: string, percent: number) => void;
  onBlock?: (index: number, block: PuckBlock) => void;
}

const BLOCK_GENERATION_SYSTEM = `You are an expert vocational curriculum designer. You generate course content as Puck editor blocks.

Available block types and their required props:
- ModuleHeader: { title: string, subtitle: string, learningObjectives: string (newline-separated), estimatedMinutes: number }
- RichContent: { html: string } — rich HTML lesson content with headings, paragraphs, lists, examples
- VideoBlock: { videoUrl: string, caption: string, transcriptUrl?: string }
- QuizBuilder: { quizTitle: string, questions: [{ question: string, options: string (newline-separated), correctIndex: number }], passingScore: number }
- CodeSandbox: { language: "python"|"javascript"|"typescript"|"java"|"sql", starterCode: string, instructions: string, testCases?: string }
- Assignment: { title: string, description: string, dueLabel: string, submissionType: "file"|"text"|"url"|"github", maxScore: number }
- ReflectionJournal: { prompt: string, minWords: number, tags: string }
- DiscussionSeed: { topic: string, seedPost: string, requiredReplies: number, gradingNotes: string }
- PeerReviewRubric: { rubricTitle: string, instructions: string, criteria: [{ criterion: string, maxPoints: number, description: string }] }
- SocraticChat: { seedQuestion: string, persona: string, maxTurns: number }

Rules:
- Return ONLY a valid JSON array of blocks. No markdown, no explanation.
- Each block: { "type": "BlockName", "props": { ... } }
- Start with ModuleHeader for each module
- Mix block types for variety (don't use only RichContent)
- Include at least 1 QuizBuilder per module
- Make content practical and vocational (real-world applications)
- RichContent html should be substantial (200+ words per block)`;

/** Fast mode: single AI call to generate all Puck blocks */
export async function generateFast(options: GenerateBlocksOptions): Promise<PuckBlock[]> {
  const {
    content,
    title = "Untitled Course",
    domain,
    targetAudience,
    courseGoals,
    model = process.env.DEFAULT_MODEL ?? "anthropic/claude-3.5-sonnet",
    max_tokens = 8000,
  } = options;

  const userPrompt = `Generate a complete course structure as Puck blocks.

Course Title: ${title}
${domain ? `Domain: ${domain}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${courseGoals ? `Course Goals:\n${courseGoals}` : ""}

Source Content:
${content.slice(0, 12000)}

Generate 4-6 modules. Each module should have:
1. ModuleHeader
2. 2-3 RichContent blocks with substantial lesson content
3. 1 VideoBlock (use placeholder YouTube URL if needed)
4. 1 QuizBuilder with 3-5 questions
5. 1 additional block (Assignment, ReflectionJournal, CodeSandbox, or DiscussionSeed)

Return as a JSON array of blocks.`;

  const response = await chat({
    model,
    messages: [
      { role: "system", content: BLOCK_GENERATION_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens,
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "[]";

  // Parse JSON array from response
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON array from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1]);
    // Try to find array in the text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);
    throw new Error("Failed to parse AI block generation response");
  }
}

// Structured evaluation: rubric-based AI feedback for challenge submissions
export async function evaluateSubmission(
  challengeTitle: string,
  rubricRawContent: string,
  submissionContent: string,
  reflectionText: string
): Promise<{
  scores: {
    decomposition: number;
    toolUsage: number;
    outputQuality: number;
    reflection: number;
  };
  narrative: string;
  suggestedResources: string[];
}> {
  const rubric = `You are an expert AI educator evaluating a student's submission for the challenge: "${challengeTitle}".

Challenge Rubric Context:
${rubricRawContent}

Student's Submission:
${submissionContent}

Student's Reflection:
${reflectionText}

Evaluate the submission on these 4 dimensions (score 0-100 for each):
1. DECOMPOSITION: Kemampuan memecah problema kompleks menjadi komponen analitis yang terstruktur.
2. TOOL USAGE: Penggunaan tools, data, dan teknik yang tepat dan efektif.
3. OUTPUT QUALITY: Kualitas output — kejelasan, kedalaman, dan usefulness of recommendations.
4. REFLECTION: Kedalaman refleksi — pembelajaran yang diidentifikasi, limitasi yang diakui, next steps.

Return a JSON object with this exact structure:
{
  "scores": {
    "decomposition": <0-100>,
    "toolUsage": <0-100>,
    "outputQuality": <0-100>,
    "reflection": <0-100>
  },
  "narrative": "<A detailed 2-3 paragraph narrative in Indonesian explaining the evaluation, specific strengths, weaknesses, and concrete improvement suggestions. Be encouraging but honest.>",
  "suggestedResources": ["<resource 1>", "<resource 2>", "<resource 3>"]
}

Be fair, specific, and constructive. Focus on the reasoning process, not just the output.`;

  const response = await chat({
    model: process.env.EVALUATION_MODEL ?? "anthropic/claude-3.5-sonnet",
    messages: [
      { role: "system", content: rubric },
      {
        role: "user",
        content: `Evaluate this submission:\n\nSubmission:\n${submissionContent}\n\nReflection:\n${reflectionText}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";

  // Parse JSON from response
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error("Failed to parse AI evaluation response");
  }
}

// SocraticChat: streaming tutor response
export async function socraticChatStream(
  messages: ChatMessage[],
  mode: "guide" | "devils_advocate" | "peer"
): Promise<Response> {
  const modeInstructions: Record<string, string> = {
    guide: `You are a Socratic tutor. Ask probing questions to guide the student toward deeper understanding. DO NOT give answers directly — instead, ask questions that help them discover the answer themselves. Use the "ladder of questions" technique: Why? How? What if? What evidence? What are the implications? Be warm, patient, and encouraging. Respond in Indonesian (Bahasa Indonesia) unless the user writes in English.`,
    devils_advocate: `You are in Devil's Advocate mode. Your role is to challenge the student's thinking by presenting counterarguments, objections, and alternative perspectives. Do this respectfully but firmly. Force them to consider edge cases, unintended consequences, and weak points in their reasoning. Be the "steel man" against their position. Respond in Indonesian (Bahasa Indonesia) unless the user writes in English.`,
    peer: `You are a peer learning partner. Engage as an equal — share your own experiences, admit uncertainties, and explore the topic together. Be casual and friendly. Relate the topic to real-world examples. Ask your own genuine questions too. Think of this as studying together with a knowledgeable friend. Respond in Indonesian (Bahasa Indonesia) unless the user writes in English.`,
  };

  const systemMessage: ChatMessage = {
    role: "system",
    content: modeInstructions[mode],
  };

  return chat({
    model: process.env.TUTOR_MODEL ?? "anthropic/claude-3.5-sonnet",
    messages: [systemMessage, ...messages],
    stream: true,
    temperature: 0.8,
    max_tokens: 1200,
  });
}
