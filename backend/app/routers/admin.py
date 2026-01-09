from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ..auth import create_admin_session, require_admin, revoke_admin_session, verify_admin_password
from ..schemas import AdminLoginRequest, AdminLoginResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminLoginResponse)
def login(payload: AdminLoginRequest) -> AdminLoginResponse:
    verify_admin_password(payload.password)
    token, expires_at = create_admin_session()
    return AdminLoginResponse(token=token, expires_at=expires_at)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(token: str = Depends(require_admin)) -> dict:
    revoke_admin_session(token)
    return {"message": "Admin logged out successfully"}
