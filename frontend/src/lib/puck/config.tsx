/**
 * VOKASI2 — Puck Educational Component Registry
 * PRD v2.3 §5.3 Visual Course Builder
 */
import type { Config } from "@measured/puck";
import React from "react";
import { RichContentEditor } from "./RichContentEditor";
import {
  ModuleHeader, RichContent, VideoBlock, SocraticChat,
  QuizBuilder, CodeSandbox, PeerReviewRubric,
  ReflectionJournal, Assignment, DiscussionSeed,
} from "./components/index";

export const COMPETENCY_DIMENSIONS = [
  { key: "prompt_engineering",       label: "Prompt Engineering" },
  { key: "model_evaluation",         label: "Model Evaluation" },
  { key: "data_analysis",            label: "Data Analysis" },
  { key: "workflow_automation",      label: "Workflow Automation" },
  { key: "critical_thinking",        label: "Critical Thinking" },
  { key: "creative_problem_solving", label: "Creative Problem Solving" },
  { key: "communication",            label: "Communication" },
  { key: "collaboration",           label: "Collaboration" },
  { key: "research_literacy",        label: "Research Literacy" },
  { key: "technical_writing",         label: "Technical Writing" },
  { key: "ai_human_collaboration",   label: "AI-Human Collaboration" },
  { key: "ethical_ai_use",           label: "Ethical AI Use" },
] as const;

export const vokasiPuckConfig: Config = {
  components: {
    ModuleHeader: {
      label: "Module Header",
      fields: {
        title: { type: "text", label: "Title" },
        subtitle: { type: "text", label: "Subtitle" },
        learningObjectives: { type: "textarea", label: "Learning Objectives (one per line)" },
        estimatedMinutes: { type: "number", label: "Estimated Minutes" },
      },
      defaultProps: { title: "Module 1: Introduction", subtitle: "Getting started with the core concepts",
        learningObjectives: "Understand the fundamentals\nApply concepts in practice", estimatedMinutes: 30 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <ModuleHeader {...props} />,
    },
    RichContent: {
      label: "Rich Content",
      fields: {
        html: {
          type: "custom",
          label: "Content",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: ({ value, onChange }: any) =>
            React.createElement(RichContentEditor, { value: value ?? "", onChange }),
        },
      },
      defaultProps: { html: "<p>Start writing your lesson content here…</p>" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <RichContent {...props} />,
    },
    VideoBlock: {
      label: "Video",
      fields: {
        videoUrl: { type: "text", label: "Video URL (YouTube / direct)" },
        caption: { type: "text", label: "Caption" },
        transcriptUrl: { type: "text", label: "Transcript URL" },
      },
      defaultProps: { videoUrl: "", caption: "", transcriptUrl: "" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <VideoBlock {...props} />,
    },
    SocraticChat: {
      label: "Socratic AI Chat",
      fields: {
        seedQuestion: { type: "textarea", label: "Seed Question" },
        persona: { type: "text", label: "AI Persona Name" },
        maxTurns: { type: "number", label: "Max Turns" },
      },
      defaultProps: { seedQuestion: "What do you think happens when…?", persona: "VOKASI Tutor", maxTurns: 6 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <SocraticChat {...props} />,
    },
    QuizBuilder: {
      label: "Quiz",
      fields: {
        quizTitle: { type: "text", label: "Quiz Title" },
        questions: {
          type: "array", label: "Questions",
          arrayFields: {
            question: { type: "text", label: "Question" },
            options: { type: "textarea", label: "Options (one per line)" },
            correctIndex: { type: "number", label: "Correct Option Index (0-based)" },
          },
          defaultItemProps: { question: "New question", options: "Option A\nOption B\nOption C", correctIndex: 0 },
        },
        passingScore: { type: "number", label: "Passing Score (%)" },
      },
      defaultProps: { quizTitle: "Knowledge Check", questions: [{ question: "Which of the following is correct?", options: "Option A\nOption B\nOption C", correctIndex: 0 }], passingScore: 70 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <QuizBuilder {...props} />,
    },
    CodeSandbox: {
      label: "Code Sandbox",
      fields: {
        language: { type: "select", label: "Language",
          options: [{ label: "Python", value: "python" }, { label: "JavaScript", value: "javascript" },
            { label: "TypeScript", value: "typescript" }, { label: "Java", value: "java" }, { label: "SQL", value: "sql" }] },
        starterCode: { type: "textarea", label: "Starter Code" },
        instructions: { type: "textarea", label: "Instructions" },
        testCases: { type: "textarea", label: "Test Cases (JSON)" },
      },
      defaultProps: { language: "python", starterCode: "# Write your solution here\ndef solution():\n    pass\n", instructions: "Complete the function above.", testCases: "" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <CodeSandbox {...props} />,
    },
    PeerReviewRubric: {
      label: "Peer Review Rubric",
      fields: {
        rubricTitle: { type: "text", label: "Rubric Title" },
        instructions: { type: "textarea", label: "Instructions" },
        criteria: {
          type: "array", label: "Criteria",
          arrayFields: {
            criterion: { type: "text", label: "Criterion Name" },
            maxPoints: { type: "number", label: "Max Points" },
            description: { type: "textarea", label: "Description" },
          },
          defaultItemProps: { criterion: "Clarity", maxPoints: 10, description: "Response is clear and well-structured." },
        },
      },
      defaultProps: { rubricTitle: "Peer Review Rubric", instructions: "Review your peer's submission using the criteria below.",
        criteria: [{ criterion: "Clarity", maxPoints: 10, description: "Is the submission clear and well-structured?" },
                   { criterion: "Depth", maxPoints: 20, description: "Does it demonstrate deep understanding?" }] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <PeerReviewRubric {...props} />,
    },
    ReflectionJournal: {
      label: "Reflection Journal",
      fields: {
        prompt: { type: "textarea", label: "Reflection Prompt" },
        minWords: { type: "number", label: "Minimum Words" },
        tags: { type: "text", label: "Tags (comma-separated)" },
      },
      defaultProps: { prompt: "What was the most surprising thing you learned today?", minWords: 100, tags: "reflection, learning" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <ReflectionJournal {...props} />,
    },
    Assignment: {
      label: "Assignment",
      fields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description / Instructions" },
        dueLabel: { type: "text", label: "Due Date Label" },
        submissionType: { type: "select", label: "Submission Type",
          options: [{ label: "File Upload", value: "file" }, { label: "Text Entry", value: "text" },
            { label: "URL", value: "url" }, { label: "GitHub Repo", value: "github" }] },
        maxScore: { type: "number", label: "Max Score (pts)" },
      },
      defaultProps: { title: "Assignment", description: "Complete the tasks described below.", dueLabel: "End of week", submissionType: "file", maxScore: 100 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <Assignment {...props} />,
    },
    DiscussionSeed: {
      label: "Discussion",
      fields: {
        topic: { type: "text", label: "Discussion Topic" },
        seedPost: { type: "textarea", label: "Opening Post" },
        requiredReplies: { type: "number", label: "Required Replies to Peers" },
        gradingNotes: { type: "text", label: "Grading Notes" },
      },
      defaultProps: { topic: "Open Discussion", seedPost: "Share your perspective on this topic.", requiredReplies: 2, gradingNotes: "Substantive replies required." },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (props: any) => <DiscussionSeed {...props} />,
    },
  },
};

export type VokasiPuckConfig = typeof vokasiPuckConfig;