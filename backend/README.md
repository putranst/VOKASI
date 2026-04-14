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

Health endpoint: `GET /health`.
