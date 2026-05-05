# Architecture

**Analysis Date:** 2026-04-24

## Pattern Overview

**Overall:** Decoupled full-stack monorepo — Next.js App Router frontend + FastAPI backend + Caddy reverse proxy, containerized with Docker Compose.

**Key Characteristics:**
- Frontend and backend are independently deployable services in separate directories
- Backend exposes a REST + WebSocket API; frontend consumes it via typed client modules
- Auth is dual-path: Supabase (OAuth + JWT) for production, fallback backend JWT for demo/offline mode
- AI is accessed through a provider-waterfall abstraction (OpenAI → OpenRouter → Gemini → Mock)
- Database is hybrid: SQLite for local dev, PostgreSQL + pgvector for production

## Layers

**Reverse Proxy:**
- Purpose: TLS termination, route dispatch (`/api/*` → backend, `/*` → frontend)
- Location: `Caddyfile`, `Caddyfile.production`
- Contains: Caddy config, gzip, security headers
- Used by: All incoming traffic (port 80/443)

**Frontend — Next.js App Router:**
- Purpose: Server-side rendered pages, client components, auth state, UI
- Location: `frontend/src/`
- Contains: Pages (App Router), React components, context providers, API client libs, WebSocket client
- Depends on: Backend API (`NEXT_PUBLIC_BACKEND_URL`), Supabase JS SDK
- Used by: End users via browser

**Backend — FastAPI:**
- Purpose: Business logic, data persistence, AI orchestration, WebSocket sessions
- Location: `backend/main.py` (canonical entrypoint), `backend/routers/`, `backend/services/`
- Contains: REST endpoints, WebSocket handler, SQLAlchemy models, AI service clients
- Depends on: PostgreSQL/SQLite, OpenAI/Gemini/OpenRouter APIs, Supabase JWT secret

**Database Layer:**
- Purpose: Persistent storage for users, courses, enrollments, AI sessions
- Location: `backend/database.py`, `backend/sql_models.py`
- Contains: SQLAlchemy engine + session factory, ORM models, pgvector embedding columns
- Used by: All FastAPI routers via `get_db()` dependency injection

**Service Layer (Backend):**
- Purpose: Encapsulate complex logic (AI calls, grading, seeding, email, payments)
- Location: `backend/services/`
- Contains: `openai_service.py`, `grading_service.py`, `seeding_service.py`, `email_service.py`, `payment_service.py`, `blockchain_service.py`, `naska_service.py`
- Used by: FastAPI routers

## Data Flow

**Student Login (Supabase path):**
1. Browser → Supabase JS SDK (`supabase.auth.signInWithPassword`)
2. Supabase returns session with JWT
3. Frontend calls `POST /api/v1/auth/sync-user` with `supabase_id`, `email`, `full_name`, `role`
4. Backend upserts user into `users` table, returns backend user object
5. Frontend stores user in `localStorage` + sets `vokasi_role` cookie
6. Next.js Edge Middleware reads cookie on subsequent navigations for RBAC

**Course Learning (REST path):**
1. Browser loads `frontend/src/app/courses/[id]/learn/page.tsx`
2. Page fetches `GET /api/v1/courses/{id}` via `cendikia-api.ts`
3. FastAPI reads from `courses` / `course_modules` tables
4. Content blocks rendered by `BlockRenderer` component

**AI Classroom (WebSocket path):**
1. Frontend calls `POST /api/v1/sessions` or `POST /api/v1/classroom/sessions` to create session
2. Frontend opens WebSocket: `ws://backend/ws/classroom/{session_id}?token={jwt}`
3. `ClassroomWebSocket` class (`frontend/src/lib/websocket.ts`) handles frames
4. Backend classroom router (`backend/routers/classroom.py`) verifies JWT, routes messages to AI provider
5. AI responses streamed back as typed JSON frames: `agent_message`, `confusion_detected`, etc.
6. Memory facts persisted to `classroom_memory_facts` table after each turn

**AI Provider Selection:**
1. Backend `openai_service.py` maintains `clients` dict and `PRIORITY` list
2. Each AI call iterates `PRIORITY = ["openai", "openrouter", "gemini", "mock"]`
3. First available/responding client is used; falls back on error

**State Management:**
- Server state: `@tanstack/react-query` (data fetching + caching)
- Auth state: `AuthContext` React context (`frontend/src/lib/AuthContext.tsx`)
- Search state: `SearchContext` (`frontend/src/lib/SearchContext.tsx`)
- Toast/notifications: `ToastContext` (`frontend/src/lib/ToastContext.tsx`)
- Socratic tutor sidebar: `SocraticContext` (`frontend/src/contexts/SocraticContext.tsx`)
- Zustand installed but minimal active use detected

## Key Abstractions

**AI Provider Abstraction:**
- Purpose: Decouple AI calls from specific vendors; enable graceful degradation
- Location: `backend/services/openai_service.py`
- Pattern: `clients` dict + `PRIORITY` list waterfall; `mock` provider always last

**cendikia-api.ts Client:**
- Purpose: Typed fetch wrapper for all backend endpoints with fallback URL retry
- Location: `frontend/src/lib/cendikia-api.ts`
- Pattern: `apiFetch<T>()` wrapper with primary URL + fallback candidates; throws typed `ApiError`

**RBAC System (AM-002):**
- Purpose: Route-level access control enforced at Edge before page render
- Pattern: `matchRouteRule()` + `roleAllowed()` in `frontend/src/lib/roles.ts`; applied in `frontend/src/middleware.ts`
- Roles: `student | instructor | institution_admin | admin`
- Cookie-based at Edge, Context-based client-side

**SQLAlchemy ORM Models:**
- Purpose: Single source of truth for database schema
- Location: `backend/sql_models.py`
- Pattern: `declarative_base()` from `database.py`; pgvector columns conditional on DB type

**Mock DB (`backend/mock_db.py`):**
- Purpose: In-memory data for features not yet migrated to SQLAlchemy (quizzes, discussions, notifications, credentials)
- Pattern: Python dicts + `IDCounter` class; populated by `seeding_service.py` on startup

## Entry Points

**Backend:**
- Location: `backend/main.py`
- Triggers: `uvicorn main:app --reload --port 8000` (dev) or Docker CMD
- Responsibilities: Create DB tables, run funnel migrations, configure CORS + rate limiting, register all routers, initialize sample data on startup

**Frontend:**
- Location: `frontend/src/app/layout.tsx`
- Triggers: Next.js routing
- Responsibilities: Wrap all pages in `<Providers>` (Auth, Search, Toast, Socratic), render `<ThemeInjector>`, global `<AICompanion>` widget

**Next.js Edge Middleware:**
- Location: `frontend/src/middleware.ts`
- Triggers: Every non-static request before page render
- Responsibilities: RBAC check via cookies; redirect unauthenticated users to `/login`, wrong-role users to `/403`

## Error Handling

**Strategy:** Fail-forward with fallback at every layer

**Patterns:**
- Backend AI calls: iterate provider list, catch exceptions, try next provider; `mock` provider always succeeds
- Frontend API calls: `apiFetch` iterates `API_BASE_CANDIDATES` on network error; throws typed `ApiError` on HTTP errors
- WebSocket reconnect: exponential back-off (max 5 attempts, 30s cap)
- Auth init: any failure → `setLoading(false)`, user stays unauthenticated (no crash)
- Backend startup: sample data init failure is warned, not fatal (`try/except` in `startup_event`)

## Cross-Cutting Concerns

**Logging:**
- Backend: Python `logging.getLogger(module_name)` in services; `print()` in main for debug
- No structured log format; no log aggregation

**Validation:**
- Backend: Pydantic v2 models on all request/response bodies
- Frontend: Inline checks before API calls; TypeScript types enforce shape at compile time

**Authentication:**
- Edge layer: Cookie RBAC in `frontend/src/middleware.ts`
- Client layer: `AuthContext` + `AuthGuard` / `RoleGuard` / `RoleRouteGuard` components
- Backend layer: `verify_token()` in `routers/auth_utils.py` used as FastAPI dependency

**White-label Theming:**
- Institution-level theming: `primary_color`, `accent_color`, `platform_name` fields on `Institution` model
- Applied via `ThemeInjector` component and `branding.ts` module
- Defined in `frontend/src/app/globals.css` as CSS custom properties

---

*Architecture analysis: 2026-04-24*
