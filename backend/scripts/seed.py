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
                "schoolName": "SH School",
                "logoUrl": "/school_logo.png",
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
    teachers_data = [
        ("smith", "John Smith", ["Mathematics", "Physics"]),
        ("davis", "Sarah Davis", ["Literature", "History"]),
        ("miller", "Robert Miller", ["Computer Science", "Mathematics"]),
        ("wilson", "Emma Wilson", ["Biology", "Chemistry"])
    ]
    
    teacher_ids = []
    teacher_user_ids = []
    
    for username, name, subjects in teachers_data:
        u_res = await db.users.insert_one({
            "username": username,
            "passwordHash": hash_password("password"),
            "role": "teacher",
            "displayName": name,
        })
        t_res = await db.teachers.insert_one({
            "name": name,
            "userId": u_res.inserted_id,
            "subjectAssignments": []
        })
        await db.users.update_one({"_id": u_res.inserted_id}, {"$set": {"teacherId": t_res.inserted_id}})
        teacher_ids.append(t_res.inserted_id)
        teacher_user_ids.append(u_res.inserted_id)

    print("Creating Classes...")
    class_10a = await db.classes.insert_one({"className": "10th Grade A", "classTeacherId": teacher_ids[0]})
    class_10b = await db.classes.insert_one({"className": "10th Grade B", "classTeacherId": teacher_ids[1]})
    class_11a = await db.classes.insert_one({"className": "11th Grade A", "classTeacherId": teacher_ids[2]})
    class_11b = await db.classes.insert_one({"className": "11th Grade B", "classTeacherId": teacher_ids[3]})
    classes = [class_10a.inserted_id, class_10b.inserted_id, class_11a.inserted_id, class_11b.inserted_id]

    print("Assigning Subjects to Teachers...")
    # John teaches 10A Math, Physics. Also 11A Physics.
    await db.teachers.update_one({"_id": teacher_ids[0]}, {"$set": {"subjectAssignments": [
        {"classId": class_10a.inserted_id, "subjectName": "Mathematics"},
        {"classId": class_10a.inserted_id, "subjectName": "Physics"},
        {"classId": class_11a.inserted_id, "subjectName": "Physics"},
    ]}})

    # Sarah teaches 10B Lit, History. Also 11B Lit.
    await db.teachers.update_one({"_id": teacher_ids[1]}, {"$set": {"subjectAssignments": [
        {"classId": class_10b.inserted_id, "subjectName": "Literature"},
        {"classId": class_10b.inserted_id, "subjectName": "History"},
        {"classId": class_11b.inserted_id, "subjectName": "Literature"},
    ]}})
    
    # Robert teaches 11A CS, Math. Also 10B Math.
    await db.teachers.update_one({"_id": teacher_ids[2]}, {"$set": {"subjectAssignments": [
        {"classId": class_11a.inserted_id, "subjectName": "Computer Science"},
        {"classId": class_11a.inserted_id, "subjectName": "Mathematics"},
        {"classId": class_10b.inserted_id, "subjectName": "Mathematics"},
    ]}})
    
    # Emma teaches 11B Bio, Chem. Also 10A Bio.
    await db.teachers.update_one({"_id": teacher_ids[3]}, {"$set": {"subjectAssignments": [
        {"classId": class_11b.inserted_id, "subjectName": "Biology"},
        {"classId": class_11b.inserted_id, "subjectName": "Chemistry"},
        {"classId": class_10a.inserted_id, "subjectName": "Biology"},
    ]}})

    print("Creating Students...")
    students_data = [
        # 10A
        ("alice", "Alice Johnson", "10A-01", classes[0]),
        ("bob", "Bob Smith", "10A-02", classes[0]),
        ("ethan", "Ethan Hunt", "10A-03", classes[0]),
        # 10B
        ("charlie", "Charlie Brown", "10B-01", classes[1]),
        ("daisy", "Daisy Miller", "10B-02", classes[1]),
        ("fiona", "Fiona Gallagher", "10B-03", classes[1]),
        # 11A
        ("george", "George Lucas", "11A-01", classes[2]),
        ("harry", "Harry Potter", "11A-02", classes[2]),
        # 11B
        ("irene", "Irene Adler", "11B-01", classes[3]),
        ("jack", "Jack Sparrow", "11B-02", classes[3]),
        ("kyle", "Kyle Broflovski", "11B-03", classes[3]),
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
    timetable_entries = [
        # 10A
        {"scope": "class", "classId": classes[0], "day": "Monday", "time": "09:00", "subject": "Mathematics", "room": "Room 101", "teacherId": teacher_ids[0]},
        {"scope": "class", "classId": classes[0], "day": "Monday", "time": "10:00", "subject": "Physics", "room": "Room 101", "teacherId": teacher_ids[0]},
        {"scope": "class", "classId": classes[0], "day": "Tuesday", "time": "09:00", "subject": "Biology", "room": "Lab 1", "teacherId": teacher_ids[3]},
        # 10B
        {"scope": "class", "classId": classes[1], "day": "Tuesday", "time": "09:00", "subject": "Literature", "room": "Room 102", "teacherId": teacher_ids[1]},
        {"scope": "class", "classId": classes[1], "day": "Tuesday", "time": "10:00", "subject": "History", "room": "Room 102", "teacherId": teacher_ids[1]},
        {"scope": "class", "classId": classes[1], "day": "Wednesday", "time": "09:00", "subject": "Mathematics", "room": "Room 102", "teacherId": teacher_ids[2]},
        # 11A
        {"scope": "class", "classId": classes[2], "day": "Wednesday", "time": "10:00", "subject": "Computer Science", "room": "Computer Lab", "teacherId": teacher_ids[2]},
        {"scope": "class", "classId": classes[2], "day": "Thursday", "time": "09:00", "subject": "Mathematics", "room": "Room 201", "teacherId": teacher_ids[2]},
        {"scope": "class", "classId": classes[2], "day": "Thursday", "time": "10:00", "subject": "Physics", "room": "Room 201", "teacherId": teacher_ids[0]},
        # 11B
        {"scope": "class", "classId": classes[3], "day": "Friday", "time": "09:00", "subject": "Biology", "room": "Lab 1", "teacherId": teacher_ids[3]},
        {"scope": "class", "classId": classes[3], "day": "Friday", "time": "10:00", "subject": "Chemistry", "room": "Lab 2", "teacherId": teacher_ids[3]},
        {"scope": "class", "classId": classes[3], "day": "Friday", "time": "11:00", "subject": "Literature", "room": "Room 202", "teacherId": teacher_ids[1]},
    ]
    await db.timetable_entries.insert_many(timetable_entries)

    print("Creating Exams...")
    exams = [
        {"name": "Midterms", "eventName": "Midterms", "date": "2026-05-10", "classId": classes[0], "session": "2025-26", "subject": "Mathematics"},
        {"name": "Midterms", "eventName": "Midterms", "date": "2026-05-12", "classId": classes[0], "session": "2025-26", "subject": "Physics"},
        {"name": "Midterms", "eventName": "Midterms", "date": "2026-05-10", "classId": classes[1], "session": "2025-26", "subject": "Literature"},
        {"name": "Midterms", "eventName": "Midterms", "date": "2026-05-12", "classId": classes[2], "session": "2025-26", "subject": "Computer Science"},
        {"name": "Midterms", "eventName": "Midterms", "date": "2026-05-15", "classId": classes[3], "session": "2025-26", "subject": "Biology"}
    ]
    e_res = await db.exams.insert_many(exams)
    exams_ids = e_res.inserted_ids

    print("Creating Marks...")
    # Alice and Bob and Ethan (10A)
    marks_data = []
    
    # 10A Math & Physics
    for sid in student_ids[0:3]:
        marks_data.append({"examId": exams_ids[0], "studentId": sid, "subjectName": "Mathematics", "marksObtained": 85, "maxMarks": 100, "enteredBy": teacher_ids[0]})
        marks_data.append({"examId": exams_ids[1], "studentId": sid, "subjectName": "Physics", "marksObtained": 78, "maxMarks": 100, "enteredBy": teacher_ids[0]})
        
    # 10B Lit
    for sid in student_ids[3:6]:
        marks_data.append({"examId": exams_ids[2], "studentId": sid, "subjectName": "Literature", "marksObtained": 92, "maxMarks": 100, "enteredBy": teacher_ids[1]})
        
    # 11A CS
    for sid in student_ids[6:8]:
        marks_data.append({"examId": exams_ids[3], "studentId": sid, "subjectName": "Computer Science", "marksObtained": 88, "maxMarks": 100, "enteredBy": teacher_ids[2]})
        
    # 11B Bio
    for sid in student_ids[8:11]:
        marks_data.append({"examId": exams_ids[4], "studentId": sid, "subjectName": "Biology", "marksObtained": 95, "maxMarks": 100, "enteredBy": teacher_ids[3]})

    await db.marks.insert_many(marks_data)

    print("Seed process completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
