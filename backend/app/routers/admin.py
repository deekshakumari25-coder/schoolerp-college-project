from typing import Annotated, Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth_utils import hash_password
from app.database import get_db
from app.deps import oid, require_admin
from app.schemas import (
    ClassCreate,
    ClassUpdate,
    ExamCreate,
    ExamUpdate,
    SchoolSettingsOut,
    SchoolSettingsUpdate,
    StudentCreate,
    StudentUpdate,
    TeacherCreate,
    TeacherUpdate,
    TimetableCreate,
)

router = APIRouter(tags=["admin"])


@router.patch("/admin/school/settings", response_model=SchoolSettingsOut)
async def admin_patch_school(
    body: SchoolSettingsUpdate,
    _: Annotated[dict, Depends(require_admin)],
):
    db = get_db()
    update: dict[str, Any] = {}
    if body.schoolName is not None:
        update["schoolName"] = body.schoolName
    if body.logoUrl is not None:
        update["logoUrl"] = body.logoUrl
    if body.currentSession is not None:
        update["currentSession"] = body.currentSession
    if not update:
        doc = await db.school_settings.find_one({"key": "default"})
    else:
        update["key"] = "default"
        await db.school_settings.update_one(
            {"key": "default"},
            {"$set": update},
            upsert=True,
        )
        doc = await db.school_settings.find_one({"key": "default"})
    return SchoolSettingsOut(
        schoolName=doc.get("schoolName", "School") if doc else "School",
        logoUrl=doc.get("logoUrl") if doc else None,
        currentSession=doc.get("currentSession", "2025-26") if doc else "2025-26",
    )


@router.get("/admin/teachers")
async def list_teachers(_: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    out = []
    async for t in db.teachers.find().sort("name", 1):
        u = await db.users.find_one({"_id": t.get("userId")}) if t.get("userId") else None
        out.append(
            {
                "_id": str(t["_id"]),
                "name": t.get("name"),
                "username": u["username"] if u else None,
                "subjectAssignments": [
                    {"classId": str(a["classId"]), "subjectName": a.get("subjectName", "")}
                    for a in (t.get("subjectAssignments") or [])
                    if a.get("classId")
                ],
            }
        )
    return out


@router.post("/admin/teachers")
async def create_teacher(body: TeacherCreate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    uname = body.username.lower().strip()
    if await db.users.find_one({"username": uname}):
        raise HTTPException(400, "Username already exists")
    user_doc = {
        "username": uname,
        "passwordHash": hash_password(body.password),
        "role": "teacher",
        "displayName": body.name,
    }
    ins_user = await db.users.insert_one(user_doc)
    teacher_doc = {
        "name": body.name,
        "userId": ins_user.inserted_id,
        "subjectAssignments": [
            {"classId": oid(a["classId"]), "subjectName": a.get("subjectName", "")}
            for a in body.subjectAssignments
            if a.get("classId")
        ],
    }
    ins_t = await db.teachers.insert_one(teacher_doc)
    await db.users.update_one({"_id": ins_user.inserted_id}, {"$set": {"teacherId": ins_t.inserted_id}})
    return {"_id": str(ins_t.inserted_id), "name": body.name, "username": uname}


@router.patch("/admin/teachers/{teacher_id}")
async def update_teacher(teacher_id: str, body: TeacherUpdate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    t_oid = oid(teacher_id)
    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.subjectAssignments is not None:
        update_data["subjectAssignments"] = [
            {"classId": oid(a["classId"]), "subjectName": a.get("subjectName", "")}
            for a in body.subjectAssignments
            if a.get("classId")
        ]
    if update_data:
        await db.teachers.update_one({"_id": t_oid}, {"$set": update_data})
        if "name" in update_data:
            t = await db.teachers.find_one({"_id": t_oid})
            if t and t.get("userId"):
                await db.users.update_one({"_id": t["userId"]}, {"$set": {"displayName": body.name}})
    return {"ok": True}


async def _class_out(db, c: dict) -> dict:
    tname = None
    if c.get("classTeacherId"):
        t = await db.teachers.find_one({"_id": c["classTeacherId"]})
        if t:
            tname = t.get("name")
    return {
        "_id": str(c["_id"]),
        "className": c.get("className", ""),
        "classTeacherId": str(c["classTeacherId"]) if c.get("classTeacherId") else None,
        "teacherName": tname or "",
    }


@router.get("/classes")
async def list_classes(_: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    out = []
    async for c in db.classes.find().sort("className", 1):
        out.append(await _class_out(db, c))
    return out


@router.post("/classes")
async def create_class(body: ClassCreate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    doc: dict[str, Any] = {"className": body.className.strip()}
    if body.classTeacherId:
        doc["classTeacherId"] = oid(body.classTeacherId)
    ins = await db.classes.insert_one(doc)
    c = await db.classes.find_one({"_id": ins.inserted_id})
    return await _class_out(db, c)


@router.patch("/classes/{class_id}")
async def update_class(class_id: str, body: ClassUpdate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    c_oid = oid(class_id)
    upd = {}
    if body.className is not None:
        upd["className"] = body.className.strip()
    if body.classTeacherId is not None:
        upd["classTeacherId"] = oid(body.classTeacherId) if body.classTeacherId else None
    if upd:
        await db.classes.update_one({"_id": c_oid}, {"$set": upd})
    return {"ok": True}


@router.get("/students")
async def list_students(_: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    out = []
    async for s in db.students.find().sort("rollNo", 1):
        cl = await db.classes.find_one({"_id": s.get("classId")})
        base = {k: v for k, v in s.items() if k not in ["_id", "classId"]}
        if "userId" in base and isinstance(base["userId"], ObjectId):
            base["userId"] = str(base["userId"])
        
        out.append(
            {
                **base,
                "_id": str(s["_id"]),
                "classId": {"_id": str(s["classId"]), "className": cl.get("className") if cl else ""} if s.get("classId") else None,
            }
        )
    return out


@router.post("/students")
async def create_student(body: StudentCreate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    cid = oid(body.classId)
    doc = {"name": body.name.strip(), "rollNo": body.rollNo.strip(), "classId": cid}
    ins = await db.students.insert_one(doc)
    sid = ins.inserted_id
    if body.username and body.password:
        uname = body.username.lower().strip()
        if await db.users.find_one({"username": uname}):
            raise HTTPException(400, "Student username already exists")
        uid = await db.users.insert_one(
            {
                "username": uname,
                "passwordHash": hash_password(body.password),
                "role": "student",
                "studentId": sid,
                "displayName": body.name,
            }
        )
        await db.students.update_one({"_id": sid}, {"$set": {"userId": uid.inserted_id}})
    cl = await db.classes.find_one({"_id": cid})
    return {
        "_id": str(sid),
        "name": doc["name"],
        "rollNo": doc["rollNo"],
        "classId": {"_id": str(cid), "className": cl.get("className") if cl else ""},
    }


@router.patch("/students/{student_id}")
async def update_student(student_id: str, body: StudentUpdate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    s_oid = oid(student_id)
    upd = {}
    if body.name is not None:
        upd["name"] = body.name.strip()
    if body.rollNo is not None:
        upd["rollNo"] = body.rollNo.strip()
    if body.classId is not None:
        upd["classId"] = oid(body.classId)
    if upd:
        await db.students.update_one({"_id": s_oid}, {"$set": upd})
        if "name" in upd:
            s_doc = await db.students.find_one({"_id": s_oid})
            if s_doc and s_doc.get("userId"):
                await db.users.update_one({"_id": s_doc["userId"]}, {"$set": {"displayName": upd["name"]}})
    return {"ok": True}


@router.get("/timetable")
async def list_timetable(_: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    out = []
    async for row in db.timetable_entries.find().sort([("day", 1), ("time", 1)]):
        cl_name = None
        cl_id = row.get("classId")
        if cl_id:
            c = await db.classes.find_one({"_id": cl_id})
            cl_name = c.get("className") if c else None
            
        t_name = None
        t_id = row.get("teacherId")
        if t_id:
            t = await db.teachers.find_one({"_id": t_id})
            t_name = t.get("name") if t else None
            
        out.append(
            {
                "_id": str(row["_id"]),
                "classId": {"_id": str(cl_id), "className": cl_name} if cl_id else None,
                "teacherId": {"_id": str(t_id), "name": t_name} if t_id else None,
                "day": row.get("day"),
                "subject": row.get("subject"),
                "time": row.get("time"),
                "room": row.get("room"),
            }
        )
    return out


@router.post("/timetable")
async def create_timetable(body: TimetableCreate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    
    # Verify relations
    c = await db.classes.find_one({"_id": oid(body.classId)})
    if not c:
        raise HTTPException(404, "Class not found")
        
    t = await db.teachers.find_one({"_id": oid(body.teacherId)})
    if not t:
        raise HTTPException(404, "Teacher not found")

    doc: dict[str, Any] = {
        "classId": oid(body.classId),
        "teacherId": oid(body.teacherId),
        "day": body.day,
        "subject": body.subject.strip(),
        "time": body.time,
    }
    if body.room:
        doc["room"] = body.room
        
    ins = await db.timetable_entries.insert_one(doc)
    row = await db.timetable_entries.find_one({"_id": ins.inserted_id})
    return {
        "_id": str(row["_id"]),
        "classId": {"_id": str(c["_id"]), "className": c.get("className")},
        "teacherId": str(row["teacherId"]),
        "day": row["day"],
        "subject": row["subject"],
        "time": row["time"],
    }


@router.get("/exams")
async def list_exams(_: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    out = []
    async for e in db.exams.find().sort("date", 1):
        cl = await db.classes.find_one({"_id": e.get("classId")})
        out.append(
            {
                "_id": str(e["_id"]),
                "eventName": e.get("name") or e.get("eventName", ""),
                "date": e.get("date", ""),
                "subject": e.get("subject") or "",
                "session": e.get("session") or "",
                "classId": {
                    "_id": str(e["classId"]),
                    "className": cl.get("className") if cl else "",
                }
                if e.get("classId")
                else None,
            }
        )
    return out


@router.post("/exams")
async def create_exam(body: ExamCreate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    session = body.session
    if not session:
        sett = await db.school_settings.find_one({"key": "default"})
        session = sett.get("currentSession", "2025-26") if sett else "2025-26"
    doc = {
        "name": body.eventName.strip(),
        "eventName": body.eventName.strip(),
        "date": body.date,
        "classId": oid(body.classId),
        "subject": (body.subject or "").strip(),
        "session": session,
    }
    ins = await db.exams.insert_one(doc)
    e = await db.exams.find_one({"_id": ins.inserted_id})
    cl = await db.classes.find_one({"_id": e["classId"]})
    return {
        "_id": str(e["_id"]),
        "eventName": e["name"],
        "date": e["date"],
        "subject": e.get("subject", ""),
        "session": e.get("session", ""),
        "classId": {"_id": str(e["classId"]), "className": cl.get("className") if cl else ""},
    }


@router.patch("/exams/{exam_id}")
async def update_exam(exam_id: str, body: ExamUpdate, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    e_oid = oid(exam_id)
    upd = {}
    if body.eventName is not None:
        upd["eventName"] = body.eventName.strip()
        upd["name"] = upd["eventName"]
    if body.date is not None:
        upd["date"] = body.date
    if body.subject is not None:
        upd["subject"] = body.subject.strip()
    if upd:
        await db.exams.update_one({"_id": e_oid}, {"$set": upd})
    return {"ok": True}


@router.delete("/timetable/{entry_id}")
async def delete_timetable(entry_id: str, _: Annotated[dict, Depends(require_admin)]):
    db = get_db()
    res = await db.timetable_entries.delete_one({"_id": oid(entry_id)})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}
