# VOKASI

Starter monorepo for building the VOKASI vocational learning platform.

## Structure

- `frontend/` - Next.js web app scaffold
- `backend/` - FastAPI service scaffold
- `docs/` - architecture and planning notes

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check: `http://localhost:8000/health`.

## Next Steps

- Add shared environment strategy (`.env` management)
- Add API routing modules and domain models
- Add CI for linting, tests, and build checks
