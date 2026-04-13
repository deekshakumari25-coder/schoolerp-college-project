export type Role = 'admin' | 'teacher' | 'student';

export interface UserMe {
  username: string;
  role: Role;
  displayName: string;
  isClassTeacher: boolean;
  homeroomClassId: string | null;
  subjectsTaught: { classId: string; subjectName: string }[];
}

export interface SchoolSettings {
  schoolName: string;
  logoUrl: string | null;
  currentSession: string;
  sessionStartDate?: string | null;
  sessionEndDate?: string | null;
  schoolWebsite?: string | null;
  schoolAddress?: string | null;
  /** ISO YYYY-MM-DD; used in attendance grids */
  holidayDates?: string[];
}
