# Codebase Structure

**Analysis Date:** 2026-04-24

## Directory Layout

```
VOKASI/                              # Project root
├── backend/                         # FastAPI Python backend
│   ├── main.py                      # Canonical ASGI entrypoint (main:app)
│   ├── database.py                  # SQLAlchemy engine + session factory
│   ├── sql_models.py                # ORM model definitions
│   ├── models.py                    # Pydantic schemas (legacy mixed with sql_models)
│   ├── mock_db.py                   # In-memory data store for non-DB features
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Backend container image
│   ├── routers/                     # FastAPI APIRouter modules
│   │   ├── ai.py                    # /api/v1/ai/* — AI text assist, provider status
│   │   ├── auth_utils.py            # JWT helpers, password hashing, AuthContext
│   │   ├── classroom.py             # /api/v1/classroom/* + WebSocket /ws/classroom/{id}
│   │   ├── courses.py               # /api/v1/courses/*
│   │   ├── enrollments.py           # /api/v1/enrollments/*
│   │   ├── dashboard.py             # /api/v1/dashboard/*
│   │   ├── credentials.py           # /api/v1/credentials/*
│   │   ├── projects.py              # /api/v1/projects/* (CDIO)
│   │   ├── cohorts.py               # /api/v1/cohorts/*
│   │   ├── capstone.py              # /api/v1/capstone/*
│   │   ├── alumni.py                # /api/v1/alumni/*
│   │   ├── onboarding.py            # /api/v1/onboarding/*
│   │   ├── naska.py                 # /api/v1/naska/* (PKC / RAG)
│   │   ├── puck_courses.py          # /api/v1/puck/* (WYSIWYG course editor)
│   │   ├── admin_settings.py        # /api/v1/admin/*
│   │   └── debug.py                 # Debug-only endpoints
│   ├── services/                    # Business logic services
│   │   ├── openai_service.py        # AI provider abstraction (OpenAI/Gemini/OpenRouter/Mock)
│   │   ├── grading_service.py       # AI-powered submission grading
│   │   ├── seeding_service.py       # Sample data initialization
│   │   ├── email_service.py         # SMTP / Noop email sender
│   │   ├── payment_service.py       # Midtrans order state management
│   │   ├── blockchain_service.py    # Simulated SBT credential minting
│   │   ├── naska_service.py         # LlamaIndex PKC / RAG (optional deps)
│   │   ├── syllabus_generator.py    # AI syllabus generation
│   │   ├── code_execution_service.py# Cloud IDE code execution
│   │   ├── implementation_service.py# CDIO implementation phase
│   │   └── funnel_migrations.py     # DB migrations for beta funnel fields
│   ├── seeds/                       # Seed data modules
│   │   └── ai_fundamentals_seed.py  # AI Fundamentals course content seed
│   ├── tests/                       # pytest test suite
│   │   ├── test_main.py
│   │   ├── test_api_endpoints.py
│   │   └── test_beasiswa_funnel.py
│   ├── app/                         # DEPRECATED scaffold (not wired to production)
│   └── tsea.db                      # Local SQLite database file (dev only)
│
├── frontend/                        # Next.js 16 App Router frontend
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── layout.tsx           # Root layout — wraps all pages in <Providers>
│   │   │   ├── page.tsx             # Homepage (/)
│   │   │   ├── courses/             # Course pages
│   │   │   │   ├── page.tsx         # Course listing
│   │   │   │   └── [id]/            # Dynamic course routes
│   │   │   │       ├── page.tsx     # Course detail
│   │   │   │       ├── learn/       # Module learning view
│   │   │   │       ├── immerse/     # IRIS: Immerse phase
│   │   │   │       ├── realize/     # IRIS: Realize phase
│   │   │   │       ├── iterate/     # IRIS: Iterate phase
│   │   │   │       └── scale/       # IRIS: Scale phase
│   │   │   ├── dashboard/           # Student dashboard
│   │   │   ├── instructor/          # Instructor tools + course creation
│   │   │   ├── admin/               # Admin dashboard
│   │   │   ├── institution-dashboard/ # Institution admin view
│   │   │   ├── login/ register/     # Auth pages
│   │   │   ├── profile/             # User profile
│   │   │   ├── ai-tutor/            # AI tutor page
│   │   │   ├── cloud-ide/           # Monaco-based Cloud IDE
│   │   │   └── [many marketing pages] # about, blog, faq, sdg, hexahelix, etc.
│   │   ├── components/              # React components
│   │   │   ├── Navbar.tsx           # Top navigation
│   │   │   ├── Footer.tsx           # Footer
│   │   │   ├── Providers.tsx        # Context provider tree
│   │   │   ├── AuthGuard.tsx        # Client-side auth gate
│   │   │   ├── RoleGuard.tsx        # Client-side role gate
│   │   │   ├── AICourseGenerator.tsx# AI course generation UI
│   │   │   ├── Discussion.tsx       # Discussion thread component
│   │   │   ├── Quiz.tsx             # Quiz component
│   │   │   ├── CloudIDE.tsx         # Monaco editor wrapper
│   │   │   ├── EnhancedSocraticTutor.tsx
│   │   │   ├── ThemeInjector.tsx    # Institution white-label CSS injection
│   │   │   ├── ui/                  # Reusable UI primitives
│   │   │   │   ├── AICompanion.tsx  # Floating AI widget (global)
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   ├── HeroSlider.tsx
│   │   │   │   ├── KnowledgeGraph.tsx
│   │   │   │   ├── IRISProgressTracker.tsx
│   │   │   │   └── [20+ more UI components]
│   │   │   ├── classroom/           # AI Classroom sub-components
│   │   │   ├── dashboard/           # Dashboard sub-components
│   │   │   ├── instructor/          # Instructor tool sub-components
│   │   │   ├── course-editor/       # WYSIWYG editor components
│   │   │   ├── visual-editor/       # Puck visual editor integration
│   │   │   └── marketing/           # Marketing page components
│   │   ├── lib/                     # Client-side utilities + API clients
│   │   │   ├── AuthContext.tsx       # Auth state (Supabase + fallback JWT)
│   │   │   ├── SearchContext.tsx     # Global search state
│   │   │   ├── ToastContext.tsx      # Toast notification state
│   │   │   ├── supabase.ts          # Supabase JS client singleton
│   │   │   ├── cendikia-api.ts      # Typed fetch wrapper for backend API
│   │   │   ├── auth.ts              # Standalone login/register functions
│   │   │   ├── roles.ts             # RBAC route map + helper functions
│   │   │   ├── websocket.ts         # ClassroomWebSocket client class
│   │   │   ├── data.ts              # Static course/pathway data
│   │   │   ├── branding.ts          # BRAND + THEME constants
│   │   │   ├── design-system.ts     # Design tokens
│   │   │   └── articles.ts          # Static blog/article data
│   │   ├── contexts/                # Additional React contexts
│   │   │   └── SocraticContext.tsx  # IRIS Socratic tutor state
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useEnrollmentGuard.ts
│   │   │   ├── useIrisProject.ts
│   │   │   └── useTypewriter.ts
│   │   └── middleware.ts            # Next.js Edge middleware (RBAC)
│   ├── package.json
│   ├── Dockerfile
│   └── next-env.d.ts
│
├── .github/workflows/               # CI/CD pipelines
│   ├── ci.yml
│   ├── backend-ci.yml
│   ├── frontend-ci.yml
│   ├── deploy-staging.yml
│   └── deploy-production.yml
│
├── .claude/skills/                  # Claude Code skill definitions
├── .planning/codebase/              # Codebase map documents (this directory)
├── scripts/                         # Utility/migration scripts
├── blockchain/                      # Blockchain-related artifacts
├── PAPERS/                          # Research papers
├── docker-compose.yml               # Dev/staging Docker Compose
├── docker-compose.production.yml    # Production Docker Compose
├── Caddyfile                        # Caddy config (dev/staging)
├── Caddyfile.production             # Caddy config (production)
├── Makefile                         # Developer task runner
├── tsea.db                          # Root-level SQLite DB (some scripts use this)
└── [many .md / .py / .sql files]   # Historical docs, migration scripts, verify scripts
```

## Directory Purposes

**`backend/routers/`:**
- Purpose: FastAPI APIRouter modules — one file per domain
- Contains: Route handlers, Pydantic request/response models local to that domain
- Key files: `classroom.py` (WebSocket), `ai.py`, `courses.py`, `enrollments.py`

**`backend/services/`:**
- Purpose: Pure business logic, no FastAPI-specific code
- Contains: AI client management, grading rubrics, email sending, payment state
- Key file: `openai_service.py` (multi-provider AI abstraction)

**`frontend/src/app/`:**
- Purpose: Next.js App Router pages — each subdirectory is a route segment
- Contains: Server components and `'use client'` page components
- IRIS learning phases live under `frontend/src/app/courses/[id]/`

**`frontend/src/components/`:**
- Purpose: Reusable React components
- Contains: Feature components (top-level), UI primitives (`ui/`), feature-grouped sub-components

**`frontend/src/lib/`:**
- Purpose: Non-component utilities, API clients, contexts, constants
- Contains: `AuthContext.tsx` (auth), `cendikia-api.ts` (API client), `roles.ts` (RBAC), `websocket.ts` (WS)

## Key File Locations

**Entry Points:**
- `backend/main.py`: FastAPI app instantiation, router registration, startup hook
- `frontend/src/app/layout.tsx`: Root Next.js layout, provider tree
- `frontend/src/middleware.ts`: Edge RBAC middleware

**Configuration:**
- `backend/database.py`: DB URL resolution + SQLAlchemy engine setup
- `backend/.env.example`: All required backend env vars documented
- `frontend/.env.production.example`: All required frontend env vars documented
- `docker-compose.yml`: Service topology + env var injection

**Core Logic:**
- `backend/sql_models.py`: All SQLAlchemy ORM models (Users, Courses, Enrollments, etc.)
- `backend/services/openai_service.py`: AI provider waterfall abstraction
- `frontend/src/lib/cendikia-api.ts`: All typed backend API calls
- `frontend/src/lib/AuthContext.tsx`: Dual-path auth state management
- `frontend/src/lib/roles.ts`: RBAC route map (shared by middleware + client guards)

**AI Classroom:**
- `backend/routers/classroom.py`: WebSocket handler + session/memory persistence
- `frontend/src/lib/websocket.ts`: `ClassroomWebSocket` reconnect-aware client

## Naming Conventions

**Files (Frontend):**
- React components: PascalCase `.tsx` — `CourseCard.tsx`, `AuthGuard.tsx`
- Utilities/contexts: camelCase `.ts` / PascalCase `.tsx` — `cendikia-api.ts`, `AuthContext.tsx`
- Next.js pages: always `page.tsx` inside route directory

**Files (Backend):**
- Python modules: snake_case — `openai_service.py`, `auth_utils.py`
- Tests: `test_*.py` prefix for pytest discovery

**Directories:**
- Frontend: kebab-case for route segments — `cloud-ide/`, `institution-dashboard/`
- Backend: snake_case — `routers/`, `services/`, `seeds/`

## Where to Add New Code

**New API endpoint:**
- Create or extend a file in `backend/routers/`
- Register with `app.include_router(...)` in `backend/main.py`
- Add Pydantic models at top of router file (or in `backend/models.py` if shared)

**New database model:**
- Add SQLAlchemy class to `backend/sql_models.py`
- Call `models.Base.metadata.create_all(bind=engine)` (already called on startup in `main.py`)

**New frontend page:**
- Create directory under `frontend/src/app/` matching the URL path
- Add `page.tsx` (use `'use client'` directive if client-side state is needed)
- Public pages: add prefix to `PUBLIC_PREFIXES` in `frontend/src/lib/roles.ts`
- Protected pages: add entry to `ROUTE_ROLE_MAP` in `frontend/src/lib/roles.ts`

**New React component:**
- Shared/reusable UI primitive → `frontend/src/components/ui/`
- Feature-specific component → `frontend/src/components/` or feature subfolder

**New frontend API call:**
- Add typed method to `cendikiaApi` object in `frontend/src/lib/cendikia-api.ts`

**New AI service capability:**
- Add logic to `backend/services/openai_service.py` following the provider-waterfall pattern

**Tests (Backend):**
- Add `test_*.py` file to `backend/tests/`

## Special Directories

**`backend/app/`:**
- Purpose: Deprecated early scaffold; not wired to production
- Generated: No
- Committed: Yes (retained for reference only — do not add features here)

**`backend/.venv/`:**
- Purpose: Python virtual environment
- Generated: Yes (by `python -m venv .venv`)
- Committed: No (gitignored)

**`frontend/.next/`:**
- Purpose: Next.js build output
- Generated: Yes (`next build`)
- Committed: No (gitignored)

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents consumed by `/gsd-plan-phase` and `/gsd-execute-phase`
- Generated: Yes (by `/gsd-map-codebase`)
- Committed: Yes

**`PAPERS/`:**
- Purpose: Academic research papers informing platform design (CDIO, SFIA, SDG frameworks)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-24*
