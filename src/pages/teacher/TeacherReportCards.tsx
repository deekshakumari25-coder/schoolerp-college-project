import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface Stu {
  _id: string;
  name: string;
  rollNo: string;
}

export default function TeacherReportCards() {
  const [students, setStudents] = useState<Stu[]>([]);

  useEffect(() => {
    api
      .get<Stu[]>('/api/teacher/my-class/students')
      .then(({ data }) => setStudents(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Report cards</h2>
      <p className="text-sm text-zinc-500">Choose a student to view or print their report card.</p>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s._id}>
            <Link
              to={`/teacher/report-cards/${s._id}`}
              className="block p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-zinc-500 text-sm ml-2">Roll {s.rollNo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
