from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
import secrets
from typing import Dict

from fastapi import Header, HTTPException, status


_SESSION_STORE: Dict[str, datetime] = {}


def _configured_password() -> str:
    password = os.getenv("ADMIN_CONSOLE_PASSWORD")
    if not password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin console password is not configured.",
        )
    return password


def _session_duration() -> timedelta:
    raw_value = os.getenv("ADMIN_SESSION_HOURS", "8")
    try:
        hours = float(raw_value)
    except ValueError:
        hours = 8.0
    hours = max(hours, 1.0)
    return timedelta(hours=hours)


def verify_admin_password(password: str) -> None:
    configured = _configured_password()
    if not secrets.compare_digest(password, configured):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials.")


def create_admin_session() -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + _session_duration()
    _SESSION_STORE[token] = expires_at
    return token, expires_at


def revoke_admin_session(token: str) -> None:
    _SESSION_STORE.pop(token, None)


def require_admin(authorization: str = Header(..., alias="Authorization")) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid admin token.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid admin token.")

    now = datetime.now(timezone.utc)
    expires_at = _SESSION_STORE.get(token)
    if expires_at is None or expires_at <= now:
        revoke_admin_session(token)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired admin session.")

    return token
