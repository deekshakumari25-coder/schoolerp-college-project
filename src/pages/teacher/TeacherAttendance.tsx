import { useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';

interface Stu {
  _id: string;
  name: string;
  rollNo: string;
}

interface DayMeta {
  date: string;
  weekdayShort: string;
  isWeekend: boolean;
  isHoliday: boolean;
}

export default function TeacherAttendance() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState<Stu[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<{
    days: string[];
    dayMeta?: DayMeta[];
    students: Stu[];
    cells: Record<string, Record<string, string>>;
  } | null>(null);

  const classId = user?.homeroomClassId;

  useEffect(() => {
    api
      .get<Stu[]>('/api/teacher/my-class/students')
      .then(({ data }) => {
        setStudents(data);
        const init: Record<string, string> = {};
        data.forEach((s) => {
          init[s._id] = 'P';
        });
        setStatusById(init);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await api.get('/api/teacher/attendance/report', {
          params: { month, year, classId },
        });
        if (!cancelled) setReport(data);
      } catch {
        console.error();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [month, year, classId]);

  async function saveDay(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) return;
    const entries = students.map((s) => ({ studentId: s._id, status: statusById[s._id] || 'P' }));
    try {
      await api.post('/api/teacher/attendance', { classId, date, entries });
      const { data } = await api.get('/api/teacher/attendance/report', {
        params: { month, year, classId },
      });
      setReport(data);
      alert('Attendance saved.');
    } catch {
      alert('Failed to save');
    }
  }

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance</h2>

      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <h3 className="font-semibold">Mark for a day</h3>
        <form onSubmit={saveDay} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {students.map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-4">
                <span className="text-sm">
                  {s.rollNo} — {s.name}
                </span>
                <select
                  value={statusById[s._id] || 'P'}
                  onChange={(e) => setStatusById((prev) => ({ ...prev, [s._id]: e.target.value }))}
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                >
                  <option value="P">Present</option>
                  <option value="A">Absent</option>
                  <option value="L">Late</option>
                </select>
              </div>
            ))}
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Save day
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <h3 className="font-semibold w-full">Monthly report</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 w-28 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>
        </div>
        {report && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="text-xs whitespace-nowrap">
              <thead>
                <tr>
                  <th className="p-2 text-left sticky left-0 bg-zinc-50 dark:bg-zinc-800">Student</th>
                  {report.days.map((d) => {
                    const meta = report.dayMeta?.find((m) => m.date === d);
                    const off = meta?.isWeekend || meta?.isHoliday;
                    return (
                      <th
                        key={d}
                        className={`p-1 border-l border-zinc-200 dark:border-zinc-700 align-bottom ${
                          off ? 'bg-violet-100/80 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200' : ''
                        }`}
                        title={meta ? `${meta.weekdayShort}${meta.isHoliday ? ' · Holiday' : ''}` : d}
                      >
                        <div className="font-semibold leading-tight">{d.slice(8)}</div>
                        <div className="text-[10px] font-normal opacity-80">{meta?.weekdayShort ?? ''}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {report.students.map((s) => (
                  <tr key={s._id}>
                    <td className="p-2 sticky left-0 bg-white dark:bg-zinc-900 font-medium">{s.rollNo}</td>
                    {report.days.map((d) => {
                      const meta = report.dayMeta?.find((m) => m.date === d);
                      const off = meta?.isWeekend || meta?.isHoliday;
                      return (
                        <td
                          key={d}
                          className={`p-1 text-center border-l border-zinc-100 dark:border-zinc-800 ${
                            off ? 'bg-violet-50/90 dark:bg-violet-950/25' : ''
                          }`}
                        >
                          {report.cells[s._id]?.[d] ?? ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-zinc-500 px-3 py-2 border-t border-zinc-200 dark:border-zinc-800">
              All calendar days are shown. Violet columns are Saturday, Sunday, or a school holiday (set under Admin → School).
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
