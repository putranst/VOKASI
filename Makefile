.RECIPEPREFIX := >

.PHONY: help setup setup-backend setup-frontend up down logs health dev-backend dev-frontend

help:
>echo "Available targets:"
>echo "  make setup          - install backend and frontend dependencies"
>echo "  make up             - start full stack with docker compose"
>echo "  make down           - stop docker compose stack"
>echo "  make logs           - tail docker compose logs"
>echo "  make health         - check backend health endpoint"
>echo "  make dev-backend    - run backend in reload mode"
>echo "  make dev-frontend   - run frontend dev server"

setup: setup-backend setup-frontend

setup-backend:
>python -m venv backend/.venv
>backend/.venv/bin/pip install -r backend/requirements.txt

setup-frontend:
>cd frontend && npm install

up:
>docker compose up --build

down:
>docker compose down

logs:
>docker compose logs -f

health:
>curl -fsS http://localhost:8000/api/v1/health || true

dev-backend:
>cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
>cd frontend && npm run dev
