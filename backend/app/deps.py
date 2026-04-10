from typing import Annotated

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth_utils import decode_token
from app.database import get_db

security = HTTPBearer(auto_error=False)


async def get_current_payload(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload


async def require_admin(payload: Annotated[dict, Depends(get_current_payload)]) -> dict:
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return payload


async def require_teacher(payload: Annotated[dict, Depends(get_current_payload)]) -> dict:
    if payload.get("role") != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher only")
    return payload


async def require_student(payload: Annotated[dict, Depends(get_current_payload)]) -> dict:
    if payload.get("role") != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student only")
    return payload


def oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")
