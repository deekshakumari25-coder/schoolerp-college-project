export interface ReportCardData {
  schoolName: string;
  logoUrl: string | null;
  currentSession: string;
  student: { name: string; rollNo: string; className: string };
  classTeacherName: string;
  exams: { _id: string; name: string; date: string }[];
  subjects: string[];
  grid: Record<string, Record<string, { obtained: number; max: number }>>;
  rowTotals: Record<string, { obtained: number; max: number }>;
  grandTotal: { obtained: number; max: number };
  percentage: number | null;
}
