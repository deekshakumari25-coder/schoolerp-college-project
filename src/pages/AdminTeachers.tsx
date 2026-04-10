import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TRow {
  _id: string;
  name: string;
  username: string | null;
  subjectAssignments: { classId: string; subjectName: string }[];
}

export default function AdminTeachers() {
  const [rows, setRows] = useState<TRow[]>([]);
  const [classes, setClasses] = useState<{ _id: string; className: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectName, setSubjectName] = useState('');

  async function load() {
    const [t, c] = await Promise.all([api.get<TRow[]>('/api/admin/teachers'), api.get('/api/classes')]);
    setRows(t.data);
    setClasses(c.data);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [t, c] = await Promise.all([
          api.get<TRow[]>('/api/admin/teachers'),
          api.get('/api/classes'),
        ]);
        if (!cancelled) {
          setRows(t.data);
          setClasses(c.data);
        }
      } catch {
        console.error();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const subjectAssignments =
      classId && subjectName.trim() ? [{ classId, subjectName: subjectName.trim() }] : [];
    try {
      await api.post('/api/admin/teachers', { name, username, password, subjectAssignments });
      setName('');
      setUsername('');
      setPassword('');
      setClassId('');
      setSubjectName('');
      load();
    } catch {
      alert('Could not create teacher (duplicate username?)');
    }
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Teachers</h2>

      <form
        onSubmit={submit}
        className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assign class (optional)</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          >
            <option value="">—</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject (optional)</label>
          <input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Mathematics"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Add teacher
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Subjects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r._id}>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.username}</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">
                  {r.subjectAssignments?.length
                    ? r.subjectAssignments.map((a) => `${a.subjectName} (${a.classId})`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
