import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { IconPlus, IconCalendarEvent } from '@tabler/icons-react';

interface ClassRef {
  _id: string;
  className: string;
}

interface ExamRow {
  _id: string;
  eventName: string;
  date: string;
  subject?: string;
  classId?: ClassRef;
}

export default function Exams() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [classes, setClasses] = useState<ClassRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [examsRes, classesRes] = await Promise.all([api.get('/api/exams'), api.get('/api/classes')]);
      const sorted = [...examsRes.data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setExams(sorted);
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
      await api.post('/api/exams', { eventName, date, classId, subject: subject || undefined });
      setShowAdd(false);
      setEventName('');
      setDate('');
      setSubject('');
      fetchData();
    } catch {
      alert('Error saving exam');
    }
  }

  if (loading) return <div>Loading exams...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Examinations</h2>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <IconPlus className="w-5 h-5 mr-1" />
          Schedule exam
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Exam name</label>
              <input
                placeholder="e.g. Midterms"
                required
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white pt-1.5"
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
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Subject (optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 h-[42px]"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {exams.length === 0 ? (
            <li className="px-6 py-8 text-center text-zinc-500">No exams. Schedule one!</li>
          ) : (
            exams.map((exam) => {
              const examDate = new Date(exam.date);
              const isPast = examDate < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <li
                  key={exam._id}
                  className={`p-6 flex items-center justify-between ${isPast ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'} transition-colors`}
                >
                  <div className="flex items-start">
                    <div
                      className={`mt-1 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isPast ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}
                    >
                      <IconCalendarEvent className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                        {exam.eventName}
                        {isPast && (
                          <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded-full border border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                            Completed
                          </span>
                        )}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                        {exam.subject ? (
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{exam.subject}</span>
                        ) : (
                          <span className="text-zinc-500">All subjects</span>
                        )}{' '}
                        · Class {exam.classId?.className || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${isPast ? 'text-zinc-500' : 'text-purple-600 dark:text-purple-400'}`}
                    >
                      {examDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
