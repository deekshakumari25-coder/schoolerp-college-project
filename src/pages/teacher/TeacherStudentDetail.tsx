import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';

export default function TeacherStudentDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState<{
    name: string;
    rollNo: string;
    fatherName?: string;
    motherName?: string;
    address?: string;
    dob?: string;
    subjectTeacherFor: string[];
  } | null>(null);

  const formatDob = (dobStr?: string) => {
    if (!dobStr) return '—';
    const d = new Date(dobStr);
    if (isNaN(d.getTime())) return dobStr;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

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
        <p className="text-zinc-500 mt-1">Roll Number: {data.rollNo}</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1 font-medium tracking-wide uppercase">Date of Birth</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDob(data.dob)}</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1 font-medium tracking-wide uppercase">Address</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{data.address || '—'}</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1 font-medium tracking-wide uppercase">Father's Name</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{data.fatherName || '—'}</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1 font-medium tracking-wide uppercase">Mother's Name</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{data.motherName || '—'}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Subject teacher for</h3>
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
