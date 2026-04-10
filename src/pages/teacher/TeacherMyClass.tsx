import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface Stu {
  _id: string;
  name: string;
  rollNo: string;
}

export default function TeacherMyClass() {
  const [students, setStudents] = useState<Stu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Stu[]>('/api/teacher/my-class/students')
      .then(({ data }) => setStudents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">My class</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="text-left p-3">Roll</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {students.map((s) => (
              <tr key={s._id}>
                <td className="p-3">{s.rollNo}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">
                  <Link
                    to={`/teacher/my-class/${s._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
