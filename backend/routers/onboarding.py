"""
Onboarding Router
=================
Used by beta funnel onboarding wizard.

PUT /api/v1/users/{user_id}/profile  — update profile and onboarding fields
GET /api/v1/users/{user_id}/profile  — fetch onboarding-related profile fields
"""

from __future__ import annotations

from datetime import datetime
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import sql_models as models
from database import get_db
from routers.auth_utils import require_self_or_admin, resolve_auth_context
from services.email_service import send_transactional_email

router = APIRouter(prefix="/api/v1", tags=["onboarding"])
_FF_EMAIL_EVENTS = os.getenv("FF_EMAIL_EVENTS", "true").lower() != "false"


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    learning_goals: Optional[List[str]] = None
    onboarding_completed: Optional[bool] = None
    onboarding_phase: Optional[str] = None


class UserProfileOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    name: Optional[str]
    bio: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    learning_goals: Optional[List[str]]
    onboarding_completed: bool
    onboarding_prepay_completed: bool
    onboarding_postpay_completed: bool
    onboarding_phase: Optional[str]
    funnel_status: Optional[str]

    class Config:
        from_attributes = True


@router.get("/users/{user_id}/profile", response_model=UserProfileOut)
def get_user_profile(
    user_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}/profile", response_model=UserProfileOut)
def update_user_profile(
    user_id: int,
    payload: UserProfileUpdate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
        # Keep alias in sync for backward compatibility
        user.name = payload.full_name
    if payload.name is not None:
        user.name = payload.name
        if not user.full_name:
            user.full_name = payload.name
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.linkedin_url is not None:
        user.linkedin_url = payload.linkedin_url
    if payload.github_url is not None:
        user.github_url = payload.github_url
    if payload.learning_goals is not None:
        user.learning_goals = payload.learning_goals
    if payload.onboarding_completed is not None:
        user.onboarding_completed = payload.onboarding_completed
    if payload.onboarding_phase is not None:
        user.onboarding_phase = payload.onboarding_phase
        if payload.onboarding_phase == "prepay_complete":
            user.onboarding_prepay_completed = True
            user.funnel_status = "payment_pending"
        if payload.onboarding_phase == "postpay_complete":
            user.onboarding_postpay_completed = True
            user.onboarding_completed = True
            user.funnel_status = "active"
    if user.onboarding_phase is None:
        user.onboarding_phase = "none"

    db.commit()
    db.refresh(user)
    return user


class PostpayOnboardingCompleteRequest(BaseModel):
    user_id: int
    consent_completed: bool = True


@router.post("/onboarding/postpay/complete")
def complete_postpay_onboarding(
    payload: PostpayOnboardingCompleteRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    auth = resolve_auth_context(authorization, db)
    require_self_or_admin(auth, payload.user_id)
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    has_paid = db.query(models.Enrollment.id).filter(
        models.Enrollment.user_id == payload.user_id,
        models.Enrollment.payment_status == "paid",
        models.Enrollment.status == "active",
    ).first()
    if not has_paid:
        raise HTTPException(status_code=409, detail="Payment must be confirmed before post-payment onboarding")
    user.onboarding_phase = "postpay_complete"
    user.onboarding_postpay_completed = True
    user.onboarding_completed = True
    user.funnel_status = "active"
    db.commit()
    if _FF_EMAIL_EVENTS:
        try:
            send_transactional_email(
                db,
                template_key="onboarding_completed",
                to_email=user.email,
                context={"full_name": user.full_name or user.name or "Learner"},
            )
        except Exception:
            pass
    return {"status": "ok"}
