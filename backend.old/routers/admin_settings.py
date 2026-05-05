"""
Admin Settings — Encrypted API Key Management
============================================

Allows admin users to store and rotate AI provider API keys in the database,
encrypted at rest with Fernet.  Keys are never returned in full to the frontend;
only a masked preview is exposed.

Endpoints
---------
GET  /api/v1/admin/settings/api-keys          -> list slots (masked)
GET  /api/v1/admin/settings/api-keys/{name}    -> single slot (masked)
PUT  /api/v1/admin/settings/api-keys/{name}    -> create / update
DELETE /api/v1/admin/settings/api-keys/{name}  -> remove
POST /api/v1/admin/settings/api-keys/reload    -> reinit provider clients
GET  /api/v1/admin/settings/provider-status    -> alias of /api/v1/ai/provider-status
"""

from __future__ import annotations

import base64
import json
import logging
import os
import time
from datetime import datetime
from typing import Dict, List, Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from routers.classroom import _decode_jwt as _jwt_decode  # reuse safe decoder
from services.openai_service import reload_clients
from services.email_service import build_provider, load_email_config

logger = logging.getLogger("admin_settings")
router = APIRouter(tags=["admin settings"])

# ---------------------------------------------------------------------------
# Encryption
# ---------------------------------------------------------------------------

_ADMIN_KEY_ENV = "ADMIN_CONFIG_ENCRYPTION_KEY"
_ADMIN_KEY_PATH = os.path.join(
    os.path.dirname(__file__), "..", ".admin_secret.key"
)


def _resolve_fernet_key() -> bytes:
    """Return a valid Fernet key (32 bytes, URL-safe base64)."""
    env = os.getenv(_ADMIN_KEY_ENV)
    if env:
        try:
            # validate format
            decoded = base64.urlsafe_b64decode(env.encode())
            if len(decoded) == 32:
                return env.encode()
        except Exception:  # noqa: BLE001
            pass
        logger.warning("ADMIN_CONFIG_ENCRYPTION_KEY is set but not a valid Fernet key; ignoring")

    if os.path.exists(_ADMIN_KEY_PATH):
        with open(_ADMIN_KEY_PATH, "rb") as fh:
            return fh.read().strip()

    key = Fernet.generate_key()
    with open(_ADMIN_KEY_PATH, "wb") as fh:
        fh.write(key)
    os.chmod(_ADMIN_KEY_PATH, 0o600)
    logger.info("Generated new admin Fernet key at %s", _ADMIN_KEY_PATH)
    return key


_FERNET: Optional[Fernet] = None


def get_fernet() -> Fernet:
    global _FERNET  # noqa: PLW0603
    if _FERNET is None:
        _FERNET = Fernet(_resolve_fernet_key())
    return _FERNET


# ---------------------------------------------------------------------------
# Persistent model
# ---------------------------------------------------------------------------

class AdminSecret(Base):
    __tablename__ = "admin_secrets"

    key_name = Column(String, primary_key=True, index=True, nullable=False)
    encrypted_value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_by = Column(String, nullable=True)


class AiProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    base_url = Column(String, nullable=True)
    api_key_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    provider_type = Column(String, nullable=False, default="openai_compatible")
    priority = Column(Integer, default=0, nullable=False)
    is_active = Column("is_active", String, default="true", nullable=False)
    vision_capable = Column("vision_capable", String, default="false", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Boolean helpers
    @property
    def is_active_bool(self) -> bool:
        return self.is_active == "true"

    @is_active_bool.setter
    def is_active_bool(self, val: bool) -> None:
        self.is_active = "true" if val else "false"

    @property
    def vision_capable_bool(self) -> bool:
        return self.vision_capable == "true"

    @vision_capable_bool.setter
    def vision_capable_bool(self, val: bool) -> None:
        self.vision_capable = "true" if val else "false"


try:
    Base.metadata.create_all(bind=engine)
except Exception as e:  # noqa: BLE001
    logger.warning("admin_secrets create_all failed: %s", e)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def _require_admin(authorization: Optional[str], db: Session) -> str:
    """Return admin user email / identifier, or raise 401/403."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    token = authorization.split(" ", 1)[1].strip()

    # Dev-token path (e.g. "devtoken:u_instructor:instructor")
    if token.startswith("devtoken:"):
        parts = token.split(":")
        if len(parts) == 3 and parts[2] == "admin":
            return parts[1]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # JWT path (Supabase)
    try:
        payload = _jwt_decode(token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    # Resolve user from token — sub may be an email, numeric user ID, or Supabase UUID
    _User = __import__("sql_models", fromlist=["User"]).User
    user = None

    if payload.email:
        user = db.query(_User).filter(_User.email == payload.email).first()

    if user is None and payload.sub:
        try:
            # Local JWT: sub is a numeric user ID
            user_id = int(payload.sub)
            user = db.query(_User).filter(_User.id == user_id).first()
        except (ValueError, TypeError):
            # Supabase JWT: sub is a UUID stored as supabase_id
            user = db.query(_User).filter(_User.supabase_id == payload.sub).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing identity",
        )

    email = user.email or payload.email or payload.sub

    if getattr(user, "role", None) == "admin":
        return email

    # Also allow the dev auth_service mock admin so the dashboard works
    # before full Supabase user sync.
    from app.services.auth_service import auth_service
    resolved = auth_service.resolve_from_token(token)
    if resolved and resolved.role == "admin":
        return resolved.email or resolved.id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required",
    )


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ApiKeySlot(BaseModel):
    key_name: str
    configured: bool = Field(..., description="True when a value is stored")
    preview: Optional[str] = Field(None, description="Last 4 chars of the key, masked")
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class ApiKeyDetail(BaseModel):
    key_name: str
    value: str  # full value accepted from admin; NEVER returned on GET


class ApiKeyReloadResponse(BaseModel):
    active_providers: List[str]


class AiProviderSchema(BaseModel):
    id: Optional[int] = None
    name: str
    display_name: str
    base_url: Optional[str] = None
    api_key_name: str
    model: str
    provider_type: str = "openai_compatible"
    priority: int = 0
    is_active: bool = True
    vision_capable: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class AiProviderCreate(BaseModel):
    name: str
    display_name: str
    base_url: Optional[str] = None
    api_key_name: str
    model: Optional[str] = None  # Optional: OpenRouter will use default from dashboard if not set
    provider_type: str = "openai_compatible"
    priority: int = 0
    is_active: bool = True
    vision_capable: bool = False


class AiProviderUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    base_url: Optional[str] = None
    api_key_name: Optional[str] = None
    model: Optional[str] = None
    provider_type: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None
    vision_capable: Optional[bool] = None


class AiProviderTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None


class EmailIntegrationConfig(BaseModel):
    provider: str = "noop"
    sender_name: Optional[str] = "VOKASI"
    sender_email: Optional[str] = "noreply@localhost"
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_use_tls: bool = True


class EmailTestRequest(BaseModel):
    to_email: str


# ---------------------------------------------------------------------------
# Mask / encrypt helpers
# ---------------------------------------------------------------------------

_KNOWN_SLOTS = [
    "OPENAI_API_KEY",
    "OPENROUTER_API_KEY",
    "GEMINI_API_KEY",
    "SUPABASE_JWT_SECRET",
    "MIDTRANS_MERCHANT_ID",
    "MIDTRANS_CLIENT_KEY",
    "MIDTRANS_SERVER_KEY",
    "MIDTRANS_ENV",
    "EMAIL_PROVIDER",
    "EMAIL_SENDER_NAME",
    "EMAIL_SENDER_ADDRESS",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "SMTP_USE_TLS",
]

_ALLOWED_PROVIDER_TYPES = {"openai_compatible", "gemini"}
_DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
_DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001"


def _mask(value: str) -> str:
    if len(value) <= 4:
        return "****"
    return "****" + value[-4:]


def _encrypt(plain: str) -> str:
    return get_fernet().encrypt(plain.encode()).decode()


def _decrypt(cipher: str) -> str:
    return get_fernet().decrypt(cipher.encode()).decode()


def _validate_api_key_name(name: str) -> str:
    normalized = (name or "").strip().upper()
    if not normalized:
        raise HTTPException(status_code=400, detail="API key name is required")
    allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_")
    if any(ch not in allowed for ch in normalized):
        raise HTTPException(status_code=400, detail="API key name must use A-Z, 0-9, and underscore")
    return normalized


def _normalize_provider_payload(payload: AiProviderCreate | AiProviderUpdate, for_create: bool) -> dict:
    data = payload.model_dump(exclude_unset=not for_create)

    if "provider_type" in data and data["provider_type"] is not None:
        data["provider_type"] = data["provider_type"].strip().lower()
        if data["provider_type"] not in _ALLOWED_PROVIDER_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"provider_type must be one of: {', '.join(sorted(_ALLOWED_PROVIDER_TYPES))}",
            )

    if "api_key_name" in data and data["api_key_name"] is not None:
        data["api_key_name"] = _validate_api_key_name(data["api_key_name"])

    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip().lower()

    if "display_name" in data and data["display_name"] is not None:
        data["display_name"] = data["display_name"].strip()

    if "model" in data and isinstance(data.get("model"), str):
        data["model"] = data["model"].strip()

    if "base_url" in data:
        if isinstance(data.get("base_url"), str):
            data["base_url"] = data["base_url"].strip() or None

    inferred_name = data.get("name", "")
    inferred_type = data.get("provider_type", "")
    if (inferred_name == "openrouter" or inferred_type == "openai_compatible") and data.get("base_url") is None:
        if inferred_name == "openrouter":
            data["base_url"] = _DEFAULT_OPENROUTER_BASE_URL
    if inferred_name == "openrouter" and not data.get("model"):
        data["model"] = _DEFAULT_OPENROUTER_MODEL

    if for_create:
        required = ["name", "display_name", "api_key_name", "provider_type"]
        for field in required:
            if not data.get(field):
                raise HTTPException(status_code=400, detail=f"{field} is required")
        # For OpenRouter-compatible providers, default model is applied after validation
        # so users can leave it empty to let OpenRouter choose from their dashboard

    return data


def _slot_from_db(row: Optional[AdminSecret]) -> ApiKeySlot:
    if row is None:
        return ApiKeySlot(key_name="", configured=False)
    try:
        plain = _decrypt(row.encrypted_value)
        preview = _mask(plain)
    except Exception:  # noqa: BLE001
        preview = "[decrypt-failed]"
    return ApiKeySlot(
        key_name=row.key_name,
        configured=True,
        preview=preview,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
        updated_by=row.updated_by,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/api/v1/admin/settings/api-keys", response_model=List[ApiKeySlot])
def list_api_keys(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> List[ApiKeySlot]:
    admin_id = _require_admin(authorization, db)
    rows = {r.key_name: r for r in db.query(AdminSecret).all()}

    dynamic_key_names = {
        row[0] for row in db.query(AiProvider.api_key_name).all() if row and row[0]
    }
    all_key_names = list(_KNOWN_SLOTS)
    for name in sorted(dynamic_key_names.union(set(rows.keys()))):
        if name not in all_key_names:
            all_key_names.append(name)

    return [
        _slot_from_db(rows.get(name)) if rows.get(name) else ApiKeySlot(key_name=name, configured=False)
        for name in all_key_names
    ]


@router.get("/api/v1/admin/settings/api-keys/{key_name}", response_model=ApiKeySlot)
def get_api_key(
    key_name: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> ApiKeySlot:
    admin_id = _require_admin(authorization, db)
    row = db.query(AdminSecret).filter(AdminSecret.key_name == key_name).first()
    return _slot_from_db(row)


@router.put("/api/v1/admin/settings/api-keys/{key_name}", response_model=ApiKeySlot)
def upsert_api_key(
    key_name: str,
    payload: ApiKeyDetail,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> ApiKeySlot:
    admin_id = _require_admin(authorization, db)

    row = db.query(AdminSecret).filter(AdminSecret.key_name == key_name).first()
    now = datetime.utcnow()
    if row is None:
        row = AdminSecret(
            key_name=key_name,
            encrypted_value=_encrypt(payload.value),
            updated_at=now,
            updated_by=admin_id,
        )
        db.add(row)
    else:
        row.encrypted_value = _encrypt(payload.value)
        row.updated_at = now
        row.updated_by = admin_id
    db.commit()
    db.refresh(row)
    return _slot_from_db(row)


@router.delete("/api/v1/admin/settings/api-keys/{key_name}")
def delete_api_key(
    key_name: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    admin_id = _require_admin(authorization, db)
    row = db.query(AdminSecret).filter(AdminSecret.key_name == key_name).first()
    if row:
        db.delete(row)
        db.commit()
    return {"deleted": True, "key_name": key_name}


@router.post("/api/v1/admin/settings/api-keys/reload", response_model=ApiKeyReloadResponse)
def reload_api_keys(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> ApiKeyReloadResponse:
    admin_id = _require_admin(authorization, db)

    # Build overrides dict from DB secrets + env fallback
    overrides: Dict[str, Optional[str]] = {}
    rows = {r.key_name: r for r in db.query(AdminSecret).all()}
    for name in _KNOWN_SLOTS:
        row = rows.get(name)
        if row:
            try:
                overrides[name] = _decrypt(row.encrypted_value)
            except Exception as e:  # noqa: BLE001
                logger.error("Failed to decrypt %s: %s", name, e)
                overrides[name] = None
        else:
            overrides[name] = os.getenv(name) or None

    # Special: SUPABASE_JWT_SECRET also updates os.environ so classroom router picks it up
    if overrides.get("SUPABASE_JWT_SECRET"):
        os.environ["SUPABASE_JWT_SECRET"] = overrides["SUPABASE_JWT_SECRET"]

    active = reload_clients(overrides, db_session=db)
    return ApiKeyReloadResponse(active_providers=active)


@router.get("/api/v1/admin/settings/provider-status")
async def admin_provider_status(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Proxy to the AI provider-status endpoint (admin-only wrapper)."""
    _require_admin(authorization, db)
    from routers.ai import provider_status
    return await provider_status()


# ---------------------------------------------------------------------------
# AI Provider CRUD
# ---------------------------------------------------------------------------

def _provider_to_schema(row: AiProvider) -> AiProviderSchema:
    return AiProviderSchema(
        id=row.id,
        name=row.name,
        display_name=row.display_name,
        base_url=row.base_url,
        api_key_name=row.api_key_name,
        model=row.model,
        provider_type=row.provider_type,
        priority=row.priority,
        is_active=row.is_active_bool,
        vision_capable=row.vision_capable_bool,
        created_at=row.created_at.isoformat() if row.created_at else None,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
    )


@router.get("/api/v1/admin/settings/ai-providers", response_model=List[AiProviderSchema])
def list_ai_providers(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> List[AiProviderSchema]:
    """List all configured AI providers (admin-only)."""
    _require_admin(authorization, db)
    rows = db.query(AiProvider).order_by(AiProvider.priority).all()
    return [_provider_to_schema(r) for r in rows]


@router.get("/api/v1/admin/settings/ai-providers/{provider_id}", response_model=AiProviderSchema)
def get_ai_provider(
    provider_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> AiProviderSchema:
    """Get a single AI provider by ID (admin-only)."""
    _require_admin(authorization, db)
    row = db.query(AiProvider).filter(AiProvider.id == provider_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")
    return _provider_to_schema(row)


@router.post("/api/v1/admin/settings/ai-providers", response_model=AiProviderSchema)
def create_ai_provider(
    payload: AiProviderCreate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> AiProviderSchema:
    """Create a new AI provider configuration (admin-only)."""
    _require_admin(authorization, db)
    data = _normalize_provider_payload(payload, for_create=True)

    if db.query(AiProvider).filter(AiProvider.name == data["name"]).first():
        raise HTTPException(status_code=400, detail="Provider name already exists")

    # Use empty string for model if not provided (OpenRouter will use dashboard default)
    model_value = data.get("model") or ""

    row = AiProvider(
        name=data["name"],
        display_name=data["display_name"],
        base_url=data.get("base_url"),
        api_key_name=data["api_key_name"],
        model=model_value,
        provider_type=data["provider_type"],
        priority=data.get("priority", 0),
        is_active="true" if data.get("is_active", True) else "false",
        vision_capable="true" if data.get("vision_capable", False) else "false",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _provider_to_schema(row)


@router.put("/api/v1/admin/settings/ai-providers/{provider_id}", response_model=AiProviderSchema)
def update_ai_provider(
    provider_id: int,
    payload: AiProviderUpdate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> AiProviderSchema:
    """Update an AI provider configuration (admin-only)."""
    _require_admin(authorization, db)
    row = db.query(AiProvider).filter(AiProvider.id == provider_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    data = _normalize_provider_payload(payload, for_create=False)

    if data.get("name") and data["name"] != row.name:
        existing = db.query(AiProvider).filter(AiProvider.name == data["name"]).first()
        if existing and existing.id != provider_id:
            raise HTTPException(status_code=400, detail="Provider name already exists")
        row.name = data["name"]

    if "display_name" in data:
        row.display_name = data["display_name"]
    if "base_url" in data:
        row.base_url = data["base_url"]
    if "api_key_name" in data:
        row.api_key_name = data["api_key_name"]
    if "model" in data:
        row.model = data["model"]
    if "provider_type" in data:
        row.provider_type = data["provider_type"]
    if "priority" in data:
        row.priority = data["priority"]
    if "is_active" in data:
        row.is_active = "true" if data["is_active"] else "false"
    if "vision_capable" in data:
        row.vision_capable = "true" if data["vision_capable"] else "false"
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _provider_to_schema(row)


@router.delete("/api/v1/admin/settings/ai-providers/{provider_id}")
def delete_ai_provider(
    provider_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    """Delete an AI provider configuration (admin-only)."""
    _require_admin(authorization, db)
    row = db.query(AiProvider).filter(AiProvider.id == provider_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")
    db.delete(row)
    db.commit()
    return {"deleted": True, "provider_id": provider_id}


@router.post("/api/v1/admin/settings/ai-providers/{provider_id}/test", response_model=AiProviderTestResult)
async def test_ai_provider(
    provider_id: int,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> AiProviderTestResult:
    """Test an AI provider by sending a minimal request (admin-only)."""
    _require_admin(authorization, db)
    row = db.query(AiProvider).filter(AiProvider.id == provider_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Resolve API key
    secret = db.query(AdminSecret).filter(AdminSecret.key_name == row.api_key_name).first()
    if not secret:
        return AiProviderTestResult(
            success=False,
            message=f"API key '{row.api_key_name}' not found. Save it first in API Keys section.",
        )
    try:
        api_key = _decrypt(secret.encrypted_value)
    except Exception as e:
        return AiProviderTestResult(success=False, message=f"Failed to decrypt API key: {e}")

    start = time.time()
    try:
        if row.provider_type == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            m = genai.GenerativeModel(row.model)
            response = m.generate_content("Say 'ok' and nothing else.", generation_config=genai.GenerationConfig(max_output_tokens=5))
            latency = (time.time() - start) * 1000
            return AiProviderTestResult(
                success=True,
                message=f"Gemini responded: {response.text[:50]}",
                latency_ms=round(latency, 1),
            )
        else:
            # openai_compatible or custom
            from openai import AsyncOpenAI
            client = AsyncOpenAI(base_url=row.base_url or None, api_key=api_key)
            response = await client.chat.completions.create(
                model=row.model,
                messages=[{"role": "user", "content": "Say 'ok' and nothing else."}],
                max_tokens=5,
            )
            latency = (time.time() - start) * 1000
            msg = response.choices[0].message.content if response.choices else "No response"
            return AiProviderTestResult(
                success=True,
                message=f"Responded: {msg[:50]}",
                latency_ms=round(latency, 1),
            )
    except Exception as e:
        latency = (time.time() - start) * 1000
        hint = ""
        msg = str(e)
        if "401" in msg or "unauthorized" in msg.lower() or "invalid api key" in msg.lower():
            hint = " Check that your API key is valid."
        elif "404" in msg or "model" in msg.lower():
            hint = " Check model name for this provider."
        elif "openrouter" in (row.name or "") and not row.base_url:
            hint = " Set Base URL to https://openrouter.ai/api/v1."
        return AiProviderTestResult(
            success=False,
            message=(msg[:180] + hint)[:240],
            latency_ms=round(latency, 1),
        )


@router.get("/api/v1/admin/settings/email-integration", response_model=EmailIntegrationConfig)
def get_email_integration(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> EmailIntegrationConfig:
    _require_admin(authorization, db)
    cfg = load_email_config(db)
    return EmailIntegrationConfig(
        provider=cfg.provider,
        sender_name=cfg.sender_name,
        sender_email=cfg.sender_email,
        smtp_host=cfg.smtp_host,
        smtp_port=cfg.smtp_port,
        smtp_username=cfg.smtp_username,
        smtp_use_tls=cfg.smtp_use_tls,
    )


@router.put("/api/v1/admin/settings/email-integration", response_model=EmailIntegrationConfig)
def update_email_integration(
    payload: EmailIntegrationConfig,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> EmailIntegrationConfig:
    admin_id = _require_admin(authorization, db)
    now = datetime.utcnow()
    mapping = {
        "EMAIL_PROVIDER": payload.provider,
        "EMAIL_SENDER_NAME": payload.sender_name or "VOKASI",
        "EMAIL_SENDER_ADDRESS": payload.sender_email or "noreply@localhost",
        "SMTP_HOST": payload.smtp_host or "",
        "SMTP_PORT": str(payload.smtp_port),
        "SMTP_USERNAME": payload.smtp_username or "",
        "SMTP_USE_TLS": "true" if payload.smtp_use_tls else "false",
    }
    for key, value in mapping.items():
        row = db.query(AdminSecret).filter(AdminSecret.key_name == key).first()
        if row is None:
            row = AdminSecret(
                key_name=key,
                encrypted_value=_encrypt(value),
                updated_at=now,
                updated_by=admin_id,
            )
            db.add(row)
        else:
            row.encrypted_value = _encrypt(value)
            row.updated_at = now
            row.updated_by = admin_id
    db.commit()
    return get_email_integration(authorization=authorization, db=db)


@router.post("/api/v1/admin/settings/email-integration/test")
def test_email_integration(
    payload: EmailTestRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    _require_admin(authorization, db)
    cfg = load_email_config(db)
    provider = build_provider(cfg)
    provider.send(
        to_email=payload.to_email,
        subject="Test email from VOKASI",
        html="<p>Email integration test succeeded.</p>",
        text="Email integration test succeeded.",
    )
    return {"status": "ok", "message": f"Test email sent to {payload.to_email}"}


# ── BR-003: White-label theming ────────────────────────────────────────────────

import sql_models as _sql_models


class InstitutionTheme(BaseModel):
    institution_id: int
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    favicon_url: Optional[str] = None
    custom_logo_url: Optional[str] = None
    platform_name: Optional[str] = None


@router.get("/institution/theme")
def get_institution_theme(institution_id: int = 1, db: Session = Depends(get_db)):
    """BR-003: Return current theme config for an institution (public — no auth needed)."""
    inst = db.query(_sql_models.Institution).filter(
        _sql_models.Institution.id == institution_id
    ).first()
    if not inst:
        return {
            "institution_id": institution_id,
            "primary_color": None,
            "accent_color": None,
            "favicon_url": None,
            "custom_logo_url": None,
            "platform_name": None,
        }
    return {
        "institution_id": inst.id,
        "primary_color": inst.primary_color,
        "accent_color": inst.accent_color,
        "favicon_url": inst.favicon_url,
        "custom_logo_url": inst.custom_logo_url,
        "platform_name": inst.platform_name,
    }


@router.put("/institution/theme")
def update_institution_theme(
    payload: InstitutionTheme,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
):
    """BR-003: Update theme config for an institution. Requires admin JWT."""
    _require_admin(authorization, db)
    inst = db.query(_sql_models.Institution).filter(
        _sql_models.Institution.id == payload.institution_id
    ).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    if payload.primary_color is not None:
        inst.primary_color = payload.primary_color
    if payload.accent_color is not None:
        inst.accent_color = payload.accent_color
    if payload.favicon_url is not None:
        inst.favicon_url = payload.favicon_url
    if payload.custom_logo_url is not None:
        inst.custom_logo_url = payload.custom_logo_url
    if payload.platform_name is not None:
        inst.platform_name = payload.platform_name

    db.commit()
    db.refresh(inst)
    return {
        "success": True,
        "institution_id": inst.id,
        "primary_color": inst.primary_color,
        "accent_color": inst.accent_color,
        "favicon_url": inst.favicon_url,
        "custom_logo_url": inst.custom_logo_url,
        "platform_name": inst.platform_name,
    }
