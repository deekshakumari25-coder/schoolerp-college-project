import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { IconPlus, IconClock, IconTrash } from '@tabler/icons-react';

interface ClassRef {
  _id: string;
  className: string;
}

interface TimetableRow {
  _id: string;
  day: string;
  time: string;
  subject: string;
  classId?: ClassRef | null;
  teacherId?: TeacherRow | null;
  room?: string;
}

interface TeacherRow {
  _id: string;
  name: string;
  subjectAssignments: { classId: string; subjectName: string }[];
}

export default function Timetable() {
  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [classes, setClasses] = useState<ClassRef[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [day, setDay] = useState('Monday');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tableRes, classRes, teachRes] = await Promise.all([
        api.get('/api/timetable'),
        api.get('/api/classes'),
        api.get('/api/admin/teachers'),
      ]);
      setTimetable(tableRes.data);
      setClasses(classRes.data);
      setTeachers(teachRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/timetable', {
        classId,
        teacherId,
        day,
        subject,
        time,
      });
      setShowAdd(false);
      setSubject('');
      setTime('');
      fetchData();
    } catch {
      alert('Error saving timetable entry');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this slot?')) return;
    try {
      await api.delete(`/api/timetable/${id}`);
      fetchData();
    } catch {
      alert('Delete failed');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Timetable</h2>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <IconPlus className="w-5 h-5 mr-1" />
          Add slot
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
              <select
                required
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setTeacherId('');
                  setSubject('');
                }}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Teacher</label>
              <select
                required
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  const teacher = teachers.find((t) => t._id === e.target.value);
                  const subjects = teacher?.subjectAssignments.filter((a) => a.classId === classId) || [];
                  if (subjects.length === 1) setSubject(subjects[0].subjectName);
                  else setSubject('');
                }}
                disabled={!classId}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
              >
                <option value="">Select teacher</option>
                {teachers
                  .filter((t) => t.subjectAssignments?.some((a) => a.classId === classId))
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Day</label>
              <select
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
              <input
                required
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white pt-1.5"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 h-[42px]"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Filter by class:</span>
        <div className="relative">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>
        </div>
        {filterClass && (
          <button
            onClick={() => setFilterClass('')}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {classes.filter(c => !filterClass || c._id === filterClass).map(c => {
          const classTimetable = timetable.filter(t => t.classId?._id === c._id);
          if (classTimetable.length === 0) return null;
          
          return (
            <div key={c._id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Class {c.className}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {days.map((d) => {
                  const dayEntries = classTimetable.filter(t => t.day === d).sort((a, b) => a.time.localeCompare(b.time));
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={d} className="bg-zinc-50 dark:bg-zinc-800/20 rounded-lg border border-zinc-100 dark:border-zinc-800/80 overflow-hidden">
                      <div className="bg-zinc-100 dark:bg-zinc-800/60 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {d}
                      </div>
                      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                        {dayEntries.map((entry) => (
                          <li key={entry._id} className="px-3 py-2 flex items-center justify-between text-sm">
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">{entry.subject}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {entry.teacherId?.name || 'No teacher assigned'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                                <IconClock className="w-3.5 h-3.5 mr-1" />
                                {entry.time}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry._id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        
      </div>
    </div>
  );
}
