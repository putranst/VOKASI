# Technology Stack

**Analysis Date:** 2026-04-24

## Languages

**Primary:**
- TypeScript 5.x — Frontend (all `frontend/src/` files: `.ts`, `.tsx`)
- Python 3.12 — Backend (`backend/` directory, confirmed by `.venv/lib/python3.12`)

**Secondary:**
- CSS (Tailwind v4 via PostCSS) — `frontend/src/app/globals.css`
- SQL — seed files (`dual_instructor_data.sql`, `supabase_schema.sql`, etc.) in project root

## Runtime

**Environment:**
- Node.js 20.x (inferred from `@types/node: ^20` in `frontend/package.json`)
- Python 3.12 (virtualenv at `backend/.venv/`)

**Package Manager:**
- npm (frontend) — `frontend/package-lock.json` present
- pip / venv (backend) — `backend/.venv/` + `backend/requirements.txt`

## Frameworks

**Core:**
- Next.js 16.0.7 — App Router, SSR/RSC frontend (`frontend/`)
- FastAPI 0.115.0 — Async REST + WebSocket backend (`backend/main.py`)
- Uvicorn 0.30.6 — ASGI server (`uvicorn main:app --reload --port 8000`)

**Testing:**
- Jest 30.x + `jest-environment-jsdom` — Frontend (`frontend/package.json`)
- pytest — Backend (`backend/tests/`)
- @testing-library/react 16.x — React component testing

**Build/Dev:**
- Tailwind CSS 4.x — Utility CSS via `@tailwindcss/postcss`
- ESLint 9.x — Frontend linting (`eslint-config-next`)
- Docker + Docker Compose — Multi-container orchestration
- Caddy (alpine) — Reverse proxy with automatic HTTPS

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.86.x — Auth provider + optional real-time DB (`frontend/src/lib/supabase.ts`)
- `openai` 1.54.4 — GPT model API client (`backend/services/openai_service.py`)
- `google-generativeai` 0.8.3 — Gemini API client (`backend/services/openai_service.py`)
- `SQLAlchemy` 2.0.35 — ORM layer (`backend/database.py`, `backend/sql_models.py`)
- `python-jose[cryptography]` 3.3.0 — JWT creation/validation (`backend/routers/auth_utils.py`)
- `passlib[bcrypt]` 1.7.4 — Password hashing (`backend/routers/auth_utils.py`)
- `slowapi` — Rate limiting middleware (`backend/main.py`)

**Infrastructure:**
- `psycopg2-binary` 2.9.9 — PostgreSQL driver
- `pgvector` 0.3.6 — Vector embeddings extension for PostgreSQL (`backend/sql_models.py`)
- `python-multipart` 0.0.12 — File upload support
- `pypdf` 5.0.1 + `python-pptx` 1.0.2 + `Pillow` 10.4.0 — Document/image parsing for AI ingestion

**Frontend UI:**
- React 19.2.0 + react-dom 19.2.0
- `framer-motion` 12.x — Animations
- `lucide-react` 0.554.x — Icons
- `@tiptap/react` 3.22.x — Rich text editor
- `@monaco-editor/react` 4.7.x — Code editor (Cloud IDE)
- `@tanstack/react-query` 5.99.x — Server state management
- `zustand` 5.0.x — Client state management (installed, minimal use detected)
- `react-force-graph-2d` 1.29.x — Knowledge graph visualization
- `canvas-confetti` 1.9.x — Celebratory animations on milestones

## Configuration

**Environment (Backend):**
- `backend/.env` (copied from `backend/.env.example`)
- Key vars: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `DATABASE_URL`, `JWT_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`, `CLASSROOM_AUTH_MODE`
- Default dev DB: `sqlite:///./tsea.db` (auto-fallback when `DATABASE_URL` not set)

**Environment (Frontend):**
- `.env.local` / build-time args in `docker-compose.yml`
- Key vars: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_WS_URL`

**Build:**
- `frontend/` builds with `next build` (outputs to `.next/`)
- `backend/Dockerfile` → `CMD ["uvicorn", "main:app", ...]`
- Root `Makefile` defines `dev`, `dev-backend`, `dev-frontend`, `test`, `docker-build`, `docker-up`

## Platform Requirements

**Development:**
- Python 3.12 + virtualenv at `backend/.venv/`
- Node.js 20.x + npm
- SQLite (zero-config local dev DB at `backend/tsea.db`)
- Optional: PostgreSQL with pgvector for production-equivalent local dev

**Production:**
- PostgreSQL (with `pgvector` extension) — required; SQLite blocked when `ENV=production`
- Caddy as reverse proxy (TLS via Let's Encrypt when domain set)
- Docker Compose (3 services: `backend`, `frontend`, `caddy`)
- Supabase project recommended for OAuth and JWT secret

---

*Stack analysis: 2026-04-24*
