// VOKASI2 — Content Validation Pipeline
// Validates AI-generated Puck blocks for correctness and completeness
// Adapted from MAIC-UI's HTMLValidator + ContentValidator + SimulationValidator

import type { PuckBlock } from "./openrouter";

export interface ValidationError {
  blockIndex: number;
  blockType: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  fixedBlocks?: PuckBlock[]; // auto-corrected blocks if fixes were applied
}

// Valid block types in VOKASI2
const VALID_BLOCK_TYPES = new Set([
  "ModuleHeader",
  "RichContent",
  "VideoBlock",
  "SocraticChat",
  "QuizBuilder",
  "CodeSandbox",
  "PeerReviewRubric",
  "ReflectionJournal",
  "Assignment",
  "DiscussionSeed",
]);

/** Validate a single block's props */
function validateBlock(
  block: PuckBlock,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { type, props } = block;

  // Check block type exists
  if (!VALID_BLOCK_TYPES.has(type)) {
    errors.push({
      blockIndex: index,
      blockType: type,
      field: "type",
      message: `Unknown block type: "${type}"`,
      severity: "error",
    });
    return errors; // Can't validate props without known type
  }

  // Type-specific validation
  switch (type) {
    case "ModuleHeader":
      if (!props.title || typeof props.title !== "string" || props.title.trim() === "") {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "title",
          message: "ModuleHeader must have a non-empty title",
          severity: "error",
        });
      }
      if (!props.learningObjectives || typeof props.learningObjectives !== "string") {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "learningObjectives",
          message: "ModuleHeader must have learningObjectives",
          severity: "error",
        });
      }
      if (typeof props.estimatedMinutes === "number" && (props.estimatedMinutes < 1 || props.estimatedMinutes > 300)) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "estimatedMinutes",
          message: `estimatedMinutes ${props.estimatedMinutes} is outside reasonable range (1-300)`,
          severity: "warning",
        });
      }
      break;

    case "RichContent":
      if (!props.html || typeof props.html !== "string" || props.html.trim() === "") {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "html",
          message: "RichContent must have non-empty html",
          severity: "error",
        });
      } else if (props.html.length < 50) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "html",
          message: `RichContent html is suspiciously short (${props.html.length} chars)`,
          severity: "warning",
        });
      }
      break;

    case "VideoBlock":
      if (!props.videoUrl || typeof props.videoUrl !== "string") {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "videoUrl",
          message: "VideoBlock must have a videoUrl",
          severity: "warning",
        });
      }
      break;

    case "QuizBuilder":
      if (!props.quizTitle) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "quizTitle",
          message: "QuizBuilder must have a quizTitle",
          severity: "error",
        });
      }
      if (!Array.isArray(props.questions) || props.questions.length === 0) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "questions",
          message: "QuizBuilder must have at least 1 question",
          severity: "error",
        });
      } else {
        (props.questions as Array<Record<string, unknown>>).forEach(
          (q, qi) => {
            if (!q.question) {
              errors.push({
                blockIndex: index,
                blockType: type,
                field: `questions[${qi}].question`,
                message: `Question ${qi + 1} is missing question text`,
                severity: "error",
              });
            }
            const options = typeof q.options === "string" ? q.options.split("\n").filter(Boolean) : [];
            if (options.length < 2) {
              errors.push({
                blockIndex: index,
                blockType: type,
                field: `questions[${qi}].options`,
                message: `Question ${qi + 1} needs at least 2 options (has ${options.length})`,
                severity: "error",
              });
            }
            if (
              typeof q.correctIndex !== "number" ||
              q.correctIndex < 0 ||
              q.correctIndex >= options.length
            ) {
              errors.push({
                blockIndex: index,
                blockType: type,
                field: `questions[${qi}].correctIndex`,
                message: `Question ${qi + 1}: correctIndex ${q.correctIndex} is out of range (0-${options.length - 1})`,
                severity: "error",
              });
            }
          }
        );
      }
      if (typeof props.passingScore === "number" && (props.passingScore < 0 || props.passingScore > 100)) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "passingScore",
          message: `passingScore ${props.passingScore} is outside 0-100 range`,
          severity: "warning",
        });
      }
      break;

    case "CodeSandbox":
      if (!props.language) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "language",
          message: "CodeSandbox must specify a language",
          severity: "error",
        });
      }
      if (!props.instructions) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "instructions",
          message: "CodeSandbox must have instructions",
          severity: "warning",
        });
      }
      break;

    case "Assignment":
      if (!props.title) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "title",
          message: "Assignment must have a title",
          severity: "error",
        });
      }
      if (!props.description) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "description",
          message: "Assignment must have a description",
          severity: "error",
        });
      }
      break;

    case "ReflectionJournal":
      if (!props.prompt) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "prompt",
          message: "ReflectionJournal must have a prompt",
          severity: "error",
        });
      }
      break;

    case "DiscussionSeed":
      if (!props.topic) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "topic",
          message: "DiscussionSeed must have a topic",
          severity: "error",
        });
      }
      break;

    case "PeerReviewRubric":
      if (!Array.isArray(props.criteria) || props.criteria.length === 0) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "criteria",
          message: "PeerReviewRubric must have at least 1 criterion",
          severity: "error",
        });
      }
      break;

    case "SocraticChat":
      if (!props.seedQuestion) {
        errors.push({
          blockIndex: index,
          blockType: type,
          field: "seedQuestion",
          message: "SocraticChat must have a seedQuestion",
          severity: "warning",
        });
      }
      break;
  }

  return errors;
}

/** Auto-fix minor issues in blocks */
function autoFix(blocks: PuckBlock[]): { fixed: PuckBlock[]; fixes: string[] } {
  const fixes: string[] = [];
  const fixed = blocks.map((block, i) => {
    const b = { ...block, props: { ...block.props } };

    // Fix ModuleHeader missing subtitle
    if (b.type === "ModuleHeader" && !b.props.subtitle) {
      b.props.subtitle = "Core concepts and practical applications";
      fixes.push(`Block ${i}: Added default subtitle to ModuleHeader`);
    }

    // Fix ModuleHeader missing estimatedMinutes
    if (b.type === "ModuleHeader" && !b.props.estimatedMinutes) {
      b.props.estimatedMinutes = 30;
      fixes.push(`Block ${i}: Set default estimatedMinutes=30 for ModuleHeader`);
    }

    // Fix QuizBuilder passingScore
    if (b.type === "QuizBuilder" && (typeof b.props.passingScore !== "number" || b.props.passingScore < 0)) {
      b.props.passingScore = 70;
      fixes.push(`Block ${i}: Set default passingScore=70 for QuizBuilder`);
    }

    // Fix VideoBlock caption
    if (b.type === "VideoBlock" && !b.props.caption) {
      b.props.caption = "Video lesson";
      fixes.push(`Block ${i}: Added default caption to VideoBlock`);
    }

    // Fix Assignment defaults
    if (b.type === "Assignment") {
      if (!b.props.dueLabel) b.props.dueLabel = "End of week";
      if (!b.props.submissionType) b.props.submissionType = "text";
      if (!b.props.maxScore) b.props.maxScore = 100;
    }

    // Fix ReflectionJournal defaults
    if (b.type === "ReflectionJournal") {
      if (!b.props.minWords) b.props.minWords = 100;
      if (!b.props.tags) b.props.tags = "reflection";
    }

    // Fix DiscussionSeed defaults
    if (b.type === "DiscussionSeed") {
      if (!b.props.requiredReplies) b.props.requiredReplies = 2;
      if (!b.props.gradingNotes) b.props.gradingNotes = "Substantive replies required.";
    }

    return b;
  });

  return { fixed, fixes };
}

/** Validate the overall block structure */
function validateStructure(blocks: PuckBlock[]): string[] {
  const warnings: string[] = [];

  if (blocks.length === 0) {
    warnings.push("No blocks generated — course is empty");
    return warnings;
  }

  // Should start with ModuleHeader
  if (blocks[0].type !== "ModuleHeader") {
    warnings.push(`First block is "${blocks[0].type}" — expected ModuleHeader`);
  }

  // Count block types
  const typeCounts = new Map<string, number>();
  for (const b of blocks) {
    typeCounts.set(b.type, (typeCounts.get(b.type) ?? 0) + 1);
  }

  // Should have at least 1 ModuleHeader
  if (!typeCounts.has("ModuleHeader")) {
    warnings.push("No ModuleHeader blocks found — course has no module structure");
  }

  // Should have at least 1 QuizBuilder or Assignment
  if (!typeCounts.has("QuizBuilder") && !typeCounts.has("Assignment")) {
    warnings.push("No assessment blocks (QuizBuilder/Assignment) found");
  }

  // Should have some content blocks
  const contentCount = typeCounts.get("RichContent") ?? 0;
  if (contentCount < 2) {
    warnings.push(`Only ${contentCount} RichContent blocks — course may lack substance`);
  }

  // Check for too many of one type
  for (const [type, count] of Array.from(typeCounts.entries())) {
    if (count > 10) {
      warnings.push(`Unusually many ${type} blocks (${count}) — possible generation error`);
    }
  }

  return warnings;
}

/** Full validation: check all blocks + structure + auto-fix */
export function validateBlocks(blocks: PuckBlock[]): ValidationResult {
  // 1. Validate individual blocks
  const errors: ValidationError[] = [];
  blocks.forEach((block, i) => {
    errors.push(...validateBlock(block, i));
  });

  // 2. Auto-fix minor issues
  const { fixed, fixes } = autoFix(blocks);

  // 3. Validate overall structure
  const structuralWarnings = validateStructure(fixed);

  const allWarnings = [...fixes.map((f) => `Auto-fix: ${f}`), ...structuralWarnings];
  const criticalErrors = errors.filter((e) => e.severity === "error");

  return {
    valid: criticalErrors.length === 0,
    errors,
    warnings: allWarnings,
    fixedBlocks: fixes.length > 0 ? fixed : undefined,
  };
}

/** Quick check: is this block valid enough to use? */
export function isBlockValid(block: PuckBlock): boolean {
  if (!VALID_BLOCK_TYPES.has(block.type)) return false;
  if (!block.props || typeof block.props !== "object") return false;
  return true;
}
