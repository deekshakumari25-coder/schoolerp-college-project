"""
Run from repo root: python -m scripts.seed
Or from backend: python -m scripts.seed (ensure PYTHONPATH includes backend parent)
Recommended: cd backend && set PYTHONPATH=.. && python scripts/seed.py
Simpler: cd school && python backend/scripts/seed.py with path fix

Actually run: cd d:\\p\\school\\backend && python -m app.scripts_seed
Better: single file at backend/scripts/seed.py run as:
  cd d:\\p\\school && python backend/scripts/seed.py
"""
import asyncio
import os
import sys

# Add backend parent to path so `app` resolves
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from app.auth_utils import hash_password
from app.config import settings
from app.database import get_db


async def main():
    os.environ.setdefault("JWT_SECRET", settings.jwt_secret)
    db = get_db()
    await db.users.create_index("username", unique=True)
    await db.attendance.create_index([("studentId", 1), ("date", 1)], unique=True)

    await db.school_settings.update_one(
        {"key": "default"},
        {
            "$set": {
                "key": "default",
                "schoolName": "Demo Public School",
                "logoUrl": None,
                "currentSession": "2025-26",
            }
        },
        upsert=True,
    )

    if not await db.users.find_one({"username": "admin"}):
        await db.users.insert_one(
            {
                "username": "admin",
                "passwordHash": hash_password("admin"),
                "role": "admin",
                "displayName": "Administrator",
            }
        )
        print("Created admin / admin")
    else:
        print("admin user already exists")

    # Demo teacher (class teacher)
    t_user = await db.users.find_one({"username": "teacher"})
    if not t_user:
        uid = await db.users.insert_one(
            {
                "username": "teacher",
                "passwordHash": hash_password("teacher"),
                "role": "teacher",
                "displayName": "Demo Teacher",
            }
        )
        tid = await db.teachers.insert_one(
            {
                "name": "Demo Teacher",
                "userId": uid.inserted_id,
                "subjectAssignments": [],
            }
        )
        await db.users.update_one({"_id": uid.inserted_id}, {"$set": {"teacherId": tid.inserted_id}})
        t_oid = tid.inserted_id
        print("Created teacher / teacher")
    else:
        t_oid = t_user.get("teacherId")
        if not t_oid:
            print("teacher user exists but no teacherId; fix manually")
            return

    cid = None
    cl = await db.classes.find_one({"className": "10th A"})
    if not cl:
        ins = await db.classes.insert_one({"className": "10th A", "classTeacherId": t_oid})
        cid = ins.inserted_id
        print("Created class 10th A")
    else:
        cid = cl["_id"]
        await db.classes.update_one({"_id": cid}, {"$set": {"classTeacherId": t_oid}})
        print("Updated class 10th A class teacher")

    # Subject assignments for teacher
    await db.teachers.update_one(
        {"_id": t_oid},
        {
            "$set": {
                "subjectAssignments": [
                    {"classId": cid, "subjectName": "Mathematics"},
                    {"classId": cid, "subjectName": "Science"},
                ]
            }
        },
    )

    if not await db.students.find_one({"rollNo": "101"}):
        sid = await db.students.insert_one(
            {"name": "Demo Student", "rollNo": "101", "classId": cid}
        )
        su = await db.users.insert_one(
            {
                "username": "student",
                "passwordHash": hash_password("student"),
                "role": "student",
                "studentId": sid.inserted_id,
                "displayName": "Demo Student",
            }
        )
        await db.students.update_one({"_id": sid.inserted_id}, {"$set": {"userId": su.inserted_id}})
        print("Created student / student")
    else:
        print("Demo student already exists")

    # Sample timetable + exam
    if await db.timetable_entries.count_documents({"scope": "class", "classId": cid}) == 0:
        await db.timetable_entries.insert_many(
            [
                {
                    "scope": "class",
                    "classId": cid,
                    "day": "Monday",
                    "time": "09:00",
                    "subject": "Mathematics",
                },
                {
                    "scope": "class",
                    "classId": cid,
                    "day": "Monday",
                    "time": "10:00",
                    "subject": "Science",
                },
            ]
        )
        print("Inserted sample class timetable")

    if await db.exams.count_documents({"classId": cid}) == 0:
        await db.exams.insert_one(
            {
                "name": "Unit Test 1",
                "eventName": "Unit Test 1",
                "date": "2026-04-15",
                "classId": cid,
                "subject": "",
                "session": "2025-26",
            }
        )
        print("Inserted sample exam")

    print("Seed done.")


if __name__ == "__main__":
    asyncio.run(main())
