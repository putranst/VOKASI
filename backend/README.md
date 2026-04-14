# Backend

FastAPI backend scaffold for VOKASI.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Available Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`

Demo credentials:

- `student@vokasi.dev` / `student123`
- `instructor@vokasi.dev` / `instructor123`
