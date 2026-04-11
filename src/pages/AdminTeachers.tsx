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
  const [editingId, setEditingId] = useState<string | null>(null);

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
    try {
      if (editingId) {
        const teacher = rows.find(r => r._id === editingId);
        const newAssignments = [...(teacher?.subjectAssignments || [])];
        if (classId && subjectName.trim()) {
          newAssignments.push({ classId, subjectName: subjectName.trim() });
        }
        await api.patch(`/api/admin/teachers/${editingId}`, { name, subjectAssignments: newAssignments });
        setEditingId(null);
      } else {
        const subjectAssignments = classId && subjectName.trim() ? [{ classId, subjectName: subjectName.trim() }] : [];
        await api.post('/api/admin/teachers', { name, username, password, subjectAssignments });
      }
      setName('');
      setUsername('');
      setPassword('');
      setClassId('');
      setSubjectName('');
      load();
    } catch {
      alert(editingId ? 'Could not update teacher' : 'Could not create teacher (duplicate username?)');
    }
  }

  function startEdit(t: TRow) {
    setEditingId(t._id);
    setName(t.name);
    setUsername(t.username || '');
    setPassword('');
    setClassId('');
    setSubjectName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setUsername('');
    setPassword('');
    setClassId('');
    setSubjectName('');
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Teachers</h2>

      <form
        onSubmit={submit}
        className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="col-span-full mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-zinc-100">
            {editingId ? 'Edit Teacher' : 'Add New Teacher'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        {!editingId && (
          <>
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
          </>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            {editingId ? 'Add class (optional)' : 'Assign class (optional)'}
          </label>
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
            {editingId ? 'Save changes' : 'Add teacher'}
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
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r._id}>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.username}</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">
                  {r.subjectAssignments?.length
                    ? r.subjectAssignments
                        .map((a) => {
                          const className = classes.find((c) => c._id === a.classId)?.className;
                          return className
                            ? `${a.subjectName} (${className})`
                            : a.subjectName;
                        })
                        .join(', ')
                    : '—'}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => startEdit(r)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
