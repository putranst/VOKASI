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

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.local.example` -> `frontend/.env.local`
