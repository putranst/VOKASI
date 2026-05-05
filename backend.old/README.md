# Backend

FastAPI backend scaffold for VOKASI.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

You can copy `backend/.env.example` to `.env` before running.

## Run

The canonical FastAPI entrypoint is `backend/main.py` (ASGI: `main:app`).

```bash
uvicorn main:app --reload --port 8000
```

> Note: `backend/app/*` is a deprecated scaffold retained only for reference.
> Do not add new features there; see `backend/main.py` top-of-file docstring.

## Docker Run

From repo root:

```bash
docker compose up --build backend
```

## Available Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`

Demo credentials:

- `student@vokasi.dev` / `student123`
- `instructor@vokasi.dev` / `instructor123`
