import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';

export default function TeacherStudentDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState<{
    name: string;
    rollNo: string;
    subjectTeacherFor: string[];
  } | null>(null);

  useEffect(() => {
    if (!studentId) return;
    api
      .get(`/api/teacher/my-class/students/${studentId}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null));
  }, [studentId]);

  if (!data) return <p className="text-zinc-500">Loading or not found…</p>;

  return (
    <div className="space-y-4">
      <Link to="/teacher/my-class" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to class list
      </Link>
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{data.name}</h2>
        <p className="text-zinc-500 mt-1">Roll {data.rollNo}</p>
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject teacher for</p>
          <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 mt-1">
            {data.subjectTeacherFor?.length ? (
              data.subjectTeacherFor.map((s) => <li key={s}>{s}</li>)
            ) : (
              <li>—</li>
            )}
          </ul>
        </div>
        <Link
          to={`/teacher/report-cards/${studentId}`}
          className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          View report card
        </Link>
      </div>
    </div>
  );
}
