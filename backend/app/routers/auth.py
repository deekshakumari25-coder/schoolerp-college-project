from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_utils import create_access_token, hash_password, verify_password
from app.database import get_db
from app.deps import get_current_payload
from app.schemas import ChangePasswordBody, LoginBody, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody):
    db = get_db()
    user = await db.users.find_one({"username": body.username.lower().strip()})
    if not user or not verify_password(body.password, user["passwordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    role = user["role"]
    display_name = user.get("displayName") or user["username"]
    is_class_teacher = False
    homeroom_class_id = None
    subjects_taught: list[dict[str, str]] = []

    if role == "teacher" and user.get("teacherId"):
        tid = user["teacherId"]
        teacher = await db.teachers.find_one({"_id": tid})
        if teacher:
            display_name = teacher.get("name", display_name)
            for a in teacher.get("subjectAssignments") or []:
                cid = a.get("classId")
                subjects_taught.append(
                    {
                        "classId": str(cid) if cid else "",
                        "subjectName": a.get("subjectName", ""),
                    }
                )
        cursor = db.classes.find({"classTeacherId": tid})
        async for c in cursor:
            is_class_teacher = True
            homeroom_class_id = str(c["_id"])
            break

    if role == "student" and user.get("studentId"):
        stu = await db.students.find_one({"_id": user["studentId"]})
        if stu:
            display_name = stu.get("name", display_name)

    token = create_access_token(
        str(user["_id"]),
        {
            "role": role,
            "teacherId": str(user["teacherId"]) if user.get("teacherId") else None,
            "studentId": str(user["studentId"]) if user.get("studentId") else None,
        },
    )

    return TokenResponse(
        token=token,
        username=user["username"],
        role=role,
        displayName=display_name,
        isClassTeacher=is_class_teacher,
        homeroomClassId=homeroom_class_id,
        subjectsTaught=subjects_taught,
    )


@router.get("/me")
async def me(payload: Annotated[dict, Depends(get_current_payload)]):
    db = get_db()
    uid = ObjectId(payload["sub"])
    user = await db.users.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = user["role"]
    display_name = user.get("displayName") or user["username"]
    is_class_teacher = False
    homeroom_class_id = None
    subjects_taught: list[dict[str, str]] = []

    if role == "teacher" and user.get("teacherId"):
        tid = user["teacherId"]
        teacher = await db.teachers.find_one({"_id": tid})
        if teacher:
            display_name = teacher.get("name", display_name)
            for a in teacher.get("subjectAssignments") or []:
                cid = a.get("classId")
                subjects_taught.append(
                    {
                        "classId": str(cid) if cid else "",
                        "subjectName": a.get("subjectName", ""),
                    }
                )
        cursor = db.classes.find({"classTeacherId": tid})
        async for c in cursor:
            is_class_teacher = True
            homeroom_class_id = str(c["_id"])
            break

    if role == "student" and user.get("studentId"):
        stu = await db.students.find_one({"_id": user["studentId"]})
        if stu:
            display_name = stu.get("name", display_name)

    return {
        "username": user["username"],
        "role": role,
        "displayName": display_name,
        "isClassTeacher": is_class_teacher,
        "homeroomClassId": homeroom_class_id,
        "subjectsTaught": subjects_taught,
    }


@router.post("/change-password")
async def change_password(
    body: ChangePasswordBody,
    payload: Annotated[dict, Depends(get_current_payload)],
):
    db = get_db()
    uid = ObjectId(payload["sub"])
    user = await db.users.find_one({"_id": uid})
    if not user or not verify_password(body.currentPassword, user["passwordHash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one(
        {"_id": uid},
        {"$set": {"passwordHash": hash_password(body.newPassword)}},
    )
    return {"success": True}
