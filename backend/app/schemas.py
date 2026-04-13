from typing import Any, Literal

from pydantic import BaseModel, Field


class LoginBody(BaseModel):
    username: str
    password: str


class ChangePasswordBody(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6)


class TokenResponse(BaseModel):
    success: bool = True
    token: str
    username: str
    role: Literal["admin", "teacher", "student"]
    displayName: str
    isClassTeacher: bool = False
    homeroomClassId: str | None = None
    subjectsTaught: list[dict[str, str]] = []


class SchoolSettingsOut(BaseModel):
    schoolName: str
    logoUrl: str | None = None
    currentSession: str
    sessionStartDate: str | None = None
    sessionEndDate: str | None = None
    schoolWebsite: str | None = None
    schoolAddress: str | None = None
    holidayDates: list[str] = Field(default_factory=list)


class SchoolSettingsUpdate(BaseModel):
    schoolName: str | None = None
    logoUrl: str | None = None
    currentSession: str | None = None
    sessionStartDate: str | None = None
    sessionEndDate: str | None = None
    schoolWebsite: str | None = None
    schoolAddress: str | None = None
    holidayDates: list[str] | None = None


class TeacherCreate(BaseModel):
    name: str
    username: str
    password: str = Field(min_length=6)
    subjectAssignments: list[dict[str, str]] = []


class TeacherUpdate(BaseModel):
    name: str | None = None
    subjectAssignments: list[dict[str, str]] | None = None


class ClassCreate(BaseModel):
    className: str
    classTeacherId: str | None = None


class ClassUpdate(BaseModel):
    className: str | None = None
    classTeacherId: str | None = None


class ClassOut(BaseModel):
    model_config = {"populate_by_name": True}

    _id: str
    className: str
    classTeacherId: str | None = None
    teacherName: str | None = None


class StudentCreate(BaseModel):
    name: str
    rollNo: str
    classId: str
    fatherName: str | None = None
    motherName: str | None = None
    address: str | None = None
    dob: str | None = None
    username: str | None = None
    password: str | None = None


class StudentUpdate(BaseModel):
    name: str | None = None
    rollNo: str | None = None
    classId: str | None = None
    fatherName: str | None = None
    motherName: str | None = None
    address: str | None = None
    dob: str | None = None


class TimetableCreate(BaseModel):
    classId: str
    teacherId: str
    day: str
    subject: str
    time: str
    room: str | None = None


class ExamCreate(BaseModel):
    eventName: str
    date: str
    classId: str
    subject: str | None = None
    session: str | None = None


class ExamUpdate(BaseModel):
    eventName: str | None = None
    date: str | None = None
    subject: str | None = None


class AttendanceBulkBody(BaseModel):
    classId: str
    date: str
    entries: list[dict[str, Any]]


class MarksBulkBody(BaseModel):
    examId: str
    entries: list[dict[str, Any]]
