from calendar import monthrange
from typing import Annotated, Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.attendance_day_meta import day_meta_for_range, school_holiday_set
from app.database import get_db
from app.deps import oid, require_teacher
from app.routers.school import get_school_settings_dict
from app.schemas import AttendanceBulkBody, MarksBulkBody

router = APIRouter(prefix="/teacher", tags=["teacher"])


async def _homeroom_class_id(db, teacher_oid: ObjectId) -> ObjectId | None:
    c = await db.classes.find_one({"classTeacherId": teacher_oid})
    return c["_id"] if c else None


@router.get("/my-class/students")
async def my_class_students(payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = payload.get("teacherId")
    if not tid:
        raise HTTPException(403, "Not a teacher account")
    t_oid = oid(tid)
    class_id = await _homeroom_class_id(db, t_oid)
    if not class_id:
        raise HTTPException(400, "No class assigned")
    out = []
    async for s in db.students.find({"classId": class_id}).sort("rollNo", 1):
        out.append(
            {
                "_id": str(s["_id"]),
                "name": s.get("name"),
                "rollNo": s.get("rollNo"),
                "classId": str(class_id),
            }
        )
    return out


@router.get("/my-class/students/{student_id}")
async def my_class_student_detail(student_id: str, payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    class_id = await _homeroom_class_id(db, tid)
    if not class_id:
        raise HTTPException(400, "No class assigned")
    s = await db.students.find_one({"_id": oid(student_id), "classId": class_id})
    if not s:
        raise HTTPException(404, "Student not found")
    teacher = await db.teachers.find_one({"_id": tid})
    subjects = [
        a.get("subjectName", "")
        for a in (teacher.get("subjectAssignments") or [])
        if a.get("classId") == class_id
    ]
    return {
        "_id": str(s["_id"]),
        "name": s.get("name"),
        "rollNo": s.get("rollNo"),
        "fatherName": s.get("fatherName"),
        "motherName": s.get("motherName"),
        "address": s.get("address"),
        "dob": s.get("dob"),
        "subjectTeacherFor": subjects,
    }


@router.get("/timetable/class")
async def timetable_class(payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    class_id = await _homeroom_class_id(db, tid)
    if not class_id:
        return []
    out = []
    q = {
        "classId": class_id,
        "$or": [{"scope": "class"}, {"scope": {"$exists": False}}],
    }
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


@router.get("/timetable/personal")
async def timetable_personal(payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    out = []
    async for row in db.timetable_entries.find({"scope": "teacher", "teacherId": tid}).sort(
        [("day", 1), ("time", 1)]
    ):
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


@router.post("/attendance")
async def post_attendance(body: AttendanceBulkBody, payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    class_id = await _homeroom_class_id(db, tid)
    if not class_id or str(class_id) != body.classId:
        raise HTTPException(403, "Can only mark attendance for your homeroom class")
    for e in body.entries:
        sid = oid(e["studentId"])
        st = await db.students.find_one({"_id": sid, "classId": class_id})
        if not st:
            continue
        await db.attendance.update_one(
            {"studentId": sid, "date": body.date},
            {
                "$set": {
                    "studentId": sid,
                    "date": body.date,
                    "status": e.get("status", "P"),
                    "markedBy": tid,
                }
            },
            upsert=True,
        )
    return {"success": True}


@router.get("/attendance/report")
async def attendance_report(
    payload: Annotated[dict, Depends(require_teacher)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    classId: str | None = None,
):
    db = get_db()
    tid = oid(payload["teacherId"])
    homeroom = await _homeroom_class_id(db, tid)
    if not homeroom:
        raise HTTPException(400, "No class assigned")
    if classId and classId != str(homeroom):
        raise HTTPException(403, "Invalid class")
    cid = homeroom
    _, last = monthrange(year, month)
    start = f"{year:04d}-{month:02d}-01"
    end = f"{year:04d}-{month:02d}-{last:02d}"
    students = []
    async for s in db.students.find({"classId": cid}).sort("rollNo", 1):
        students.append({"_id": str(s["_id"]), "name": s.get("name"), "rollNo": s.get("rollNo")})
    student_ids = [ObjectId(s["_id"]) for s in students]
    cursor = db.attendance.find(
        {"studentId": {"$in": student_ids}, "date": {"$gte": start, "$lte": end}}
    )
    by_student_date: dict[str, dict[str, str]] = {}
    async for a in cursor:
        sid = str(a["studentId"])
        by_student_date.setdefault(sid, {})[a["date"]] = a.get("status", "")
    days = [f"{year:04d}-{month:02d}-{d:02d}" for d in range(1, last + 1)]
    holidays = await school_holiday_set(db)
    day_meta = day_meta_for_range(days, holidays)
    return {
        "classId": str(cid),
        "month": month,
        "year": year,
        "days": days,
        "dayMeta": day_meta,
        "students": students,
        "cells": by_student_date,
    }


@router.get("/exams")
async def teacher_exams(payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    class_id = await _homeroom_class_id(db, tid)
    if not class_id:
        return []
    out = []
    async for e in db.exams.find({"classId": class_id}).sort("date", 1):
        out.append(
            {
                "_id": str(e["_id"]),
                "eventName": e.get("name") or e.get("eventName", ""),
                "date": e.get("date", ""),
                "subject": e.get("subject", ""),
                "session": e.get("session", ""),
            }
        )
    return out


@router.get("/marks-matrix")
async def marks_matrix(
    payload: Annotated[dict, Depends(require_teacher)],
    examId: str = Query(...),
    classId: str | None = None,
):
    db = get_db()
    tid = oid(payload["teacherId"])
    homeroom = await _homeroom_class_id(db, tid)
    if not homeroom:
        raise HTTPException(400, "No class assigned")
    if classId and classId != str(homeroom):
        raise HTTPException(403, "Invalid class")
    cid = homeroom
    ex = await db.exams.find_one({"_id": oid(examId), "classId": cid})
    if not ex:
        raise HTTPException(404, "Exam not found")
    students = []
    async for s in db.students.find({"classId": cid}).sort("rollNo", 1):
        students.append({"_id": str(s["_id"]), "name": s.get("name"), "rollNo": s.get("rollNo")})
    teacher = await db.teachers.find_one({"_id": tid})
    subjects_set: set[str] = set()
    for a in teacher.get("subjectAssignments") or []:
        if a.get("classId") == cid and a.get("subjectName"):
            subjects_set.add(a["subjectName"])
    if ex.get("subject"):
        subjects_set.add(ex["subject"])
    if not subjects_set:
        subjects_set = {"General"}
    subjects = sorted(subjects_set)
    marks_list = []
    async for m in db.marks.find({"examId": ex["_id"], "studentId": {"$in": [ObjectId(s["_id"]) for s in students]}}):
        marks_list.append(
            {
                "studentId": str(m["studentId"]),
                "subjectName": m.get("subjectName", ""),
                "marksObtained": m.get("marksObtained", 0),
                "maxMarks": m.get("maxMarks", 100),
            }
        )
    return {
        "exam": {
            "_id": str(ex["_id"]),
            "eventName": ex.get("name") or ex.get("eventName", ""),
            "date": ex.get("date", ""),
        },
        "subjects": subjects,
        "students": students,
        "marks": marks_list,
    }


@router.put("/marks")
async def put_marks(body: MarksBulkBody, payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    homeroom = await _homeroom_class_id(db, tid)
    if not homeroom:
        raise HTTPException(400, "No class assigned")
    ex = await db.exams.find_one({"_id": oid(body.examId), "classId": homeroom})
    if not ex:
        raise HTTPException(404, "Exam not found")
    teacher = await db.teachers.find_one({"_id": tid})
    allowed_subjects = {
        a.get("subjectName")
        for a in (teacher.get("subjectAssignments") or [])
        if a.get("classId") == homeroom and a.get("subjectName")
    }
    for e in body.entries:
        sub = e.get("subjectName", "")
        if allowed_subjects and sub not in allowed_subjects:
            continue
        sid = oid(e["studentId"])
        st = await db.students.find_one({"_id": sid, "classId": homeroom})
        if not st:
            continue
        await db.marks.update_one(
            {
                "examId": ex["_id"],
                "studentId": sid,
                "subjectName": sub,
            },
            {
                "$set": {
                    "examId": ex["_id"],
                    "studentId": sid,
                    "subjectName": sub,
                    "marksObtained": float(e.get("marksObtained", 0)),
                    "maxMarks": float(e.get("maxMarks", 100)),
                    "enteredBy": tid,
                }
            },
            upsert=True,
        )
    return {"success": True}


async def _build_report_card(db, student_oid: ObjectId, viewer_class_id: ObjectId | None) -> dict[str, Any]:
    st = await db.students.find_one({"_id": student_oid})
    if not st:
        raise HTTPException(404, "Student not found")
    if viewer_class_id and st.get("classId") != viewer_class_id:
        raise HTTPException(403, "Access denied")
    cl = await db.classes.find_one({"_id": st["classId"]})
    ct_name = ""
    if cl and cl.get("classTeacherId"):
        t = await db.teachers.find_one({"_id": cl["classTeacherId"]})
        if t:
            ct_name = t.get("name", "")
    school = await get_school_settings_dict(db)
    exams = []
    async for e in db.exams.find({"classId": st["classId"]}).sort("date", 1):
        exams.append(e)
    exam_cols = [{"_id": str(e["_id"]), "name": e.get("name") or e.get("eventName", ""), "date": e.get("date", "")}]
    marks = [m async for m in db.marks.find({"studentId": student_oid})]
    subjects: set[str] = {m.get("subjectName", "") for m in marks if m.get("subjectName")}
    if not subjects:
        subjects = {"—"}
    subjects_sorted = sorted(subjects)
    grid: dict[str, dict[str, dict[str, float]]] = {s: {} for s in subjects_sorted}
    totals_obtained = 0.0
    totals_max = 0.0
    for m in marks:
        sub = m.get("subjectName") or "—"
        eid = str(m["examId"])
        if sub not in grid:
            continue
        grid[sub][eid] = {
            "obtained": float(m.get("marksObtained", 0)),
            "max": float(m.get("maxMarks", 0)),
        }
        totals_obtained += float(m.get("marksObtained", 0))
        totals_max += float(m.get("maxMarks", 0))
    row_totals = {}
    for sub, by_ex in grid.items():
        o = sum(v["obtained"] for v in by_ex.values())
        mx = sum(v["max"] for v in by_ex.values())
        row_totals[sub] = {"obtained": o, "max": mx}
    pct = round((totals_obtained / totals_max * 100), 2) if totals_max > 0 else None
    return {
        "schoolName": school["schoolName"],
        "logoUrl": school.get("logoUrl"),
        "currentSession": school["currentSession"],
        "student": {
            "name": st.get("name"),
            "rollNo": st.get("rollNo"),
            "className": cl.get("className") if cl else "",
        },
        "classTeacherName": ct_name,
        "exams": exam_cols,
        "subjects": subjects_sorted,
        "grid": grid,
        "rowTotals": row_totals,
        "grandTotal": {"obtained": totals_obtained, "max": totals_max},
        "percentage": pct,
    }


@router.get("/report-card/{student_id}")
async def teacher_report_card(student_id: str, payload: Annotated[dict, Depends(require_teacher)]):
    db = get_db()
    tid = oid(payload["teacherId"])
    homeroom = await _homeroom_class_id(db, tid)
    if not homeroom:
        raise HTTPException(400, "No class assigned")
    return await _build_report_card(db, oid(student_id), homeroom)
