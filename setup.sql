-- Copy and paste this into the Supabase SQL Editor to create your tables

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "className" TEXT NOT NULL,
  "teacherName" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "rollNo" TEXT NOT NULL,
  "classId" UUID REFERENCES classes(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  time TEXT NOT NULL,
  "classId" UUID REFERENCES classes(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventName" TEXT NOT NULL,
  date TEXT NOT NULL,
  subject TEXT NOT NULL,
  "classId" UUID REFERENCES classes(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
