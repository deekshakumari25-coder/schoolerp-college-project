from calendar import monthrange
from typing import Annotated, Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.attendance_day_meta import day_meta_for_range, school_holiday_set
from app.database import get_db
from app.deps import oid, require_student
from app.routers.teacher import _build_report_card

router = APIRouter(prefix="/student", tags=["student"])


@router.get("/me")
async def student_me(payload: Annotated[dict, Depends(require_student)]):
    db = get_db()
    sid = payload.get("studentId")
    if not sid:
        raise HTTPException(403, "Not a student account")
    st = await db.students.find_one({"_id": oid(sid)})
    if not st:
        raise HTTPException(404, "Student not found")
    cl = await db.classes.find_one({"_id": st.get("classId")})
    ct_name = ""
    if cl and cl.get("classTeacherId"):
        t = await db.teachers.find_one({"_id": cl["classTeacherId"]})
        if t:
            ct_name = t.get("name", "")
    sett = await db.school_settings.find_one({"key": "default"})
    session = sett.get("currentSession", "2025-26") if sett else "2025-26"
    school_name = sett.get("schoolName", "School") if sett else "School"
    return {
        "name": st.get("name"),
        "rollNo": st.get("rollNo"),
        "className": cl.get("className") if cl else "",
        "classId": str(st["classId"]) if st.get("classId") else None,
        "classTeacherName": ct_name,
        "currentSession": session,
        "schoolName": school_name,
    }


@router.get("/timetable")
async def student_timetable(payload: Annotated[dict, Depends(require_student)]):
    db = get_db()
    st = await db.students.find_one({"_id": oid(payload["studentId"])})
    if not st or not st.get("classId"):
        return []
    cid = st["classId"]
    out = []
    q = {"classId": cid, "$or": [{"scope": "class"}, {"scope": {"$exists": False}}]}
    async for row in db.timetable_entries.find(q).sort([("day", 1), ("time", 1)]):
        out.append(
            {
                "_id": str(row["_id"]),
                "day": row.get("day"),
                "time": row.get("time"),
                "subject": row.get("subject"),
                "room": row.get("room"),
            }
        )
    return out


@router.get("/marks")
async def student_marks(payload: Annotated[dict, Depends(require_student)]):
    db = get_db()
    stu_oid = oid(payload["studentId"])
    out: list[dict[str, Any]] = []
    async for m in db.marks.find({"studentId": stu_oid}):
        ex = await db.exams.find_one({"_id": m.get("examId")})
        out.append(
            {
                "subjectName": m.get("subjectName", ""),
                "marksObtained": m.get("marksObtained", 0),
                "maxMarks": m.get("maxMarks", 0),
                "exam": {
                    "_id": str(ex["_id"]) if ex else "",
                    "eventName": (ex.get("name") or ex.get("eventName", "")) if ex else "",
                    "date": ex.get("date", "") if ex else "",
                }
                if ex
                else None,
            }
        )
    return out


@router.get("/report-card")
async def student_report_card(payload: Annotated[dict, Depends(require_student)]):
    db = get_db()
    stu_oid = oid(payload["studentId"])
    return await _build_report_card(db, stu_oid, None)


@router.get("/attendance")
async def student_attendance(
    payload: Annotated[dict, Depends(require_student)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
):
    db = get_db()
    stu_oid = oid(payload["studentId"])
    _, last = monthrange(year, month)
    start = f"{year:04d}-{month:02d}-01"
    end = f"{year:04d}-{month:02d}-{last:02d}"
    days = [f"{year:04d}-{month:02d}-{d:02d}" for d in range(1, last + 1)]
    cells: dict[str, str] = {}
    async for a in db.attendance.find({"studentId": stu_oid, "date": {"$gte": start, "$lte": end}}):
        cells[a["date"]] = a.get("status", "")
    holidays = await school_holiday_set(db)
    day_meta = day_meta_for_range(days, holidays)
    return {"month": month, "year": year, "days": days, "dayMeta": day_meta, "cells": cells}
