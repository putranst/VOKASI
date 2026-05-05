"""
Alumni Network Router
=====================
Beta funnel: authenticated alumni wall.

GET  /api/v1/alumni                        — list visible alumni (authenticated graduates)
GET  /api/v1/alumni/{user_id}              — single profile
PUT  /api/v1/alumni/{user_id}              — update own profile (self only)
POST /api/v1/alumni/{user_id}/visibility   — toggle visibility
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import sql_models as models
from database import get_db
from routers.auth_utils import require_self_or_admin, resolve_auth_context

logger = logging.getLogger("alumni")
router = APIRouter(prefix="/api/v1", tags=["alumni"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class AlumniProfileOut(BaseModel):
    id: int
    user_id: int
    cohort_id: Optional[int]
    display_name: str
    headline: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    skills: list
    capstone_title: Optional[str]
    capstone_url: Optional[str]
    cert_code: Optional[str]
    is_visible: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlumniProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/alumni", response_model=List[AlumniProfileOut])
def list_alumni(
    cohort_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """List visible alumni profiles. Requires authentication (any active user)."""
    resolve_auth_context(authorization, db)

    query = db.query(models.AlumniProfile).filter(models.AlumniProfile.is_visible == True)
    if cohort_id:
        query = query.filter(models.AlumniProfile.cohort_id == cohort_id)
    return query.order_by(models.AlumniProfile.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/alumni/{user_id}", response_model=AlumniProfileOut)
def get_alumni_profile(
    user_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)

    profile = db.query(models.AlumniProfile).filter(
        models.AlumniProfile.user_id == user_id,
        models.AlumniProfile.is_visible == True,
    ).first()
    if not profile and auth.user_id == user_id:
        profile = db.query(models.AlumniProfile).filter(
            models.AlumniProfile.user_id == user_id,
        ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    return profile


@router.put("/alumni/{user_id}", response_model=AlumniProfileOut)
def update_alumni_profile(
    user_id: int,
    payload: AlumniProfileUpdate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, user_id)

    profile = db.query(models.AlumniProfile).filter(
        models.AlumniProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found")

    if payload.display_name is not None:
        profile.display_name = payload.display_name
    if payload.headline is not None:
        profile.headline = payload.headline
    if payload.avatar_url is not None:
        profile.avatar_url = payload.avatar_url
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.linkedin_url is not None:
        profile.linkedin_url = payload.linkedin_url
    if payload.github_url is not None:
        profile.github_url = payload.github_url
    if payload.portfolio_url is not None:
        profile.portfolio_url = payload.portfolio_url
    if payload.skills is not None:
        profile.skills = payload.skills

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/alumni/{user_id}/visibility")
def toggle_visibility(
    user_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, user_id)

    profile = db.query(models.AlumniProfile).filter(
        models.AlumniProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    profile.is_visible = not profile.is_visible
    profile.updated_at = datetime.utcnow()
    db.commit()
    return {"is_visible": profile.is_visible}
