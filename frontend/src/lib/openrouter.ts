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
