import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { IconPlus, IconFilter, IconX, IconUser, IconChevronDown } from '@tabler/icons-react';

interface ClassRef {
  _id: string;
  className: string;
}

interface StudentRow {
  _id: string;
  name: string;
  rollNo: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  dob?: string;
  classId?: ClassRef;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function formatDate(dob?: string) {
  if (!dob) return '—';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return dob;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Students() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [viewStudent, setViewStudent] = useState<StudentRow | null>(null);

  // form state
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [classId, setClassId] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
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

  function resetForm() {
    setName(''); setRollNo(''); setClassId('');
    setFatherName(''); setMotherName(''); setAddress(''); setDob('');
    setStuUser(''); setStuPass('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/api/students/${editingId}`, {
          name, rollNo, classId, fatherName, motherName, address, dob,
        });
        setEditingId(null);
      } else {
        const res = await api.post('/api/students', {
          name, rollNo, classId, fatherName, motherName, address, dob,
          username: stuUser || undefined,
          password: stuPass || undefined,
        });
        // Show detail after adding
        setViewStudent(res.data);
      }
      setShowAdd(false);
      resetForm();
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
    setFatherName(s.fatherName || '');
    setMotherName(s.motherName || '');
    setAddress(s.address || '');
    setDob(s.dob || '');
    setStuUser(''); setStuPass('');
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAdd(false);
    resetForm();
  }

  const filtered = filterClass
    ? students.filter((s) => s.classId?._id === filterClass)
    : students;

  if (loading) return <div className="flex items-center justify-center h-48 text-zinc-500">Loading students…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Students</h2>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            Add Student
          </button>
        )}
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {editingId ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Father's Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's full name"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mother's Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's full name"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-8 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                  </select>
                  <IconChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address — full width */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential address"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Login credentials - only for new students */}
              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Login Username <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={stuUser}
                      onChange={(e) => setStuUser(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Login Password <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={stuPass}
                      onChange={(e) => setStuPass(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                {editingId ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class filter */}
      <div className="flex items-center gap-3">
        <IconFilter className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Filter by class:</span>
        <div className="relative">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 pr-8 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>
          <IconChevronDown className="absolute right-2 top-2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
        {filterClass && (
          <button
            onClick={() => setFilterClass('')}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
          >
            <IconX className="w-3 h-3" /> Clear
          </button>
        )}
        <span className="text-xs text-zinc-400 ml-1">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Students table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Name</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Roll No</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Class</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">Father's Name</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">DOB</th>
              <th className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                  {filterClass ? 'No students in this class.' : 'No students found. Add one above!'}
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{student.rollNo}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {student.classId?.className || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{student.fatherName || '—'}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">{formatDate(student.dob)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button
                      onClick={() => setViewStudent(student)}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
                    >
                      <IconUser className="w-4 h-4" /> View
                    </button>
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

      {/* Student Detail Modal */}
      {viewStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setViewStudent(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <IconUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{viewStudent.name}</h3>
                  <p className="text-sm text-zinc-500">Roll No: {viewStudent.rollNo}</p>
                </div>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Class</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {viewStudent.classId?.className || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Date of Birth</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(viewStudent.dob)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Father's Name</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {viewStudent.fatherName || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-500 mb-0.5">Mother's Name</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {viewStudent.motherName || '—'}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500 mb-0.5">Address</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {viewStudent.address || '—'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setViewStudent(null); startEdit(viewStudent); }}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
