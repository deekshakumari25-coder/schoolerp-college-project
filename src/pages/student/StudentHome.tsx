import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface Me {
  name: string;
  rollNo: string;
  className: string;
  classTeacherName: string;
  currentSession: string;
  schoolName: string;
}

export default function StudentHome() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api
      .get<Me>('/api/student/me')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  if (!me) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">{me.schoolName}</p>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Hello, {me.name}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Class <strong>{me.className}</strong> · Roll {me.rollNo}
        </p>
        <p className="text-sm text-zinc-500 mt-1">Session {me.currentSession}</p>
        <p className="text-sm mt-2">
          Class teacher: <span className="font-medium text-zinc-800 dark:text-zinc-200">{me.classTeacherName || '—'}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/student/timetable"
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium"
        >
          Timetable
        </Link>
        <Link
          to="/student/marks"
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium"
        >
          Marks
        </Link>
        <Link
          to="/student/report-card"
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium"
        >
          Report card
        </Link>
        <Link
          to="/student/attendance"
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium"
        >
          Attendance
        </Link>
      </div>
    </div>
  );
}
