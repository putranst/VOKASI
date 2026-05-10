# MAIC-UI Features → VOKASI2 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Port 5 key features from MAIC-UI (Tsinghua) into VOKASI2 — document processing pipeline, template system, AI content refinement, dual AI generation modes, and SSE streaming for course generation.

**Architecture:** All features integrate into VOKASI2's existing Next.js 15 monolith. New API routes in `frontend/src/app/api/`, new lib modules in `frontend/src/lib/`, new components in `frontend/src/components/`. No separate backend service needed — MAIC-UI's FastAPI patterns translate directly to Next.js API routes.

**Tech Stack:** Next.js 15 App Router, OpenRouter (existing), pdf.js/pdfjs-dist (PDF parsing), mammoth (DOCX), Sharp (image processing), SSE via ReadableStream (existing pattern in tutor/chat)

---

## Feature 1: Document Processing Pipeline

**What it does:** Instructors upload PDF/PPT/DOCX → AI extracts content → generates Puck-compatible blocks (ModuleHeader, RichContent, QuizBuilder, etc.) ready for course editing.

**Adapted from:** MAIC-UI's `ai_processor.py` pipeline (PDF→images→vision analysis→HTML generation)

### Task 1.1: Create document upload API endpoint

**Objective:** Accept PDF/PPT/DOCX uploads, store file, create processing record

**Files:**
- Create: `frontend/src/app/api/documents/upload/route.ts`
- Create: `frontend/src/lib/document-processor.ts` (shared utilities)

**Implementation:**
```typescript
// POST /api/documents/upload
// Accepts: multipart/form-data with file + optional title, course_id
// Returns: { documentId, status: "processing" }

// 1. Auth check (existing pattern)
// 2. Validate file type (pdf, pptx, docx) and size (max 50MB)
// 3. Save to uploads/ directory with UUID filename
// 4. Insert into new `documents` table (id, user_id, filename, file_path, file_type, status, created_at)
// 5. Trigger background processing (immediate for now, Bull queue later)
// 6. Return documentId
```

**Schema addition (backend/sql/schema.sql):**
```sql
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'pptx', 'docx'
    file_size BIGINT,
    status document_status DEFAULT 'uploaded',
    processing_result JSONB, -- extracted content + generated blocks
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;
```

**Install deps:**
```bash
cd frontend && bun add pdf-parse mammoth sharp uuid
```

### Task 1.2: PDF text extraction module

**Objective:** Extract structured text from PDF pages

**Files:**
- Modify: `frontend/src/lib/document-processor.ts`

**Implementation:**
```typescript
// extractPdfText(filePath: string): Promise<{ pages: PageContent[] }>
// Uses pdf-parse to extract text per page
// Returns: { pages: [{ pageNumber, text, sections: [{ heading, content }] }] }

// Section detection: regex for numbered headings (1., 1.1, etc.) and bold text
// Paragraph grouping: merge lines within same section
```

### Task 1.3: DOCX text extraction module

**Objective:** Extract structured text from DOCX files

**Files:**
- Modify: `frontend/src/lib/document-processor.ts`

**Implementation:**
```typescript
// extractDocxText(filePath: string): Promise<{ pages: PageContent[] }>
// Uses mammoth to extract raw text + heading styles
// Groups content by heading level into sections
// Splits into logical "pages" by H1/H2 boundaries
```

### Task 1.4: AI content analysis and Puck block generation

**Objective:** Take extracted text → AI analyzes → generates Puck-compatible block structure

**Files:**
- Modify: `frontend/src/lib/document-processor.ts`
- Modify: `frontend/src/lib/openrouter.ts` (add generateBlocks function)

**Implementation:**
```typescript
// generatePuckBlocks(extractedContent: PageContent[], mode: 'fast' | 'heavy'): Promise<PuckBlock[]>
// 
// Fast mode: Single AI call
//   - Prompt: "Convert this educational content into Puck blocks..."
//   - Returns: ModuleHeader[], RichContent[], QuizBuilder[] blocks
//
// Heavy mode: Multi-stage pipeline
//   - Stage 1: Content analysis → key concepts, learning objectives, difficulty
//   - Stage 2: Block structure planning → which block types for each section
//   - Stage 3: Block content generation → fill each block with rich content
//   - Stage 4: Validation → check quiz answers, verify learning objectives coverage
```

### Task 1.5: Processing status API and polling

**Objective:** Let frontend poll document processing status

**Files:**
- Create: `frontend/src/app/api/documents/[id]/route.ts` (GET status)
- Create: `frontend/src/app/api/documents/[id]/blocks/route.ts` (GET generated blocks)

**Implementation:**
```typescript
// GET /api/documents/[id]
// Returns: { id, status, progress, error_message, created_at }
// progress: 0-100 based on pipeline stage

// GET /api/documents/[id]/blocks
// Returns: { blocks: PuckBlock[] } — the generated course blocks
// Only available when status === 'completed'
```

### Task 1.6: Document upload UI component

**Objective:** Instructor-facing upload form with progress tracking

**Files:**
- Create: `frontend/src/components/documents/DocumentUploader.tsx`
- Create: `frontend/src/app/(dashboard)/instructor/documents/page.tsx`

**Implementation:**
```typescript
// DocumentUploader: drag-and-drop zone, file type validation, upload progress bar
// On upload complete: poll /api/documents/[id] every 2s until completed
// On completion: show preview of generated blocks, "Import to Course" button
// Import button: calls /api/courses/[id]/import-blocks to merge into existing course
```

---

## Feature 2: Template System

**What it does:** Reusable course templates with multi-factor matching algorithm. Instructors select templates when creating courses, LLM customizes content while preserving structure.

**Adapted from:** MAIC-UI's `DemoTemplate` model + `TemplateRegistry` matching + `TemplateCustomizer`

### Task 2.1: Template database schema

**Objective:** Create templates table with matching metadata

**Files:**
- Modify: `backend/sql/schema.sql`

**Schema:**
```sql
DO $$ BEGIN
  CREATE TABLE course_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code TEXT UNIQUE NOT NULL, -- 'web-dev-101', 'data-science-intro'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'tech', 'business', 'creative', 'science'
    keywords TEXT[] DEFAULT '{}',
    grade_levels TEXT[] DEFAULT '{}', -- 'beginner', 'intermediate', 'advanced'
    domain_tags TEXT[] DEFAULT '{}', -- matches courses.domain_tags
    block_structure JSONB NOT NULL, -- Puck blocks template
    preview_html TEXT, -- rendered preview
    usage_count INTEGER DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TABLE template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES course_templates(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    user_id UUID NOT NULL REFERENCES users(id),
    customization_score FLOAT, -- how well template matched (0-1)
    used_at TIMESTAMPTZ DEFAULT now()
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;
```

### Task 2.2: Template matching algorithm

**Objective:** Score templates against course requirements using weighted multi-factor matching

**Files:**
- Create: `frontend/src/lib/template-matcher.ts`

**Implementation:**
```typescript
// matchTemplates(requirements: {
//   title: string,
//   description: string,
//   domain?: string,
//   targetAudience?: string,
//   difficulty?: string
// }): Promise<MatchedTemplate[]>
//
// Scoring weights (from MAIC-UI):
//   keywords: 0.4 — Jaccard similarity between requirement keywords and template.keywords
//   category: 0.3 — exact match or fuzzy (tech→technology)
//   domain: 0.15 — overlap between domain_tags
//   grade_level: 0.15 — match difficulty to grade_levels
//
// Bonus: usage_count * 0.01 (popularity boost, capped at 0.1)
// Returns sorted array with score + human-readable match explanation
```

### Task 2.3: Template CRUD API

**Objective:** Full template management for admins, search for instructors

**Files:**
- Create: `frontend/src/app/api/templates/route.ts` (GET list, POST create)
- Create: `frontend/src/app/api/templates/[id]/route.ts` (GET detail, PUT update, DELETE)
- Create: `frontend/src/app/api/templates/search/route.ts` (POST search with matching)

**Implementation:**
```typescript
// GET /api/templates — list all templates (paginated, filterable by category/domain)
// POST /api/templates — admin creates template (requires admin role)
// POST /api/templates/search — { title, description, domain, difficulty } → matched templates
// GET /api/templates/[id] — template detail with preview
```

### Task 2.4: Template customization via LLM

**Objective:** Take a template + course requirements → AI customizes content while preserving structure

**Files:**
- Create: `frontend/src/lib/template-customizer.ts`

**Implementation:**
```typescript
// customizeTemplate(template: CourseTemplate, requirements: CourseRequirements): Promise<PuckBlock[]>
//
// Prompt structure:
//   "You have a course template: {template.block_structure}
//    Customize it for: {requirements}
//    Rules:
//    - Keep the same block types and order
//    - Replace content with domain-specific material
//    - Adjust difficulty for target audience
//    - Keep quiz structure but change questions/answers"
//
// Returns customized PuckBlock[] ready for course creation
```

### Task 2.5: Template selection UI

**Objective:** Template browser with search, preview, and one-click apply

**Files:**
- Create: `frontend/src/components/templates/TemplateBrowser.tsx`
- Create: `frontend/src/components/templates/TemplateCard.tsx`
- Modify: `frontend/src/app/(dashboard)/instructor/courses/new/page.tsx` (add template step)

**Implementation:**
```typescript
// TemplateBrowser: search bar + category filters + grid of TemplateCards
// TemplateCard: name, description, preview thumbnail, usage count, "Use Template" button
// On "Use Template": calls /api/templates/search, then /api/templates/[id]/customize
// Customized blocks injected into Puck editor as initial course content
```

### Task 2.6: Seed initial templates

**Objective:** Create 5-10 starter templates for common vocational topics

**Files:**
- Create: `backend/sql/seed_templates.sql`

**Templates to seed:**
1. Web Development Fundamentals (HTML/CSS/JS)
2. Data Analysis with Python
3. Digital Marketing Essentials
4. Project Management (Agile/Scrum)
5. UI/UX Design Principles
6. Cloud Computing Basics
7. Cybersecurity Fundamentals
8. Business Communication

---

## Feature 3: AI Content Refinement

**What it does:** Instructors select specific Puck blocks → describe changes → AI rewrites just that block. Iterative refinement without regenerating entire course.

**Adapted from:** MAIC-UI's WebEditor citation-based editing + `EditorProcessor`

### Task 3.1: Block-level edit API

**Objective:** Accept block content + user instructions → return refined block

**Files:**
- Create: `frontend/src/app/api/courses/[id]/blocks/refine/route.ts`

**Implementation:**
```typescript
// POST /api/courses/[id]/blocks/refine
// Body: { blockIndex: number, blockType: string, currentContent: any, instructions: string }
// Returns: { refinedContent: any, changes: string }
//
// Flow:
// 1. Auth + rate limit
// 2. Build prompt with current block content + user instructions
// 3. AI refines only the specified block
// 4. Validate output matches blockType schema
// 5. Return refined content + human-readable change summary
```

### Task 3.2: Batch refinement API

**Objective:** Refine multiple blocks in one request (e.g., "make all quizzes harder")

**Files:**
- Create: `frontend/src/app/api/courses/[id]/blocks/refine-batch/route.ts`

**Implementation:**
```typescript
// POST /api/courses/[id]/blocks/refine-batch
// Body: { blockIndices: number[], instructions: string }
// Returns: { results: [{ blockIndex, refinedContent, changes }] }
//
// Processes blocks in parallel (up to 3 concurrent AI calls)
// Rate limited: 10 blocks per minute per user
```

### Task 3.3: Block refinement UI component

**Objective:** Inline editing interface within Puck editor

**Files:**
- Create: `frontend/src/components/courses/BlockRefiner.tsx`
- Modify: `frontend/src/lib/puck/config.tsx` (add custom toolbar actions)

**Implementation:**
```typescript
// BlockRefiner: appears as floating panel when block is selected
// - Text input: "Describe your changes..."
// - Quick actions: "Simplify", "Add examples", "Make interactive", "Add quiz"
// - "Refine" button → calls /api/courses/[id]/blocks/refine
// - Before/after diff view
// - "Apply" / "Discard" / "Refine Again" buttons
// - Loading state with streaming progress
```

---

## Feature 4: Dual AI Generation Modes (Fast/Heavy)

**What it does:** Fast mode for quick drafts (single AI call), Heavy mode for high-quality output (multi-stage pipeline with validation).

**Adapted from:** MAIC-UI's `fast_generator.py` + `heavy_generator.py` pipeline

### Task 4.1: Fast generator module

**Objective:** Single-pass AI generation for quick course creation

**Files:**
- Modify: `frontend/src/lib/openrouter.ts` (add generateFast)

**Implementation:**
```typescript
// generateFast(content: string, blockTypes: string[]): Promise<PuckBlock[]>
// 
// Single AI call with detailed prompt
// Returns all blocks in one response
// Target: <30 seconds
// Quality: Good for drafts, may need refinement
```

### Task 4.2: Heavy generator module

**Objective:** Multi-stage pipeline for high-quality course generation

**Files:**
- Create: `frontend/src/lib/heavy-generator.ts`

**Implementation:**
```typescript
// generateHeavy(content: string, options: HeavyOptions): Promise<PuckBlock[]>
//
// Stage 1: Content Analysis (AI call 1)
//   - Extract: key concepts, learning objectives, difficulty, prerequisites
//   - Output: ContentAnalysis object
//
// Stage 2: Structure Planning (AI call 2)
//   - Input: ContentAnalysis
//   - Plan: which block types, order, content distribution
//   - Output: BlockPlan[]
//
// Stage 3: Block Generation (AI calls 3-N, parallel)
//   - Input: BlockPlan + source content
//   - Generate each block's content independently
//   - Output: PuckBlock[]
//
// Stage 4: Validation (no AI call, rule-based)
//   - Check: quiz answers are correct, learning objectives covered
//   - Check: video URLs are valid, content is non-empty
//   - Fix: auto-correct minor issues
//
// Stage 5: Polish (AI call N+1, optional)
//   - Input: validated blocks
//   - Improve transitions, consistency, formatting
//   - Output: final PuckBlock[]
//
// Target: 2-3 minutes
// Quality: Publication-ready
```

### Task 4.3: Validation pipeline

**Objective:** Rule-based validation for generated content

**Files:**
- Create: `frontend/src/lib/content-validator.ts`

**Implementation:**
```typescript
// validateBlocks(blocks: PuckBlock[]): ValidationResult
//
// Checks:
// - QuizBuilder: correctIndex within options range, no empty questions
// - RichContent: non-empty html, valid HTML structure
// - ModuleHeader: title present, learningObjectives non-empty
// - VideoBlock: valid URL format (YouTube, Vimeo)
// - All blocks: props match expected schema
//
// Returns: { valid: boolean, errors: ValidationError[], warnings: string[] }
```

### Task 4.4: Mode selector in course generation UI

**Objective:** Let instructors choose Fast or Heavy mode

**Files:**
- Modify: `frontend/src/app/(dashboard)/instructor/courses/new/page.tsx`

**Implementation:**
```typescript
// Add mode toggle to course generation form:
// - "Quick Draft" (Fast mode) — default, ~30 seconds
//   Description: "Generate a course draft quickly. You can refine later."
// - "High Quality" (Heavy mode) — ~2-3 minutes
//   Description: "Multi-stage generation with validation. Best for final courses."
//
// Mode stored in request body, passed to generation pipeline
// Progress indicator differs: Fast = simple spinner, Heavy = stage progress bar
```

---

## Feature 5: SSE Streaming for Course Generation

**What it does:** Real-time progress updates during course generation instead of waiting for complete response.

**Adapted from:** MAIC-UI's SSE edit status pattern + VOKASI2's existing `socraticChatStream`

### Task 5.1: Streaming course generation API

**Objective:** Replace synchronous /api/courses/generate with streaming endpoint

**Files:**
- Create: `frontend/src/app/api/courses/generate/stream/route.ts`
- Modify: `frontend/src/lib/openrouter.ts` (add streaming helpers)

**Implementation:**
```typescript
// GET /api/courses/generate/stream?title=...&description=...&mode=fast|heavy
// Returns: SSE stream with event types
//
// Event types:
// - "stage": { stage: string, message: string } — pipeline stage updates
// - "progress": { percent: number, current: number, total: number } — progress updates
// - "block": { index: number, block: PuckBlock } — completed block (incremental)
// - "complete": { blocks: PuckBlock[], summary: string } — final result
// - "error": { message: string, stage: string } — error during generation
//
// Implementation pattern (from socraticChatStream):
// const stream = new ReadableStream({
//   async start(controller) {
//     const encoder = new TextEncoder();
//     const send = (event: string, data: any) => {
//       controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
//     };
//     // ... generation logic with send() calls
//     controller.close();
//   }
// });
// return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', ... } });
```

### Task 5.2: Fast mode streaming

**Objective:** Stream progress for single-pass generation

**Files:**
- Modify: `frontend/src/app/api/courses/generate/stream/route.ts`

**Implementation:**
```typescript
// Fast mode events:
// 1. send("stage", { stage: "analyzing", message: "Analyzing course requirements..." })
// 2. send("stage", { stage: "generating", message: "Generating course content..." })
// 3. Stream AI response chunks as they arrive (OpenRouter SSE)
// 4. send("stage", { stage: "validating", message: "Validating generated content..." })
// 5. send("complete", { blocks: [...], summary: "..." })
```

### Task 5.3: Heavy mode streaming

**Objective:** Stream detailed progress for multi-stage pipeline

**Files:**
- Modify: `frontend/src/app/api/courses/generate/stream/route.ts`

**Implementation:**
```typescript
// Heavy mode events:
// 1. send("stage", { stage: "analyzing", message: "Stage 1/5: Analyzing content..." })
//    send("progress", { percent: 0, current: 1, total: 5 })
// 2. send("stage", { stage: "planning", message: "Stage 2/5: Planning block structure..." })
//    send("progress", { percent: 20, current: 2, total: 5 })
// 3. send("stage", { stage: "generating", message: "Stage 3/5: Generating blocks..." })
//    // For each block as it completes:
//    send("block", { index: 0, block: {...} })
//    send("progress", { percent: 40 + (i/n)*30, current: 3, total: 5 })
// 4. send("stage", { stage: "validating", message: "Stage 4/5: Validating content..." })
//    send("progress", { percent: 80, current: 4, total: 5 })
// 5. send("stage", { stage: "polishing", message: "Stage 5/5: Polishing final output..." })
//    send("progress", { percent: 95, current: 5, total: 5 })
// 6. send("complete", { blocks: [...], summary: "..." })
```

### Task 5.4: Streaming progress UI component

**Objective:** Real-time progress display during generation

**Files:**
- Create: `frontend/src/components/courses/GenerationProgress.tsx`
- Modify: `frontend/src/app/(dashboard)/instructor/courses/new/page.tsx`

**Implementation:**
```typescript
// GenerationProgress component:
// - Stage indicator: "Analyzing content..." with animated dots
// - Progress bar: percentage with stage label
// - Block preview: shows blocks as they're generated (incremental)
// - Cancel button: abort generation
// - Error display: shows error if generation fails
//
// Usage in course creation page:
// const eventSource = new EventSource(`/api/courses/generate/stream?${params}`);
// eventSource.addEventListener("stage", (e) => setStage(JSON.parse(e.data)));
// eventSource.addEventListener("progress", (e) => setProgress(JSON.parse(e.data)));
// eventSource.addEventListener("block", (e) => addBlock(JSON.parse(e.data)));
// eventSource.addEventListener("complete", (e) => onComplete(JSON.parse(e.data)));
// eventSource.addEventListener("error", (e) => onError(JSON.parse(e.data)));
```

---

## Implementation Order

**Phase 1 — Foundation (Feature 4 + Feature 5):** These two are prerequisites for everything else.
1. Task 4.1: Fast generator module
2. Task 4.3: Validation pipeline
3. Task 4.2: Heavy generator module
4. Task 5.1-5.3: Streaming generation API
5. Task 5.4: Streaming progress UI

**Phase 2 — Content Ingestion (Feature 1):** Document processing builds on generation.
6. Task 1.1: Upload endpoint + schema
7. Task 1.2-1.3: PDF/DOCX extraction
8. Task 1.4: AI block generation (uses Fast/Heavy from Phase 1)
9. Task 1.5-1.6: Status polling + upload UI

**Phase 3 — Templates (Feature 2):** Templates use the same block generation.
10. Task 2.1: Schema
11. Task 2.2-2.4: Matching + customization + API
12. Task 2.5-2.6: UI + seed data

**Phase 4 — Refinement (Feature 3):** Refinement builds on all above.
13. Task 3.1-3.2: Refine API
14. Task 3.3: Refine UI

---

## Dependencies to Install

```bash
cd frontend && bun add pdf-parse mammoth sharp uuid
# pdf-parse: PDF text extraction
# mammoth: DOCX text extraction  
# sharp: Image processing (for PDF page thumbnails)
# uuid: Document ID generation
```

---

## Schema Changes Summary

New tables: `documents`, `course_templates`, `template_usage`
New enum: `document_status`

All use idempotent `DO $$ ... EXCEPTION WHEN duplicate_object` pattern per VOKASI2 convention.

---

## Testing Strategy

For each feature:
1. Unit test the lib modules (template-matcher, content-validator, heavy-generator)
2. Integration test the API routes (upload → process → retrieve blocks)
3. Manual test the UI flow (upload PDF → see blocks → edit in Puck)

Key edge cases:
- PDF with no extractable text (scanned images) → OCR fallback or graceful error
- AI generation timeout → retry once, then fail with clear message
- Invalid block structure from AI → validator catches, retries generation
- Large PDF (100+ pages) → process in chunks, stream progress
