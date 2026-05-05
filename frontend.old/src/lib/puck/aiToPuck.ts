/**
 * AI → Puck JSON Transformer
 * vokasi2.prd §5.2 AI-004 — Middleware converts AI JSON to Puck-compatible document schema.
 *
 * Converts the agenda/module structure returned by POST /api/v1/courses/generate
 * into a valid Puck `Data` object pre-populated with VOKASI educational components.
 */

import type { Data } from "@puckeditor/core";

// ── Types from the generate endpoint response ──────────────────────────────

interface AgendaModule {
  title?: string;
  subtitle?: string;
  learning_objectives?: Array<string | { text?: string; objective?: string }>;
  learning_goals?: string[];
  session_schedule?: Array<{ title?: string; description?: string; type?: string }>;
  teaching_actions?: Array<{ title?: string; description?: string }>;
  quiz_questions?: Array<{
    question?: string;
    options?: string[];
    correct_answer?: number;
    explanation?: string;
  }>;
  video_url?: string;
  discussion_prompt?: string;
  reflection_prompt?: string;
}

interface GenerateResponse {
  title?: string;
  description?: string;
  level?: string;
  duration?: string;
  modules?: AgendaModule[];
  agenda?: {
    course_title?: string;
    description?: string;
    modules?: AgendaModule[];
    capstone_project?: string | { description?: string };
  };
  parsed_content?: {
    learning_objectives?: string[];
    key_concepts?: string[];
    summary?: string;
  };
}

// ── Helper to extract plain-text objectives ────────────────────────────────

function extractObjectives(raw: AgendaModule["learning_objectives"]): string[] {
  if (!raw || !raw.length) return [];
  return raw
    .map((lo) => {
      if (typeof lo === "string") return lo;
      return lo.text ?? lo.objective ?? "";
    })
    .filter(Boolean);
}

// ── Build a single Puck content block ─────────────────────────────────────

function makeBlock(type: string, props: Record<string, unknown>) {
  return {
    type,
    props: { id: `${type}-${Math.random().toString(36).slice(2, 8)}`, ...props },
  };
}

// ── Main transformer ───────────────────────────────────────────────────────

export function aiResponseToPuckData(response: GenerateResponse): Data {
  const agenda = response.agenda ?? {};
  const modules: AgendaModule[] = agenda.modules ?? response.modules ?? [];
  const courseTitle = agenda.course_title ?? response.title ?? "Untitled Course";
  const courseDescription =
    agenda.description ?? response.description ?? response.parsed_content?.summary ?? "";
  const level = response.level ?? "Beginner";
  const duration = response.duration ?? "4 weeks";

  const contentBlocks: ReturnType<typeof makeBlock>[] = [];

  // ── 1. Course-level ModuleHeader ──────────────────────────────────────────
  const globalObjectives = response.parsed_content?.learning_objectives ?? [];
  contentBlocks.push(
    makeBlock("ModuleHeader", {
      title: courseTitle,
      subtitle: courseDescription,
      learningObjectives: globalObjectives.slice(0, 5).join("\n"),
      estimatedMinutes: 0,
    })
  );

  // ── 2. Per-module blocks ───────────────────────────────────────────────────
  modules.forEach((mod, idx) => {
    const modTitle = mod.title ?? `Module ${idx + 1}`;
    const objectives = extractObjectives(mod.learning_objectives);
    const goals = mod.learning_goals ?? [];

    // Module header
    contentBlocks.push(
      makeBlock("ModuleHeader", {
        title: modTitle,
        subtitle: mod.subtitle ?? "",
        learningObjectives: [...objectives, ...goals].slice(0, 4).join("\n"),
        estimatedMinutes: 30,
      })
    );

    // Rich content from session schedule / teaching actions
    const sessions = mod.session_schedule ?? mod.teaching_actions ?? [];
    if (sessions.length > 0) {
      const bodyLines = sessions
        .slice(0, 6)
        .map((s: {title?: string; description?: string; type?: string}) => {
          const title = s.title ?? s.description ?? (s as any).type ?? "";
          const desc = s.description ?? "";
          return title && desc && title !== desc
            ? `<h3>${title}</h3><p>${desc}</p>`
            : title
            ? `<p>${title}</p>`
            : "";
        })
        .filter(Boolean);

      if (bodyLines.length > 0) {
        contentBlocks.push(
          makeBlock("RichContent", {
            html: bodyLines.join("\n"),
          })
        );
      }
    } else if (mod.subtitle) {
      contentBlocks.push(
        makeBlock("RichContent", {
          html: `<p>${mod.subtitle}</p>`,
        })
      );
    }

    // Video block (if URL provided by AI)
    if (mod.video_url) {
      contentBlocks.push(
        makeBlock("VideoBlock", {
          videoUrl: mod.video_url,
          caption: `${modTitle} — Video Lesson`,
          transcriptUrl: "",
        })
      );
    }

    // SocraticChat seeded from objectives
    if (objectives.length > 0) {
      contentBlocks.push(
        makeBlock("SocraticChat", {
          seedQuestion: objectives[0],
          persona: "VOKASI Tutor",
          maxTurns: 8,
        })
      );
    }

    // Discussion prompt
    if (mod.discussion_prompt) {
      contentBlocks.push(
        makeBlock("DiscussionSeed", {
          topic: modTitle,
          seedPost: mod.discussion_prompt,
          requiredReplies: 2,
          gradingNotes: "",
        })
      );
    }

    // Reflection journal
    if (mod.reflection_prompt) {
      contentBlocks.push(
        makeBlock("ReflectionJournal", {
          prompt: mod.reflection_prompt,
          minWords: 100,
          tags: modTitle,
        })
      );
    }

    // Quiz (if questions provided)
    if (mod.quiz_questions && mod.quiz_questions.length > 0) {
      const questions = mod.quiz_questions.slice(0, 5).map((q) => ({
        question: q.question ?? "",
        options: (q.options ?? []).join("\n"),
        correctIndex: q.correct_answer ?? 0,
      }));
      contentBlocks.push(
        makeBlock("QuizBuilder", {
          quizTitle: `${modTitle} — Quiz`,
          questions,
          passingScore: 70,
          timeLimit: 10,
        })
      );
    } else if (objectives.length >= 2) {
      // Generate a placeholder quiz from objectives
      contentBlocks.push(
        makeBlock("QuizBuilder", {
          quizTitle: `${modTitle} — Formative Assessment`,
          questions: [
            {
              question: `Which best describes: ${objectives[0]}?`,
              options: [
                objectives[0],
                `The opposite of ${objectives[0]}`,
                "None of the above",
                "Both A and B",
              ].join("\n"),
              correctIndex: 0,
            },
          ],
          passingScore: 70,
        })
      );
    }

    // Assignment for every other module
    if (idx % 2 === 1 && objectives.length > 0) {
      contentBlocks.push(
        makeBlock("Assignment", {
          title: `${modTitle} — Project Task`,
          description: objectives.slice(0, 3).join(". ") + ".",
          dueLabel: "",
          submissionType: "file",
          maxScore: 100,
        })
      );
    }
  });

  // ── 3. Capstone assignment ──────────────────────────────────────────────
  const capstone = agenda.capstone_project;
  if (capstone) {
    const capDesc =
      typeof capstone === "string" ? capstone : capstone.description ?? "";
    if (capDesc) {
      contentBlocks.push(
        makeBlock("Assignment", {
          title: "Capstone Project",
          description: capDesc,
          dueLabel: "End of course",
          submissionType: "file",
          maxScore: 100,
        })
      );
    }
  }

  return {
    content: contentBlocks,
    root: {
      props: {
        title: courseTitle,
      },
    },
  };
}
