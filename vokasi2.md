# VOKASI — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-04-23  
**Status:** Draft  
**Author:** Product Team  
**Previous Names:** CENDIKIA, T6, TSEA-X *(all deprecated — unified under VOKASI)*

---

## 1. Executive Summary

VOKASI is the unified rebrand and platform upgrade of CENDIKIA + OpenMAIC + Hermes. It is an AI-native vocational education platform that enables instructors to generate, visually edit, and publish adaptive courses using an embedded visual builder (Puck), while students learn through an AI-grounded, competency-tracked experience. The platform replaces all legacy branding (CENDIKIA, T6, TSEA-X) with VOKASI identity and introduces a course generation engine powered by OpenRouter/Kimi APIs.

**Market Focus:** Indonesia (Phase 1). Malaysian and broader ASEAN expansion planned for Phase 2.

---

## 2. Problem Statement

Current vocational education platforms in Indonesia are either:
- **Too rigid**: Legacy LMSs (Moodle, Canvas, Google Classroom) force instructors into fixed templates with no AI assistance.
- **Too generic**: AI course generators output static documents that cannot be visually edited or pedagogically structured.
- **Too fragmented**: CENDIKIA (content), OpenMAIC (AI orchestration), and Hermes (agentic tutoring) operate as separate systems with inconsistent branding.

VOKASI solves this by unifying AI generation, visual course building, and adaptive learning under one sovereign, white-label platform tailored for Indonesian SMK (Sekolah Menengah Kejuruan), politeknik, and BLK (Balai Latihan Kerja) ecosystems.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Reduce course creation time | Instructor time from outline to publish | &lt; 30 minutes |
| Improve learner completion rates | Module completion rate | &gt; 75% |
| Platform adoption | Active institutions (pilot) | 10 by Q3 2026 |
| AI grounding accuracy | SocraticChat relevance score | &gt; 90% |
| Rebrand completion | Zero legacy references in codebase | 100% |

---

## 4. User Personas

### 4.1 Instruktur Budi (Instructor)
- **Role**: Guru SMK or instruktur BLK in Indonesia
- **Goal**: Create Kurikulum Merdeka-aligned modules quickly without coding
- **Pain Point**: Spends 8+ hours formatting content in Word/PowerPoint; no way to embed interactive AI tutoring
- **Technical Level**: Intermediate (uses Canva, basic Google Classroom)

### 4.2 Pelajar Aisyah (Student)
- **Role**: Siswa SMK kelas 12 or peserta BLK
- **Goal**: Learn practical skills (e.g., mekatronika, pengembangan web, pariwisata) with immediate AI feedback
- **Pain Point**: Static PDFs offer no interactivity; stuck on concepts with no 24/7 help
- **Technical Level**: High (mobile-native, expects app-like UX, primarily Android)

### 4.3 Admin VOKASI (Platform Admin)
- **Role**: Kepala program keahlian or admin BLK
- **Goal**: Deploy white-label instance with institutional branding
- **Pain Point**: SaaS LMSs are expensive and lock data overseas; needs on-premise or self-hosted option
- **Technical Level**: Advanced (manages VPS/Coolify deployments)

---

## 5. Functional Requirements

### 5.1 Unified Branding Engine (VOKASI Rebrand)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| BR-001 | All UI references to "CENDIKIA", "T6", "TSEA-X" replaced with "VOKASI" | Must | Global string search returns zero matches |
| BR-002 | New VOKASI logo, color palette (Deep Forest: emerald #064e3b, charcoal #1f2937, off-white #fafaf9), typography (Inter + JetBrains Mono) | Must | Design tokens centralized in `theme.config.ts` |
| BR-003 | White-label theming: institutions override CSS variables via admin panel | Should | Admin can change primary color, logo, favicon without code deploy |
| BR-004 | Email templates, auth screens, and error pages use VOKASI branding | Must | Visual regression test passes |

### 5.2 AI Course Generation (The "Magic")

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AI-001 | Instructor inputs natural language prompt (e.g., "Modul 3 minggu tentang AI berdaulat untuk siswa SMK Teknik Komputer") | Must | Textarea accepts up to 2000 chars; validates non-empty |
| AI-002 | System calls OpenRouter API (Kimi K2.5) with structured system prompt | Must | Response time &lt; 15s; timeout handled gracefully |
| AI-003 | AI returns pedagogical outline + content draft + quiz questions in structured JSON | Must | JSON schema validated against Zod; 95% valid on 100 test prompts |
| AI-004 | Middleware converts AI JSON to Puck-compatible document schema | Must | All Puck components mapped 1:1 to learning blocks |
| AI-005 | "Regenerate block" button on each component triggers targeted AI rewrite | Should | Only modified block re-fetches; preserves sibling blocks |
| AI-006 | AI suggests multimedia (video script, infographic description) per block | Could | Returns markdown embed codes or placeholder URLs |

### 5.3 Visual Course Builder (Puck Integration)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| VB-001 | Embedded Puck editor at `/instructor/builder/:courseId` | Must | Loads in &lt; 2s; authenticated via JWT |
| VB-002 | Educational component registry pre-loaded in Puck config | Must | 8 core blocks available (see §6.1) |
| VB-003 | Drag-and-drop rearrangement of course blocks | Must | Smooth DnD with visual drop indicators |
| VB-004 | Block-level editing: inline WYSIWYG for text, form fields for metadata | Must | Changes persist to local state; auto-save every 10s |
| VB-005 | "Publish" action saves Puck JSON to `course_modules.puck_data` (JSONB) | Must | Atomic transaction; rollback on DB error |
| VB-006 | Preview mode: renders course as student sees it | Must | Toggle button; URL query param `?preview=true` |
| VB-007 | Version history: store snapshots on each publish | Should | Diff view between versions |

### 5.4 Student Learning Experience

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| LE-001 | Student views course via block renderer at `/learn/:courseId` | Must | Loads Puck JSON and maps to React components |
| LE-002 | Progress tracking: per-block completion stored in `module_progress` | Must | Updates on scroll-into-view + manual mark-complete |
| LE-003 | SocraticChat block: AI tutor grounded in current lesson vector embeddings | Must | Context window includes current + previous 2 blocks |
| LE-004 | Quiz block: auto-grade MCQ; queue SA for AI grading via Kimi | Must | MCQ instant feedback; SA graded in &lt; 60s async |
| LE-005 | Adaptive unlocking: fail quiz → unlock remedial content block | Should | Conditional logic parsed from Puck JSON `gates` field |
| LE-006 | Offline mode: export course to static HTML for low-connectivity regions | Could | Service worker caches visited blocks |

### 5.5 Admin & Institution Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AM-001 | Institution onboarding: subdomain provisioning (`institution.vokasi.id`) | Should | Wildcard DNS + reverse proxy auto-config |
| AM-002 | Role-based access: Superadmin, Institution Admin, Instructor, Student | Must | Middleware checks `role` claim in JWT |
| AM-003 | Analytics dashboard: course completion, engagement heatmaps, AI tutor usage | Should | Aggregates from `module_progress` + chat logs |
| AM-004 | SCORM/xAPI export for institutional compliance | Could | Valid SCORM 1.2 package generated |

---

## 6. Technical Specifications

### 6.1 Educational Component Registry (Puck Config)

```typescript
const vokasiComponents = {
  ModuleHeader: {
    fields: { title, description, duration, objectives },
    render: ModuleHeaderRenderer
  },
  RichContent: {
    fields: { body, wordCount },
    render: RichContentRenderer
  },
  VideoBlock: {
    fields: { url, transcript, provider },
    render: VideoBlockRenderer
  },
  SocraticChat: {
    fields: { seedQuestion, contextScope },
    render: SocraticChatRenderer
  },
  QuizBuilder: {
    fields: { questions, timeLimit, passingScore },
    render: QuizBuilderRenderer
  },
  CodeSandbox: {
    fields: { starterCode, testCases, language },
    render: CodeSandboxRenderer
  },
  PeerReviewRubric: {
    fields: { criteria, maxScore },
    render: PeerReviewRenderer
  },
  ReflectionJournal: {
    fields: { prompt, minWords },
    render: JournalRenderer
  },
  Assignment: {
    fields: { rubric, deliverableType, dueDate },
    render: AssignmentRenderer
  },
  DiscussionSeed: {
    fields: { prompt, tags },
    render: DiscussionSeedRenderer
  },
};
```

### 6.2 Data Model

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  instructor_id UUID REFERENCES users(id),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  puck_data JSONB NOT NULL DEFAULT '{}',
  vector_collection TEXT,
  ai_generation_prompt TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE module_progress (
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  block_id TEXT NOT NULL,
  status ENUM('locked', 'available', 'completed') DEFAULT 'locked',
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id, block_id)
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  block_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  context_embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 AI Generation Pipeline

```
Instructor Prompt
    |
    v
OpenRouter API (Kimi K2.5) — System prompt enforces pedagogical JSON schema
    |
    v
Zod validation + error recovery (retry with schema hint on failure)
    |
    v
Puck JSON Transformer (maps AI output to component registry)
    |
    v
Puck Editor (pre-populated, instructor edits visually)
    |
    v
Publish —> Save to PostgreSQL + Generate vector embeddings (Naska Knowledge Hub)
    |
    v
Student Renderer reads JSON + fetches chat context from vector store
```

### 6.4 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, Puck `@measured/puck` |
| State Management | Zustand (editor), TanStack Query (server state) |
| Backend | Next.js API Routes / tRPC |
| Database | PostgreSQL 16 + pgvector |
| Vector Store | Qdrant or pgvector (reuse Naska embedding pipeline) |
| AI Gateway | OpenRouter (Kimi K2.5, VOKASI Tutor models) |
| Auth | NextAuth.js / custom JWT (reuse T6 auth) |
| Deployment | Coolify on VPS/AWS EC2 (existing infrastructure) |
| Monitoring | OpenTelemetry + Grafana (optional) |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Editor loads &lt; 2s; AI generation &lt; 15s; quiz grading &lt; 500ms (MCQ) |
| Scalability | Support 1,000 concurrent instructors; 10,000 concurrent students |
| Security | All AI prompts logged for audit; student data encrypted at rest (AES-256); comply with UU PDP (Indonesian Personal Data Protection Law) |
| Accessibility | WCAG 2.1 AA; keyboard-navigable builder; screen reader labels on all blocks |
| Reliability | 99.5% uptime; automated DB backups every 6h; AI fallback to cached responses on timeout |
| i18n | Indonesian (Bahasa Indonesia) primary; English secondary for international expansion |

---

## 8. User Flows

### 8.1 Instructor Creates AI-Generated Course

1. Instructor logs into VOKASI Dashboard
2. Clicks "Kursus Baru" → inputs title and prompt in Indonesian
3. System shows loading state; calls OpenRouter
4. AI returns outline; Puck editor opens pre-populated
5. Instructor edits blocks, adds video URLs, tweaks quiz questions
6. Clicks "Pratinjau" → verifies student experience
7. Clicks "Terbitkan" → course goes live; students notified

### 8.2 Student Engages with Adaptive Course

1. Student enrolls via institution portal
2. Course renderer loads Module 1 blocks sequentially
3. Student reads RichContent → watches VideoBlock → takes QuizBuilder
4. Fails quiz (score &lt; 70%) → system unlocks remedial RichContent block
5. Student opens SocraticChat → asks question → AI responds with lesson-grounded context in Indonesian
6. Completes all blocks → sertifikat awarded; progress synced to institution LMS via xAPI

---

## 9. Out of Scope

| Item | Rationale |
|------|-----------|
| Native mobile apps (iOS/Android) | PWA sufficient for pilot; native apps in v2.0 |
| Live video conferencing | Integrate Google Meet/Zoom externally if needed |
| Payment gateway | Institution licensing model; no per-student payments yet |
| LTI 1.3 Advantage | Support LTI 1.1 first; Advantage in v2.0 |
| Real-time collaborative editing | Complex OT/Merge; single-editor locking for MVP |
| Malaysian market features | Phase 2 scope; defer KPM/UPSI-specific integrations |

---

## 10. Timeline & Milestones

| Phase | Deliverables | Duration | Target |
|-------|-------------|----------|--------|
| Phase 0: Rebrand | Global string replacement, new design tokens, asset swap | 1 week | Week 1 |
| Phase 1: Builder Core | Puck integration, 8 educational blocks, save/publish | 2 weeks | Week 3 |
| Phase 2: AI Pipeline | OpenRouter integration, prompt engineering, JSON transformer | 2 weeks | Week 5 |
| Phase 3: Student Experience | Block renderer, progress tracking, SocraticChat RAG | 2 weeks | Week 7 |
| Phase 4: Polish | White-label theming, analytics, SCORM export, QA | 2 weeks | Week 9 |
| Phase 5: Pilot | Deploy to 10 Indonesian SMK/BLK institutions, collect feedback, iterate | 4 weeks | Week 13 |

---

## 11. Open Questions

1. Should we support Kurikulum Merdeka export format for Dapodik integration? *(Decision needed before Phase 3)*
2. Which embedding model for course content vectorization? *(Default: same as Naska; evaluate jina-embeddings-v3 for Indonesian language)*
3. Do we need Moodle/Google Classroom import for migration? *(Defer to Phase 5 if pilot institutions demand it)*

---

## 12. Appendix

### 12.1 Legacy Name Mapping

| Legacy Name | New Name | Context |
|-------------|----------|---------|
| CENDIKIA | VOKASI | Platform name |
| T6 | VOKASI Core | Backend/API layer |
| TSEA-X | VOKASI Cloud | Cloud deployment tier |
| OpenMAIC | VOKASI AI Engine | AI orchestration layer |
| Hermes | VOKASI Tutor | Conversational AI agent |

### 12.2 AI System Prompt (Draft — Indonesian Focus)

```markdown
You are VOKASI Course Architect, an expert vocational education curriculum designer.
Given an instructor's prompt, generate a pedagogically sound course module following
Indonesian Kurikulum Merdeka and SMK competency standards.

Output strictly valid JSON matching this schema:
{
  "title": string,
  "duration_hours": number,
  "learning_objectives": string[],
  "blocks": [
    {
      "type": "ModuleHeader|RichContent|VideoBlock|SocraticChat|QuizBuilder|...",
      "props": { ...block-specific fields... }
    }
  ]
}

Rules:
- Use Indonesian language (Bahasa Indonesia) for all generated content
- Include at least one formative assessment per 30 minutes of content
- SocraticChat blocks must reference specific prior content for grounding
- Quiz questions must include distractors based on common misconceptions
- All content must be appropriate for Indonesian vocational context (SMK, politeknik, BLK)
- Follow Kurikulum Merdeka structure: capaian pembelajaran, tujuan, materi, penilaian


---

## 13. Beta Launch Critical Fixes

**Status:** Completed (2026-04-24)
**Context:** Platform prepared for 1,000 enrollments in beta launch phase

**Related Document:** For detailed campaign planning, funnel design, and operational requirements, see `beasiswa-beta-campaign.prd` — the dedicated PRD for the Beasiswa Beta Campaign targeting 1,000 enrollments.

### 13.1 Issues Identified

Codebase analysis revealed 5 critical issues that would block safe scaling to 1,000 concurrent users:

| # | Issue | Severity | Impact at Scale |
|---|-------|----------|-----------------|
| 1 | Predictable `devtoken` auth (format: `devtoken:{user_id}:{role}`) | Critical | Account enumeration and takeover risk |
| 2 | No rate limiting on any endpoints | Critical | Bot abuse, DDoS, payment spam |
| 3 | Payment race condition (no row locking on enrollment check) | Critical | Duplicate charges on double-click |
| 4 | Database connection pool defaults (5 base + 10 overflow = 15 total) | Critical | Connection exhaustion under load |
| 5 | SQLite allowed in production | Critical | Database lock errors at concurrency |

### 13.2 Fixes Implemented

#### Fix #1: JWT Auth Replacement
- **Files Modified:** `backend/routers/auth_utils.py`, `backend/main.py`, `backend/requirements.txt`, `backend/.env.example`
- **Changes:**
  - Removed `devtoken` auth scheme entirely
  - Implemented JWT tokens using `python-jose` with HS256 signing
  - Token expiry: 24 hours
  - Replaced SHA256 password hashing with bcrypt
  - Added `JWT_SECRET_KEY` environment variable
- **Dependencies Added:** `python-jose[cryptography]==3.3.0`, `passlib[bcrypt]==1.7.4`

#### Fix #2: Rate Limiting
- **Files Modified:** `backend/main.py`, `backend/routers/cohorts.py`, `backend/requirements.txt`
- **Changes:**
  - Added `slowapi` middleware with exception handler
  - Rate limits configured:
    - `/api/v1/auth/register`: 30 req/min
    - `/api/v1/auth/login`: 30 req/min
    - `/api/v1/cohorts/{slug}/initiate`: 10 req/min
    - `/api/v1/health`: 60 req/min
  - Returns HTTP 429 on limit exceeded
- **Dependency Added:** `slowapi==0.1.9`

#### Fix #3: Payment Race Condition Fix
- **Files Modified:** `backend/routers/cohorts.py`
- **Changes:**
  - Added `with_for_update()` row locking to existing pending payment query
  - Prevents concurrent requests from both passing the check
  - No API contract change

#### Fix #4: Database Connection Pool Configuration
- **Files Modified:** `backend/database.py`
- **Changes:**
  - Configured explicit pool settings:
    - `pool_size=20`
    - `max_overflow=30` (50 total connections)
    - `pool_pre_ping=True` (connection health check)
    - `pool_recycle=300` (recycle after 5 minutes)
  - Applies to PostgreSQL; SQLite uses default (dev only)

#### Fix #5: Production SQLite Guard
- **Files Modified:** `backend/database.py`
- **Changes:**
  - Added startup check: if `ENV=production` and SQLite detected, abort with error
  - Error message: "SQLite not allowed in production. Set DATABASE_URL to PostgreSQL connection string."
  - Fails fast to prevent silent production misconfiguration

### 13.3 Deployment Checklist

Before beta launch to 1,000 enrollments:

- [ ] Set `JWT_SECRET_KEY` in production environment (generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] Set `DATABASE_URL=postgresql://...` in production
- [ ] Set `ENV=production` to enable SQLite guard
- [ ] Configure email provider (SendGrid/Postmark) via admin dashboard for transactional emails
- [ ] Test registration flow with new JWT tokens
- [ ] Test login flow with new JWT tokens
- [ ] Verify rate limiting triggers (31 rapid auth requests → 429)
- [ ] Test payment double-click scenario (should return existing order, not duplicate)
- [ ] Verify backend starts with all 5 fixes applied

### 13.4 Post-Launch: Unit Tests

**Status:** Pending (agreed after critical fixes complete)
**Estimated Effort:** 1–2 days
**Coverage:**
- JWT token creation and verification
- Rate limiting enforcement
- Payment race condition prevention
- Database pool configuration validation

