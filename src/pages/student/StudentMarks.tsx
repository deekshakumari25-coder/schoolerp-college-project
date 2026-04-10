import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Row {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  exam: { eventName: string; date: string } | null;
}

export default function StudentMarks() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api
      .get<Row[]>('/api/student/marks')
      .then(({ data }) => setRows(data))
      .catch(console.error);
  }, []);

  if (!rows.length) return <p className="text-zinc-500">No marks recorded yet.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Marks</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="text-left p-3">Subject</th>
              <th className="text-left p-3">Exam</th>
              <th className="text-right p-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="p-3 font-medium">{r.subjectName}</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">
                  {r.exam ? `${r.exam.eventName} (${r.exam.date})` : '—'}
                </td>
                <td className="p-3 text-right">
                  {r.marksObtained} / {r.maxMarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
