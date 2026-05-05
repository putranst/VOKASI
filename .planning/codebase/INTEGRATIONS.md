# External Integrations

**Analysis Date:** 2026-04-24

## APIs & External Services

**AI Providers (backend — `backend/services/openai_service.py`):**
- OpenAI (GPT-3.5-turbo / GPT-4) — Course content generation, AI grading, embeddings, text assist
  - SDK: `openai` 1.54.4 (`AsyncOpenAI`)
  - Auth: `OPENAI_API_KEY` env var
  - Model override: `OPENAI_MODEL` env var (default `gpt-3.5-turbo`)
- Google Gemini (gemini-2.0-flash) — Primary AI fallback; also used in NASKA PKC
  - SDK: `google-generativeai` 0.8.3
  - Auth: `GEMINI_API_KEY` env var
- OpenRouter — Third AI fallback, uses OpenAI-compatible API at `https://openrouter.ai`
  - SDK: `openai.AsyncOpenAI` with custom `base_url`
  - Auth: `OPENROUTER_API_KEY` env var
  - Default model: `google/gemma-4-31b-it:free` (configurable via `OPENROUTER_MODEL`)
- Provider priority order: `openai → openrouter → gemini → mock` (waterfall, auto-fallback)

**AI Orchestration — NASKA (`backend/services/naska_service.py`):**
- LlamaIndex — RAG / vector retrieval for Personal Knowledge Container (PKC)
  - Deps optional (`HAS_DEPS` guard); falls back gracefully if not installed
  - Uses `PGVectorStore` backed by PostgreSQL + pgvector

## Data Storage

**Databases:**
- SQLite — Local development default
  - File: `backend/tsea.db` (or `backend/sql_app_v3.db`)
  - Connection: automatic when `DATABASE_URL` not set
  - Client: SQLAlchemy 2.0 (`backend/database.py`)
- PostgreSQL — Production database
  - Connection: `DATABASE_URL` env var (`postgresql://...`)
  - Client: SQLAlchemy 2.0 + `psycopg2-binary`
  - Extension: `pgvector` for 1536-dim embedding storage (`backend/sql_models.py`)
  - Pool: `pool_size=20`, `max_overflow=30`, `pool_recycle=300`

**File Storage:**
- Local filesystem only (uploaded files saved to temp paths in `backend/`)
- No S3 / object storage integration detected

**Caching:**
- None detected (no Redis or Memcached integration)

## Authentication & Identity

**Primary Auth — Supabase:**
- Frontend: `@supabase/supabase-js` client at `frontend/src/lib/supabase.ts`
- Supabase handles: email/password login, OAuth (Google, GitHub), session management
- Post-Supabase login: frontend calls `POST /api/v1/auth/sync-user` to upsert user into backend DB (`frontend/src/lib/AuthContext.tsx`)
- Auth env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- WebSocket auth: JWT from Supabase verified via `SUPABASE_JWT_SECRET` on `/ws/classroom/{id}?token=...` (`backend/routers/classroom.py`)

**Fallback Auth — Backend JWT:**
- For demo/offline mode: `POST /api/v1/auth/register` + `POST /api/v1/auth/login`
- JWT created with `python-jose` HS256 (`backend/routers/auth_utils.py`)
- Secret: `JWT_SECRET_KEY` env var (default `dev-secret-change-in-production`)
- Token expiry: 24 hours
- Stored client-side: `localStorage` (`vokasi_access_token`, `vokasi_user` keys)

**Session Cookies (RBAC):**
- On login, frontend sets `vokasi_role` and `vokasi_auth` cookies (7-day expiry)
- Next.js Edge Middleware reads these cookies for route-level RBAC (`frontend/src/middleware.ts`)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, or similar integration detected)

**Logs:**
- Python `logging` module used in backend services (`logger = logging.getLogger(...)`)
- Console `print()` statements used in dev/debug paths (`backend/main.py`, startup event)
- No structured logging or log aggregation platform

**Health Checks:**
- `GET /api/health` and `GET /api/v1/health` (rate-limited 60/min) on backend
- Docker health check: `curl -f http://localhost:8000/api/health` every 30s

## Payments

**Midtrans (Indonesia payment gateway):**
- Referenced in frontend env vars: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_ENV`
- Backend `payment_service.py` handles order state and payment expiry logic
- `PaymentEvent` model tracks Midtrans webhook events (`backend/sql_models.py`)
- Integration appears partially implemented (client key present, no Midtrans SDK in `requirements.txt`)

## CI/CD & Deployment

**Hosting:**
- Docker Compose with Caddy reverse proxy
- Documented targets: AWS EC2, Vultr VPS (deploy scripts at root)

**CI Pipeline:**
- GitHub Actions — `.github/workflows/`
  - `ci.yml` — General CI
  - `backend-ci.yml` — Backend-specific CI
  - `frontend-ci.yml` — Frontend-specific CI
  - `deploy-staging.yml` — Staging deployment
  - `deploy-production.yml` — Production deployment

## WebSocket (Real-time AI Classroom)

**Endpoint:** `ws://backend:8000/ws/classroom/{session_id}?token={jwt}`

**Frontend client:** `frontend/src/lib/websocket.ts` (`ClassroomWebSocket` class)
- Reconnect with exponential back-off (max 5 attempts, up to 30s delay)
- Keep-alive ping every 30s
- Message protocol: typed JSON frames (`agent_message`, `confusion_detected`, `memory_updated`, `turn_complete`, `session_ended`, `error`)

**Backend handler:** `backend/routers/classroom.py`
- Multi-agent AI roles: `teacher`, `classmate`, `ta`
- Session + memory facts persisted to DB (`classroom_sessions`, `classroom_memory_facts` tables)

## Blockchain / Credentials

**Blockchain (Simulated):**
- `backend/services/blockchain_service.py` — Simulates Soulbound Token (SBT) minting on Polygon
- No real Web3/Ethereum library installed (`web3` import commented out)
- Returns mock transaction hashes; referenced URL: `https://mumbai.polygonscan.com/tx/...`

## Email

**Provider:** SMTP (configurable) with Noop fallback
- `backend/services/email_service.py`
- Default provider: `noop` (logs to console, no actual send)
- SMTP configured via env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`

## Environment Configuration

**Required env vars (production):**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET_KEY` — Backend JWT signing secret
- `SUPABASE_JWT_SECRET` — For WebSocket token verification
- `OPENAI_API_KEY` or `GEMINI_API_KEY` or `OPENROUTER_API_KEY` — At least one AI provider
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Frontend Supabase client
- `NEXT_PUBLIC_BACKEND_URL` — Frontend → backend API base URL
- `CORS_ORIGINS` — Comma-separated allowed origins

**Secrets location:**
- Backend: `backend/.env` (gitignored)
- Frontend: `.env.local` (gitignored); injected as build args in `docker-compose.yml`
- Examples: `backend/.env.example`, `frontend/.env.production.example`

## Webhooks & Callbacks

**Incoming:**
- Midtrans payment webhooks — handled by backend payment endpoints (partial implementation)
- Supabase auth callbacks — OAuth redirect to frontend `/api/auth/callback` (handled by Supabase JS SDK)

**Outgoing:**
- None detected

---

*Integration audit: 2026-04-24*
