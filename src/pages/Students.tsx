import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { IconPlus } from '@tabler/icons-react';

interface ClassRef {
  _id: string;
  className: string;
}

interface StudentRow {
  _id: string;
  name: string;
  rollNo: string;
  classId?: ClassRef;
}

export default function Students() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [classId, setClassId] = useState('');
  const [stuUser, setStuUser] = useState('');
  const [stuPass, setStuPass] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/classes'),
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/api/admin/students/${editingId}`, { name, rollNo, classId });
        setEditingId(null);
      } else {
        await api.post('/api/students', {
          name,
          rollNo,
          classId,
          username: stuUser || undefined,
          password: stuPass || undefined,
        });
      }
      setShowAdd(false);
      setName('');
      setRollNo('');
      setClassId('');
      setStuUser('');
      setStuPass('');
      fetchData();
    } catch {
      alert(editingId ? 'Error updating student' : 'Error saving student');
    }
  }

  function startEdit(s: StudentRow) {
    setEditingId(s._id);
    setName(s.name);
    setRollNo(s.rollNo);
    setClassId(s.classId?._id || '');
    setStuUser('');
    setStuPass('');
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAdd(false);
    setName('');
    setRollNo('');
    setClassId('');
    setStuUser('');
    setStuPass('');
  }

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Students</h2>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconPlus className="w-5 h-5 mr-1" />
            Add Student
          </button>
        )}
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="col-span-full flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {editingId ? 'Edit Student' : 'New Student'}
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Roll Number</label>
              <input
                required
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
              <select
                required
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Login username (optional)
                  </label>
                  <input
                    type="text"
                    value={stuUser}
                    onChange={(e) => setStuUser(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Login password (optional)
                  </label>
                  <input
                    type="password"
                    value={stuPass}
                    onChange={(e) => setStuPass(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </>
            )}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 h-[42px]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Roll No</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Class</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                  No students found. Add one above!
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4">{student.rollNo}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {student.classId?.className || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => startEdit(student)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
