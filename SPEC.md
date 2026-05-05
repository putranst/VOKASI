# VOKASI2 Platform — Production Specification
**Based on:** VOKASI_PRD_v2.3.md  
**Version:** 2.3  
**Date:** 2026-04-30  
**Status:** Phase 1 — Foundation  

---

## 1. Architecture

```
Frontend:  Next.js 15 App Router (TypeScript, Tailwind CSS v4, shadcn/ui, Zustand)
Backend:   Next.js API Routes (Route Handlers) + Server Actions
Database:  PostgreSQL 15 + pgvector (embeddings, competency vectors)
Cache:     Redis (sessions, real-time leaderboards, rate limiting)
AI:        OpenRouter API (Kimi K2.6 primary; Claude 3.5 Sonnet fallback; GPT-4o-mini budget)
Sandbox:   Docker-isolated containers (1 CPU, 2GB RAM, 10GB disk per session)
Deployment: Coolify (VPS) + Docker
```

---

## 2. Design System

### Colors
| Token        | Hex       | Usage                          |
|--------------|-----------|--------------------------------|
| Deep Forest  | `#064e3b` | Primary brand, headers, CTAs    |
| Charcoal     | `#1f2937` | Body text, dark UI elements    |
| Off-White    | `#fafaf9` | Backgrounds, cards             |
| Emerald Light| `#34d399` | Success states, growth          |
| Amber        | `#f59e0b` | Warnings, in-progress           |
| Rose         | `#f43f5e` | Errors, failure resume accent  |
| Slate        | `#64748b` | Secondary text, borders         |

### Typography
- **Primary:** Inter (clean, modern, readable)
- **Monospace:** JetBrains Mono (code, sandbox, technical content)
- **Scale:** 12px base for dense dashboards, 16px for reading content

### Breakpoints
- Mobile-first: 320px (primary for SMK students)
- Tablet: 768px (polytechnic lab tablets)
- Desktop: 1280px (instructor course creation)

---

## 3. Database Schema

### users
```
id, email, phone, role (student|instructor|admin|mentor),
institution_id, track_id, competency_vector (pgvector 1536d),
nisn/nim, full_name, avatar_url, created_at, updated_at
```

### institutions
```
id, name, domain, plan (free|student_pro|institution|enterprise),
branding_json, settings_json, created_at
```

### courses
```
id, title, description, instructor_id, institution_id,
status (draft|published|archived),
structure_json (Puck blocks),
competency_weights_json,
enrollment_count, created_at, updated_at
```

### challenges
```
id, title, description, rubric_json,
difficulty (beginner|intermediate|advanced),
domain_tags (text[]),
sandbox_template_id,
max_attempts, time_limit_minutes,
is_weekly, rotation_week,
created_at
```

### submissions
```
id, user_id, challenge_id,
content_json (code, memo, files),
reflection_text,
ai_feedback_json (scores, narrative, suggestions),
peer_reviews_json,
competency_delta_json,
version_number,
status (draft|submitted|evaluated),
created_at, updated_at
```

### portfolios
```
id, user_id, public_url_slug,
artifacts_json (array of artifact objects),
competency_heatmap_json (12-dim radar data),
failure_resume_json,
endorsements_json,
is_public,
created_at, updated_at
```

### sandbox_sessions
```
id, user_id, template_id (jupyter|playground|sql|no_code),
container_id, state_url,
version_history_json,
mistake_log_json,
resource_usage_json,
status (active|paused|terminated),
created_at, expires_at, terminated_at
```

### reflections
```
id, user_id, context_type (challenge|project|simulation|socratic),
context_id,
content_text,
ai_analysis_json (sentiment, depth_score),
created_at
```

### competency_vectors
```
id, user_id, dimension_name,
value (float),
updated_at
-- 12 dimensions: prompt_engineering, model_evaluation, data_ethics,
--   automation, critical_thinking, collaboration, communication,
--   tool_fluency, debugging, domain_application,
--   continuous_learning, teaching_others
```

---

## 4. API Routes

### Auth
- `POST /api/auth/register` — email/phone + institution verification (NISN/NIM)
- `POST /api/auth/login` — JWT-based auth
- `POST /api/auth/refresh` — refresh token
- `GET  /api/auth/me` — current user profile

### Users
- `GET  /api/users/:id` — user profile
- `PATCH /api/users/:id` — update profile
- `GET  /api/users/:id/competency` — get 12-dim competency vector

### Courses
- `GET    /api/courses` — list (filterable by institution, status)
- `POST   /api/courses` — create course
- `GET    /api/courses/:id` — course detail with structure
- `PATCH  /api/courses/:id` — update course
- `DELETE /api/courses/:id` — delete (soft)
- `POST   /api/courses/:id/publish`
- `GET    /api/courses/:id/enroll` — enroll student
- `GET    /api/courses/:id/analytics` — instructor cohort analytics

### Challenges
- `GET  /api/challenges` — list (filterable, weekly rotation)
- `POST /api/challenges` — create challenge (instructor)
- `GET  /api/challenges/:id` — challenge detail + rubric
- `POST /api/challenges/:id/submit` — submit solution + reflection
- `GET  /api/challenges/:id/leaderboard` — anonymous leaderboard

### AI Tutor (SocraticChat)
- `POST /api/tutor/chat` — Socratic dialogue
- `POST /api/tutor/feedback` — draft submission for AI feedback
- `GET  /api/tutor/history/:session_id` — chat history

### Portfolio
- `GET  /api/portfolio/:user_id` — get portfolio
- `PATCH /api/portfolio` — update portfolio (artifacts, failure_resume)
- `GET  /api/portfolio/:user_id/export?format=pdf|json`
- `POST /api/portfolio/:user_id/endorse` — mentor endorsement

### Sandbox
- `POST /api/sandbox/start` — start sandbox session
- `GET  /api/sandbox/:id` — sandbox state
- `POST /api/sandbox/:id/save` — save version snapshot
- `POST /api/sandbox/:id/terminate` — terminate session

### Analytics
- `GET /api/analytics/student/:id` — student dashboard data
- `GET /api/analytics/instructor/:course_id` — cohort heatmap, failure modes
- `GET /api/analytics/admin` — institution-wide AI readiness index

---

## 5. AI Integration

### OpenRouter Configuration
- **Primary:** Kimi K2.6 (`moonshot-ai/kimi-k2-6`) — Socratic tutoring, challenge evaluation
- **Fallback:** Claude 3.5 Sonnet (`anthropic/claude-3.5-sonnet`) — complex reasoning
- **Budget:** GPT-4o-mini (`openai/gpt-4o-mini`) — knowledge checks, content generation

### Challenge Evaluation Pipeline
1. Parse submission into structured fields (code, memo, reflection)
2. RAG retrieval of similar high-quality submissions + rubric examples
3. LLM evaluation against rubric with chain-of-thought reasoning
4. Structured JSON output (scores: decomposition 30%, tool_usage 25%, output_quality 25%, reflection 20%)
5. Return within 60 seconds

### SocraticChat Modes
- **Guide Mode:** Leading questions, never gives direct answers
- **Devil's Advocate Mode:** Challenges student assumptions
- **Peer Mode:** Simulates peer learner for collaborative explanation

### Competency Tracking
- 12-dimensional vector updated per submission via weighted averaging
- pgvector cosine similarity for peer matching and mentor matching
- Decay function applied to competencies not practiced in 30 days

---

## 6. Phase 1 Deliverables (Months 1–3)

- [ ] Next.js 15 project setup with Tailwind v4 + shadcn/ui
- [ ] PostgreSQL + pgvector database setup
- [ ] JWT auth with role-based access (student/instructor/admin/mentor)
- [ ] Challenge Arena v1: 3 domains (Prompt Engineering, Model Evaluation, AI Ethics)
- [ ] AI evaluation pipeline via OpenRouter
- [ ] SocraticChat v1: Guide mode, text-only, Bahasa Indonesia + English
- [ ] Basic Portfolio: artifact storage, 12-dim competency heatmap (Recharts radar)
- [ ] Cloud Sandbox v1: Python Jupyter + LLM Playground (Docker-isolated)
- [ ] Student Dashboard: competency heatmap, challenge history, reflection depth score
- [ ] Instructor Dashboard: cohort competency gaps, common failure modes
- [ ] Seed data: 12 challenges across 3 domains
- [ ] Docker + Docker Compose setup for local dev
- [ ] Coolify deployment configuration

---

## 7. Localization
- **Primary:** Bahasa Indonesia (formal + conversational)
- **Secondary:** English (university internationalization track)
- Technical terms: English with Bahasa Indonesia tooltip explanations

---

## 8. Security Requirements
- JWT tokens with RS256 signing
- Row-level security on all tenant data
- Rate limiting: 100 req/min per user, 10 submissions/day per challenge
- Sandbox: no outbound internet except OpenRouter/HuggingFace
- Input validation on all API routes (Zod schemas)
- XSS protection, SQL injection prevention

---

## 9. Non-Goals (Anti-Patterns)
- No video watch time tracking
- No penalty for sandbox experimentation
- No public failure shaming (failure resume private by default)
- No infinite scroll content dumps
- No certificate walls — only competency portfolios
