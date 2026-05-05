from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Optional, Set

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

import sql_models as models
from routers.classroom import _decode_jwt


# JWT Configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Require JWT_SECRET_KEY in production/staging
if not SECRET_KEY and ENVIRONMENT not in ("development", "local"):
    raise ValueError(
        "JWT_SECRET_KEY must be set in production/staging environment. "
        "Generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
    )

# Use a safe default only for local development
if not SECRET_KEY:
    SECRET_KEY = "dev-secret-change-in-production-local-only"
    import warnings
    warnings.warn("Using default JWT_SECRET_KEY for local development. Set JWT_SECRET_KEY in production.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours


def create_access_token(data: dict) -> str:
    """Create a JWT access token with expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[int]:
    """Verify JWT token and return user_id if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return int(user_id)
        return None
    except JWTError:
        return None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly (passlib has issues with bcrypt 5.0+)."""
    import bcrypt
    # bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly."""
    import bcrypt
    if not hashed_password:
        return False
    # bcrypt has a 72-byte limit, truncate if necessary  
    password_bytes = plain_password.encode('utf-8')[:72]
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False


class AuthContext:
    def __init__(self, user_id: int, role: str, user: models.User):
        self.user_id = user_id
        self.role = role
        self.user = user



def _extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return authorization.split(" ", 1)[1].strip()



def resolve_auth_context(authorization: Optional[str], db: Session) -> AuthContext:
    token = _extract_bearer_token(authorization)

    # Try our new JWT tokens first (fully verified)
    user_id = verify_token(token)
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return AuthContext(user_id=user.id, role=user.role, user=user)

    # For OAuth users, use Supabase JWT with strict verification only
    # Lenient unsigned decode is not allowed as an auth fallback
    payload = _decode_jwt(token)
    identity = payload.email or payload.sub
    if not identity:
        raise HTTPException(status_code=401, detail="Token missing identity")

    user = None
    if isinstance(identity, str) and "@" in identity:
        user = db.query(models.User).filter(func.lower(models.User.email) == identity.lower()).first()
    else:
        try:
            uid = int(str(identity))
            user = db.query(models.User).filter(models.User.id == uid).first()
        except ValueError:
            user = db.query(models.User).filter(models.User.supabase_id == str(identity)).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found for token")

    return AuthContext(user_id=user.id, role=user.role, user=user)



def require_roles(auth: AuthContext, allowed_roles: Set[str]) -> None:
    if auth.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{auth.role}' is not permitted. Required: {sorted(allowed_roles)}",
        )



def require_self_or_admin(auth: AuthContext, target_user_id: int) -> None:
    if auth.user_id != target_user_id and auth.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this user",
        )
