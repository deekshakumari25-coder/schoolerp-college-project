from typing import Annotated

from fastapi import APIRouter, Depends

from app.database import get_db
from app.deps import get_current_payload
from app.schemas import SchoolSettingsOut

router = APIRouter(prefix="/school", tags=["school"])


async def get_school_settings_dict(db):
    doc = await db.school_settings.find_one({"key": "default"})
    if not doc:
        return {
            "schoolName": "School",
            "logoUrl": None,
            "currentSession": "2025-26",
        }
    return {
        "schoolName": doc.get("schoolName", "School"),
        "logoUrl": doc.get("logoUrl"),
        "currentSession": doc.get("currentSession", "2025-26"),
    }


@router.get("/settings", response_model=SchoolSettingsOut)
async def get_settings(_: Annotated[dict, Depends(get_current_payload)]):
    db = get_db()
    s = await get_school_settings_dict(db)
    return SchoolSettingsOut(**s)
