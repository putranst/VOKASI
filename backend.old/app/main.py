"""
DEPRECATED — Do not use.
========================

This FastAPI app (`backend/app/main.py`, ASGI: `app.main:app`) was an early
scaffold with a separate in-memory auth service. It is NOT the production
entrypoint and is not wired into any deployment tooling.

The canonical application lives in `backend/main.py` (`main:app`).

This file is retained only so existing imports within `backend/app/*` still
resolve until that directory is removed. New features MUST NOT be added here.
"""

import warnings

warnings.warn(
    "backend/app/main.py is deprecated; use backend/main.py (main:app).",
    DeprecationWarning,
    stacklevel=2,
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
