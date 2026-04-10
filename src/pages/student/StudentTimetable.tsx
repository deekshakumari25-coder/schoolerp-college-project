import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Row {
  _id: string;
  day: string;
  time: string;
  subject: string;
  room?: string;
}

export default function StudentTimetable() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api
      .get<Row[]>('/api/student/timetable')
      .then(({ data }) => setRows(data))
      .catch(console.error);
  }, []);

  if (!rows.length) return <p className="text-zinc-500">No timetable published for your class.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Class timetable</h2>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r._id}
            className="flex justify-between items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div>
              <span className="font-medium">{r.subject}</span>
              <span className="text-zinc-500 text-sm ml-2">{r.day}</span>
            </div>
            <span className="text-violet-700 dark:text-violet-400 text-sm font-medium">{r.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
