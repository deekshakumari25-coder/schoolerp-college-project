"""
Run from repo root: python backend/scripts/seed.py
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

    print("Wiping existing database...")
    await db.users.delete_many({})
    await db.classes.delete_many({})
    await db.students.delete_many({})
    await db.teachers.delete_many({})
    await db.timetable_entries.delete_many({})
    await db.exams.delete_many({})
    await db.attendance.delete_many({})
    await db.marks.delete_many({})
    await db.school_settings.delete_many({})

    print("Creating indexes...")
    await db.users.create_index("username", unique=True)
    await db.attendance.create_index([("studentId", 1), ("date", 1)], unique=True)

    print("Setting up School...")
    await db.school_settings.update_one(
        {"key": "default"},
        {
            "$set": {
                "key": "default",
                "schoolName": "Global Excellence Academy",
                "logoUrl": None,
                "currentSession": "2025-26",
            }
        },
        upsert=True,
    )

    print("Creating Admin...")
    await db.users.insert_one({
        "username": "admin",
        "passwordHash": hash_password("admin"),
        "role": "admin",
        "displayName": "System Admin",
    })

    print("Creating Teachers...")
    # Teachers
    mr_smith = await db.users.insert_one({
        "username": "smith",
        "passwordHash": hash_password("password"),
        "role": "teacher",
        "displayName": "John Smith",
    })
    smith_t = await db.teachers.insert_one({
        "name": "John Smith",
        "userId": mr_smith.inserted_id,
        "subjectAssignments": []
    })
    await db.users.update_one({"_id": mr_smith.inserted_id}, {"$set": {"teacherId": smith_t.inserted_id}})

    ms_davis = await db.users.insert_one({
        "username": "davis",
        "passwordHash": hash_password("password"),
        "role": "teacher",
        "displayName": "Sarah Davis",
    })
    davis_t = await db.teachers.insert_one({
        "name": "Sarah Davis",
        "userId": ms_davis.inserted_id,
        "subjectAssignments": []
    })
    await db.users.update_one({"_id": ms_davis.inserted_id}, {"$set": {"teacherId": davis_t.inserted_id}})

    print("Creating Classes...")
    class_10a = await db.classes.insert_one({"className": "10th Grade A", "classTeacherId": smith_t.inserted_id})
    class_10b = await db.classes.insert_one({"className": "10th Grade B", "classTeacherId": davis_t.inserted_id})

    print("Assigning Subjects to Teachers...")
    await db.teachers.update_one(
        {"_id": smith_t.inserted_id},
        {"$set": {"subjectAssignments": [
            {"classId": class_10a.inserted_id, "subjectName": "Mathematics"},
            {"classId": class_10a.inserted_id, "subjectName": "Physics"},
        ]}}
    )

    await db.teachers.update_one(
        {"_id": davis_t.inserted_id},
        {"$set": {"subjectAssignments": [
            {"classId": class_10b.inserted_id, "subjectName": "Literature"},
            {"classId": class_10b.inserted_id, "subjectName": "History"},
        ]}}
    )

    print("Creating Students...")
    students_data = [
        ("alice", "Alice Johnson", "10A-01", class_10a.inserted_id),
        ("bob", "Bob Smith", "10A-02", class_10a.inserted_id),
        ("charlie", "Charlie Brown", "10B-01", class_10b.inserted_id),
        ("daisy", "Daisy Miller", "10B-02", class_10b.inserted_id)
    ]
    
    student_ids = []
    for username, name, rollNo, cid in students_data:
        s_res = await db.students.insert_one({"name": name, "rollNo": rollNo, "classId": cid})
        student_ids.append(s_res.inserted_id)
        su_res = await db.users.insert_one({
            "username": username,
            "passwordHash": hash_password(username),
            "role": "student",
            "studentId": s_res.inserted_id,
            "displayName": name,
        })
        await db.students.update_one({"_id": s_res.inserted_id}, {"$set": {"userId": su_res.inserted_id}})

    print("Creating Timetable...")
    await db.timetable_entries.insert_many([
        {"scope": "class", "classId": class_10a.inserted_id, "day": "Monday", "time": "09:00", "subject": "Mathematics", "room": "Room 101"},
        {"scope": "class", "classId": class_10a.inserted_id, "day": "Monday", "time": "10:00", "subject": "Physics", "room": "Room 101"},
        {"scope": "class", "classId": class_10b.inserted_id, "day": "Tuesday", "time": "09:00", "subject": "Literature", "room": "Room 102"},
        {"scope": "class", "classId": class_10b.inserted_id, "day": "Tuesday", "time": "10:00", "subject": "History", "room": "Room 102"},
    ])

    print("Creating Exams...")
    exam1 = await db.exams.insert_one({"name": "Midterm Exams", "eventName": "Midterm Exams", "date": "2026-05-10", "classId": class_10a.inserted_id, "session": "2025-26"})
    exam2 = await db.exams.insert_one({"name": "Midterm Exams", "eventName": "Midterm Exams", "date": "2026-05-11", "classId": class_10b.inserted_id, "session": "2025-26"})

    print("Creating Marks...")
    # Alice and Bob (10A)
    await db.marks.insert_many([
        {"examId": exam1.inserted_id, "studentId": student_ids[0], "subjectName": "Mathematics", "marksObtained": 95, "maxMarks": 100, "enteredBy": smith_t.inserted_id},
        {"examId": exam1.inserted_id, "studentId": student_ids[0], "subjectName": "Physics", "marksObtained": 88, "maxMarks": 100, "enteredBy": smith_t.inserted_id},
        {"examId": exam1.inserted_id, "studentId": student_ids[1], "subjectName": "Mathematics", "marksObtained": 78, "maxMarks": 100, "enteredBy": smith_t.inserted_id},
        {"examId": exam1.inserted_id, "studentId": student_ids[1], "subjectName": "Physics", "marksObtained": 82, "maxMarks": 100, "enteredBy": smith_t.inserted_id},
    ])

    # Charlie and Daisy (10B)
    await db.marks.insert_many([
        {"examId": exam2.inserted_id, "studentId": student_ids[2], "subjectName": "Literature", "marksObtained": 91, "maxMarks": 100, "enteredBy": davis_t.inserted_id},
        {"examId": exam2.inserted_id, "studentId": student_ids[2], "subjectName": "History", "marksObtained": 85, "maxMarks": 100, "enteredBy": davis_t.inserted_id},
        {"examId": exam2.inserted_id, "studentId": student_ids[3], "subjectName": "Literature", "marksObtained": 96, "maxMarks": 100, "enteredBy": davis_t.inserted_id},
        {"examId": exam2.inserted_id, "studentId": student_ids[3], "subjectName": "History", "marksObtained": 90, "maxMarks": 100, "enteredBy": davis_t.inserted_id},
    ])

    print("Seed process completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
