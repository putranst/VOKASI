/**
 * VB-009: VOKASI Block Templates Library
 * Pre-built block configurations an instructor can insert in one click.
 */

export interface BlockTemplate {
  id: string;
  label: string;
  description: string;
  category: "starter" | "content" | "assessment" | "engagement";
  icon: string;
  blockType: string;
  props: Record<string, unknown>;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // ── Starter ──────────────────────────────────────────────────────────────

  {
    id: "tpl-module-header-basic",
    label: "Module Header",
    description: "Standard module opener with title, subtitle & objectives",
    category: "starter",
    icon: "🏷",
    blockType: "ModuleHeader",
    props: {
      title: "Module 1: Introduction",
      subtitle: "Getting started with the core concepts",
      learningObjectives:
        "Understand the fundamentals\nApply concepts in practice\nEvaluate real-world examples",
      estimatedMinutes: 45,
    },
  },

  // ── Content ───────────────────────────────────────────────────────────────

  {
    id: "tpl-rich-content-lesson",
    label: "Lesson Text",
    description: "Rich HTML block pre-filled with a lesson skeleton",
    category: "content",
    icon: "📄",
    blockType: "RichContent",
    props: {
      html: "<h2>Lesson Overview</h2><p>Write your lesson content here. You can use headings, lists, bold text, and images.</p><h3>Key Concepts</h3><ul><li>Concept one</li><li>Concept two</li><li>Concept three</li></ul>",
    },
  },

  {
    id: "tpl-video-youtube",
    label: "YouTube Video",
    description: "Video block ready for a YouTube URL + caption",
    category: "content",
    icon: "🎬",
    blockType: "VideoBlock",
    props: {
      videoUrl: "",
      caption: "Watch the video above before proceeding.",
      transcriptUrl: "",
    },
  },

  {
    id: "tpl-video-demo",
    label: "Demo Video + Notes",
    description: "Video with a transcript URL placeholder for accessibility",
    category: "content",
    icon: "🎥",
    blockType: "VideoBlock",
    props: {
      videoUrl: "",
      caption: "Demonstration: watch carefully and take notes.",
      transcriptUrl: "/transcripts/demo.pdf",
    },
  },

  {
    id: "tpl-codesandbox-python",
    label: "Python Exercise",
    description: "Python starter with a stub function to complete",
    category: "content",
    icon: "🐍",
    blockType: "CodeSandbox",
    props: {
      language: "python",
      starterCode:
        "# Complete the function below\ndef solve(data):\n    # TODO: implement your solution\n    pass\n\n# Test\nprint(solve([1, 2, 3]))\n",
      instructions:
        "Implement the `solve` function so that it processes the given data correctly. Run the code to check your output.",
      testCases: "",
    },
  },

  {
    id: "tpl-codesandbox-js",
    label: "JavaScript Exercise",
    description: "JavaScript starter with a stub function",
    category: "content",
    icon: "💻",
    blockType: "CodeSandbox",
    props: {
      language: "javascript",
      starterCode:
        "// Complete the function below\nfunction solve(data) {\n  // TODO: implement your solution\n}\n\nconsole.log(solve([1, 2, 3]));\n",
      instructions:
        "Implement the `solve` function. Use `console.log` to verify your output.",
      testCases: "",
    },
  },

  // ── Assessment ────────────────────────────────────────────────────────────

  {
    id: "tpl-quiz-mcq-3",
    label: "3-Question MCQ Quiz",
    description: "Quick comprehension check with three multiple-choice questions",
    category: "assessment",
    icon: "✅",
    blockType: "QuizBuilder",
    props: {
      quizTitle: "Comprehension Check",
      questions: [
        {
          question: "What is the main concept introduced in this module?",
          options: "Option A\nOption B\nOption C\nOption D",
          correctIndex: 0,
        },
        {
          question: "Which of the following best describes the key principle?",
          options: "Option A\nOption B\nOption C\nOption D",
          correctIndex: 0,
        },
        {
          question: "How would you apply this concept in a real scenario?",
          options: "Option A\nOption B\nOption C\nOption D",
          correctIndex: 0,
        },
      ],
      passingScore: 70,
    },
  },

  {
    id: "tpl-quiz-mcq-5",
    label: "5-Question MCQ Quiz",
    description: "Standard quiz with five multiple-choice questions",
    category: "assessment",
    icon: "📝",
    blockType: "QuizBuilder",
    props: {
      quizTitle: "Module Quiz",
      questions: [
        { question: "Question 1", options: "Option A\nOption B\nOption C\nOption D", correctIndex: 0 },
        { question: "Question 2", options: "Option A\nOption B\nOption C\nOption D", correctIndex: 0 },
        { question: "Question 3", options: "Option A\nOption B\nOption C\nOption D", correctIndex: 0 },
        { question: "Question 4", options: "Option A\nOption B\nOption C\nOption D", correctIndex: 0 },
        { question: "Question 5", options: "Option A\nOption B\nOption C\nOption D", correctIndex: 0 },
      ],
      passingScore: 70,
    },
  },

  {
    id: "tpl-assignment-project",
    label: "Project Assignment",
    description: "File-upload assignment with scoring rubric placeholder",
    category: "assessment",
    icon: "📋",
    blockType: "Assignment",
    props: {
      title: "Project Submission",
      description:
        "Apply what you have learned in this module by completing the project below.\n\n**Instructions:**\n1. Read the brief carefully.\n2. Complete your work in the provided template.\n3. Submit your file before the deadline.\n\n**Criteria:** Creativity, Technical accuracy, Documentation quality.",
      dueLabel: "End of week",
      submissionType: "file",
      maxScore: 100,
    },
  },

  {
    id: "tpl-assignment-text",
    label: "Short Answer Assignment",
    description: "Text-entry assignment for written responses",
    category: "assessment",
    icon: "✏️",
    blockType: "Assignment",
    props: {
      title: "Short Answer Response",
      description:
        "Answer the following question in 200–400 words.\n\nDescribe a situation where you would apply the concepts from this module and explain your reasoning.",
      dueLabel: "End of module",
      submissionType: "text",
      maxScore: 50,
    },
  },

  {
    id: "tpl-peer-review-3criteria",
    label: "Peer Review (3 Criteria)",
    description: "Rubric with Clarity, Depth and Originality criteria",
    category: "assessment",
    icon: "👥",
    blockType: "PeerReviewRubric",
    props: {
      rubricTitle: "Peer Review Rubric",
      instructions:
        "Review your peer's submission using the three criteria below. Provide constructive, specific feedback for each.",
      criteria: [
        {
          criterion: "Clarity",
          maxPoints: 10,
          description: "Is the submission clear, organised and easy to follow?",
        },
        {
          criterion: "Depth",
          maxPoints: 20,
          description: "Does the submission demonstrate thorough understanding of the topic?",
        },
        {
          criterion: "Originality",
          maxPoints: 10,
          description: "Does the submission show independent thinking and original insights?",
        },
      ],
    },
  },

  // ── Engagement ────────────────────────────────────────────────────────────

  {
    id: "tpl-reflection-open",
    label: "Open Reflection",
    description: "Free-form reflective journal prompt (min 100 words)",
    category: "engagement",
    icon: "📔",
    blockType: "ReflectionJournal",
    props: {
      prompt: "What was the most surprising thing you learned in this module? How will you apply it?",
      minWords: 100,
      tags: "reflection, learning",
    },
  },

  {
    id: "tpl-reflection-socratic",
    label: "Critical Reflection",
    description: "Deeper reflection with a higher word count and critical-thinking tags",
    category: "engagement",
    icon: "🤔",
    blockType: "ReflectionJournal",
    props: {
      prompt:
        "Critically evaluate one key concept from this module. What are its strengths and limitations? How does it connect to your professional context?",
      minWords: 200,
      tags: "critical thinking, evaluation, application",
    },
  },

  {
    id: "tpl-socratic-chat",
    label: "AI Tutor Chat",
    description: "Socratic dialogue with VOKASI AI Tutor (6 turns)",
    category: "engagement",
    icon: "🤖",
    blockType: "SocraticChat",
    props: {
      seedQuestion: "What do you think is the most important idea from this module, and why?",
      persona: "VOKASI Tutor",
      maxTurns: 6,
    },
  },

  {
    id: "tpl-discussion-open",
    label: "Open Discussion",
    description: "Forum prompt requiring 2 replies to peers",
    category: "engagement",
    icon: "💬",
    blockType: "DiscussionSeed",
    props: {
      topic: "Open Discussion",
      seedPost:
        "Reflect on what you've learned so far. Share one insight or question with your classmates.",
      requiredReplies: 2,
      gradingNotes: "Substantive, respectful replies required.",
    },
  },

  {
    id: "tpl-discussion-debate",
    label: "Debate Discussion",
    description: "Structured debate prompt asking students to take a position",
    category: "engagement",
    icon: "⚖️",
    blockType: "DiscussionSeed",
    props: {
      topic: "Structured Debate",
      seedPost:
        "Take a position on the following statement and defend it with evidence from this module. Then respond to at least two classmates who hold a different view.",
      requiredReplies: 2,
      gradingNotes: "Position must be clearly stated and evidence-backed.",
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "starter",    label: "Starter",    icon: "🚀" },
  { id: "content",    label: "Content",    icon: "📚" },
  { id: "assessment", label: "Assessment", icon: "📊" },
  { id: "engagement", label: "Engagement", icon: "💡" },
] as const;
