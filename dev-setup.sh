#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "${ROOT_DIR}/backend" ]]; then
  echo "backend/ directory not found"
  exit 1
fi

if [[ ! -d "${ROOT_DIR}/frontend" ]]; then
  echo "frontend/ directory not found"
  exit 1
fi

echo "Setting up backend..."
python3 -m venv "${ROOT_DIR}/backend/.venv"
"${ROOT_DIR}/backend/.venv/bin/python" -m pip install --upgrade pip
"${ROOT_DIR}/backend/.venv/bin/pip" install -r "${ROOT_DIR}/backend/requirements.txt"

if [[ ! -f "${ROOT_DIR}/backend/.env" ]]; then
  cp "${ROOT_DIR}/backend/.env.example" "${ROOT_DIR}/backend/.env"
fi

echo "Setting up frontend..."
if [[ -f "${ROOT_DIR}/frontend/package-lock.json" ]]; then
  (cd "${ROOT_DIR}/frontend" && npm ci)
else
  (cd "${ROOT_DIR}/frontend" && npm install)
fi

if [[ ! -f "${ROOT_DIR}/frontend/.env.local" ]]; then
  cp "${ROOT_DIR}/frontend/.env.local.example" "${ROOT_DIR}/frontend/.env.local"
fi

echo "Done."
