"use client";

/**
 * VOKASI Educational Component Registry
 * vokasi2.prd §6.1 — 10 educational blocks for Puck
 */

import React from "react";

// ─── 1. ModuleHeader ────────────────────────────────────────────────────────

export type ModuleHeaderProps = {
  title: string;
  subtitle: string;
  learningObjectives: string;
  estimatedMinutes: number;
};

export function ModuleHeader({
  title,
  subtitle,
  learningObjectives,
  estimatedMinutes,
}: ModuleHeaderProps) {
  const objectives = learningObjectives
    ? learningObjectives.split("\n").filter(Boolean)
    : [];
  return (
    <section className="mb-10 pt-6 first:pt-0 last:mb-0">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Module Section
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="rounded-[28px] border border-zinc-200 bg-gradient-to-b from-white via-white to-zinc-50 px-8 py-7 shadow-sm ring-1 ring-zinc-100/80">
        <div className="mb-4 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full bg-zinc-900" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Module
              </span>
            </div>
            <h2 className="mb-2 text-[38px] font-bold leading-[1.08] tracking-[-0.02em] text-zinc-900">
              {title || "Module Title"}
            </h2>
            {subtitle && <p className="max-w-3xl text-[15px] leading-7 text-zinc-500">{subtitle}</p>}
          </div>

          {estimatedMinutes > 0 && (
            <div className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 shadow-sm">
              ⏱ {estimatedMinutes} min
            </div>
          )}
        </div>

        {objectives.length > 0 && (
          <div className="mt-5 border-t border-zinc-200 pt-5">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Learning objectives
            </div>
            <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] leading-7 text-zinc-700">
                  <span className="mt-0.5 text-zinc-400">✓</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 2. RichContent ─────────────────────────────────────────────────────────

export type RichContentProps = {
  // Puck richtext fields return string | ReactNode depending on context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  html: any;
};

export function RichContent({ html }: RichContentProps) {
  const isString = typeof html === "string";
  return (
    <div className="prose prose-zinc mb-5 max-w-none px-2 py-1 text-zinc-800 last:mb-0 prose-p:text-[18px] prose-p:leading-9 prose-headings:text-zinc-900 prose-strong:text-zinc-900 prose-li:text-[18px] prose-li:leading-9 prose-ul:my-4 prose-ol:my-4 prose-h1:text-[36px] prose-h1:leading-[1.15] prose-h2:text-[30px] prose-h2:leading-[1.2] prose-h3:text-[24px] prose-h3:leading-[1.25]">
      {isString ? (
        <div dangerouslySetInnerHTML={{ __html: html || "<p>Add your content here…</p>" }} />
      ) : html ? (
        html
      ) : (
        <p className="text-zinc-400">Add your content here…</p>
      )}
    </div>
  );
}

// ─── 3. VideoBlock ──────────────────────────────────────────────────────────

export type VideoBlockProps = {
  videoUrl: string;
  caption: string;
  transcriptUrl: string;
};

export function VideoBlock({ videoUrl, caption, transcriptUrl }: VideoBlockProps) {
  const getEmbed = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  return (
    <div className="mb-5 overflow-hidden rounded-2xl bg-transparent last:mb-0">
      {videoUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-sm">
          <iframe
            src={getEmbed(videoUrl)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-500 shadow-sm">
          ▶ Add a video URL in the sidebar
        </div>
      )}
      {caption && (
        <div className="px-2 pt-3 text-[15px] leading-7 text-zinc-600">{caption}</div>
      )}
      {transcriptUrl && (
        <div className="px-2 pb-1 pt-2 text-sm">
          <a href={transcriptUrl} className="text-zinc-700 underline" target="_blank" rel="noopener noreferrer">
            View Transcript
          </a>
        </div>
      )}
    </div>
  );
}

// ─── 4. SocraticChat ────────────────────────────────────────────────────────

export type SocraticChatProps = {
  seedQuestion: string;
  persona: string;
  maxTurns: number;
};

export function SocraticChat({ seedQuestion, persona, maxTurns }: SocraticChatProps) {
  return (
    <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
          AI Tutor
        </span>
        {persona && <span className="text-xs text-indigo-500">— {persona}</span>}
      </div>
      <blockquote className="mb-4 border-l-4 border-indigo-400 pl-4 text-[17px] leading-8 text-indigo-900 italic">
        {seedQuestion || "What problem are we trying to solve today?"}
      </blockquote>
      <div className="flex items-center gap-3">
        <input
          className="flex-1 rounded-lg border border-indigo-200 bg-white px-4 py-3 text-[15px] text-zinc-900 placeholder-indigo-300 outline-none"
          placeholder="Your answer…"
          disabled
        />
        <button
          disabled
          className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white opacity-50"
        >
          Send
        </button>
      </div>
      {maxTurns > 0 && (
        <p className="mt-3 text-xs text-indigo-500">Max {maxTurns} turns</p>
      )}
    </div>
  );
}

// ─── 5. QuizBuilder ─────────────────────────────────────────────────────────

export type QuizQuestion = {
  question: string;
  options: string;
  correctIndex: number;
};

export type QuizBuilderProps = {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
};

export function QuizBuilder({ quizTitle, questions, passingScore }: QuizBuilderProps) {
  const qs = Array.isArray(questions) ? questions : [];
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 last:mb-0">
      <h3 className="mb-4 text-[24px] font-semibold text-amber-950">
        {quizTitle || "Quiz"}
      </h3>
      {qs.length === 0 && (
        <p className="text-sm text-amber-600">Add questions in the sidebar →</p>
      )}
      {qs.map((q, qi) => {
        const opts = q.options ? q.options.split("\n").filter(Boolean) : [];
        return (
          <div key={qi} className="mb-5 last:mb-0">
            <p className="mb-3 text-[17px] font-medium leading-8 text-amber-950">
              Q{qi + 1}. {q.question}
            </p>
            <ul className="space-y-1">
              {opts.map((opt, oi) => (
                <li key={oi} className="flex items-center gap-2 text-[15px] leading-7 text-amber-900">
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      oi === q.correctIndex
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-amber-300"
                    }`}
                  />
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {passingScore > 0 && (
        <p className="mt-3 text-xs text-amber-600">Passing score: {passingScore}%</p>
      )}
    </div>
  );
}

// ─── 6. CodeSandbox ─────────────────────────────────────────────────────────

export type CodeSandboxProps = {
  language: string;
  starterCode: string;
  instructions: string;
  testCases: string;
};

export function CodeSandbox({
  language,
  starterCode,
  instructions,
  testCases,
}: CodeSandboxProps) {
  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white last:mb-0">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3">
        <span className="text-xs font-mono font-semibold text-zinc-600">
          {language || "python"}
        </span>
        <span className="rounded bg-zinc-900 px-2 py-0.5 text-xs text-white">
          Code Sandbox
        </span>
      </div>
      {instructions && (
        <div className="border-b border-zinc-200 bg-white px-5 py-3 text-[15px] leading-7 text-zinc-600">
          {instructions}
        </div>
      )}
      <pre className="overflow-auto bg-zinc-50 p-5 font-mono text-[14px] leading-7 text-zinc-700">
        {starterCode || `# Write your ${language || "code"} here\n`}
      </pre>
      {testCases && (
        <div className="border-t border-zinc-200 bg-white px-5 py-3 text-xs text-zinc-500">
          Test cases defined ✓
        </div>
      )}
    </div>
  );
}

// ─── 7. PeerReviewRubric ────────────────────────────────────────────────────

export type RubricCriterion = {
  criterion: string;
  maxPoints: number;
  description: string;
};

export type PeerReviewRubricProps = {
  rubricTitle: string;
  criteria: RubricCriterion[];
  instructions: string;
};

export function PeerReviewRubric({
  rubricTitle,
  criteria,
  instructions,
}: PeerReviewRubricProps) {
  const crits = Array.isArray(criteria) ? criteria : [];
  return (
    <div className="mb-5 rounded-2xl border border-pink-200 bg-pink-50/70 p-6 last:mb-0">
      <h3 className="mb-2 text-[24px] font-semibold text-pink-950">
        {rubricTitle || "Peer Review Rubric"}
      </h3>
      {instructions && (
        <p className="mb-4 text-[15px] leading-7 text-pink-700">{instructions}</p>
      )}
      {crits.length === 0 && (
        <p className="text-sm text-pink-600">Add criteria in the sidebar →</p>
      )}
      <div className="overflow-hidden rounded-xl border border-pink-200 bg-white">
        <table className="w-full text-[15px]">
          <thead className="bg-pink-100 text-pink-900">
            <tr>
              <th className="px-3 py-2 text-left">Criterion</th>
              <th className="px-3 py-2 text-center">Points</th>
              <th className="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {crits.map((c, i) => (
              <tr key={i} className="border-t border-pink-100 text-pink-900">
                <td className="px-3 py-2 font-medium">{c.criterion}</td>
                <td className="px-3 py-2 text-center">{c.maxPoints}</td>
                <td className="px-3 py-2 text-pink-700">{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 8. ReflectionJournal ───────────────────────────────────────────────────

export type ReflectionJournalProps = {
  prompt: string;
  minWords: number;
  tags: string;
};

export function ReflectionJournal({ prompt, minWords, tags }: ReflectionJournalProps) {
  return (
    <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50/70 p-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📔</span>
        <span className="font-semibold text-teal-950">Reflection Journal</span>
      </div>
      <p className="mb-4 text-[17px] leading-8 text-teal-900 italic">
        {prompt || "Reflect on what you learned in this module."}
      </p>
      <textarea
        disabled
        rows={4}
        placeholder="Write your reflection here…"
        className="w-full rounded-lg border border-teal-200 bg-white px-4 py-3 text-[15px] text-teal-950 placeholder-teal-300 outline-none"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-teal-600">
        {minWords > 0 && <span>Min {minWords} words</span>}
        {tags && (
          <div className="flex gap-1">
            {tags.split(",").map((t) => (
              <span
                key={t}
                className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-700"
              >
                {t.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 9. Assignment ──────────────────────────────────────────────────────────

export type AssignmentProps = {
  title: string;
  description: string;
  dueLabel: string;
  submissionType: string;
  maxScore: number;
};

export function Assignment({
  title,
  description,
  dueLabel,
  submissionType,
  maxScore,
}: AssignmentProps) {
  return (
    <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/70 p-6 last:mb-0">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h3 className="text-[24px] font-semibold text-orange-950">
          {title || "Assignment"}
        </h3>
      </div>
      {dueLabel && (
        <p className="mb-2 text-xs text-orange-600">Due: {dueLabel}</p>
      )}
      <p className="mb-4 text-[16px] leading-8 text-orange-900">
        {description || "Assignment instructions will appear here."}
      </p>
      <div className="flex items-center gap-4 text-xs text-orange-600">
        {submissionType && <span>Submit: {submissionType}</span>}
        {maxScore > 0 && <span>Max score: {maxScore} pts</span>}
      </div>
    </div>
  );
}

// ─── 10. DiscussionSeed ─────────────────────────────────────────────────────

export type DiscussionSeedProps = {
  topic: string;
  seedPost: string;
  requiredReplies: number;
  gradingNotes: string;
};

export function DiscussionSeed({
  topic,
  seedPost,
  requiredReplies,
  gradingNotes,
}: DiscussionSeedProps) {
  return (
    <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50/70 p-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">💬</span>
        <h3 className="text-[24px] font-semibold text-violet-950">
          {topic || "Discussion"}
        </h3>
      </div>
      <div className="mb-4 rounded-lg bg-violet-200/70 p-4 text-[16px] leading-8 text-violet-900">
        {seedPost || "Share your thoughts on this topic."}
      </div>
      <div className="flex items-center gap-3 text-xs text-violet-600">
        {requiredReplies > 0 && (
          <span>Respond to {requiredReplies} peer(s)</span>
        )}
        {gradingNotes && <span>· {gradingNotes}</span>}
      </div>
    </div>
  );
}
