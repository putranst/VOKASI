# VOKASI Platform

VOKASI is the rebranded, history-preserving evolution of the CENDIKIA-MAIC platform.

## Baseline

- Full modules and services are migrated from CENDIKIA-MAIC.
- Git history is preserved.
- API and database compatibility remain the initial priority.
- Rebranding and enterprise hardening continue incrementally.

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker and Docker Compose

### Windows

```powershell
.\dev-setup.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 up
```

### macOS/Linux/WSL

```bash
make setup
make up
```

### Manual Run

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

App URLs:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## CI/CD Default Path

Enterprise-ready default pipeline:

1. GitHub Actions CI (`backend-ci.yml`, `frontend-ci.yml`)
2. GitHub Actions build/push to GHCR (`deploy-staging.yml`, `deploy-production.yml`)
3. Deployment via Docker Compose on target instance

This path is the easiest to maintain while continuously upgrading and hardening VOKASI.

Optional SSH deploy jobs in workflows require these repository secrets:

- `VOKASI_PROD_SSH_HOST`, `VOKASI_PROD_SSH_USER`, `VOKASI_PROD_SSH_KEY`, `VOKASI_PROD_APP_DIR`
- `VOKASI_STG_SSH_HOST`, `VOKASI_STG_SSH_USER`, `VOKASI_STG_SSH_KEY`, `VOKASI_STG_APP_DIR`

## Structure

- `backend/`: FastAPI services and modules
- `frontend/`: Next.js application
- `.github/workflows/`: CI/CD workflows
- `docker-compose.production.yml`: production orchestration
- `scripts/`: operational scripts

## Environment

Copy templates before running:

- `.env.example` → `.env` (root, used by docker-compose)
- `backend/.env.example` → `backend/.env`
- `frontend/.env.production.example` → `frontend/.env.production`

## Pilot Deployment (Phase 5)

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY, VOKASI_DOMAIN
```

### 2. Seed pilot institutions

```bash
python scripts/seed_pilot_institutions.py
```

### 3. Deploy with Docker Compose

```bash
# Development / staging (HTTP)
docker compose up -d

# Production (HTTPS via Caddy — requires VOKASI_DOMAIN DNS to point at this server)
VOKASI_DOMAIN=vokasi.yourschool.id docker compose -f docker-compose.production.yml up -d
```

### 4. Configure institution branding

Log in at `/admin` with `admin@vokasi.id`, open the **Branding** tab, and set colors, logo, and platform name per institution.

### Key URLs

| Service | URL |
|---|---|
| Platform | `https://VOKASI_DOMAIN/` |
| API docs | `https://VOKASI_DOMAIN/api/docs` |
| Admin | `https://VOKASI_DOMAIN/admin` |
| Institution dashboard | `https://VOKASI_DOMAIN/institution-dashboard` |

## Beta Scholarship Campaign (1000 seats)

### Funnel

`/beasiswa` → `/register` → `/onboarding` (pick any 2 courses) → `/payment/beasiswa` (Midtrans) → learning → `/capstone` → certificate → `/alumni`

### Dynamic pricing (temporary campaign)

| Seat index | Price |
|---|---|
| 1–100 | $1 |
| 101–200 | $2 |
| 201–300 | $3 |
| 301–400 | $4 |
| 401–500 | $5 |
| 501–600 | $6 |
| 601–700 | $7 |
| 701–800 | $8 |
| 801–900 | $9 |
| 901–1000 | $10 |

### Required env vars (beta payment)

Add these to root `.env` and rebuild frontend:

```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_ENV=sandbox

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
NEXT_PUBLIC_MIDTRANS_ENV=sandbox

IDR_RATE=16000
FRONTEND_URL=https://vokasi.yourschool.id
```

### Initialize beta campaign in DB

Run these once after pulling the beta-funnel changes:

```bash
python scripts/migrate_beta_funnel.py
python scripts/seed_beta_cohort.py
```

### One-command API smoke test (beta funnel)

With backend running locally on port `8001`:

```bash
python scripts/smoke_beta_funnel.py
```

Override API base if needed:

```bash
API_BASE=http://127.0.0.1:8000 python scripts/smoke_beta_funnel.py
```

### Notes

- Seat count (`seats_sold`) is incremented when Midtrans payment webhook is confirmed.
- Beta tier is decoupled from full IRIS/CDIO project cycle; final assessment uses simplified capstone approval flow.
- Learners get certificates only after instructor capstone approval.
