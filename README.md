# VOKASI

Starter monorepo for building the VOKASI vocational learning platform.

## Repository Scope

This repository is intentionally a focused starter project. It is separate from the larger `CENDIKIA-MAIC` workspace.

Current tracked structure:

- `frontend/` - Next.js app shell + auth flow starter
- `backend/` - FastAPI API starter (health, auth, users)
- `docs/` - architecture notes
- `docker-compose.yml` - one-command local stack startup

## Fresh Machine Setup

```bash
git clone https://github.com/putranst/VOKASI.git
cd VOKASI
```

## Option A: Docker Compose (Recommended)

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Operations Shortcuts

### Windows PowerShell

```bash
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 setup
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 up
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 health
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 logs
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1 down
```

### Makefile (macOS/Linux/WSL)

```bash
make setup
make up
make health
make logs
make down
```

## Option B: Run Services Manually

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
```

## Environment

- Backend template: `backend/.env.example`
- Frontend template: `frontend/.env.example`

## API Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me` (requires `Authorization: Bearer <token>`)

Demo credentials:

- `student@vokasi.dev` / `student123`
- `instructor@vokasi.dev` / `instructor123`
