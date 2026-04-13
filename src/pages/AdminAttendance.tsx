import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ClassRef {
  _id: string;
  className: string;
}

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

export default function AdminAttendance() {
  const [classes, setClasses] = useState<ClassRef[]>([]);
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [report, setReport] = useState<{
    days: string[];
    dayMeta?: DayMeta[];
    students: Stu[];
    cells: Record<string, Record<string, string>>;
  } | null>(null);

  useEffect(() => {
    api
      .get<ClassRef[]>('/api/classes')
      .then(({ data }) => setClasses(data))
      .catch(console.error);
  }, []);

  const fetchReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!classId) {
      alert('Please select a class first');
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const { data } = await api.get('/api/admin/attendance/report', {
        params: { month, year, classId },
      });
      setReport(data);
    } catch {
      alert('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Monthly Attendance Report</h2>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={fetchReport} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 min-w-[150px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 w-28 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !classId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>

      {hasSearched && !loading && report && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {report.students.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No students found in this class.
            </div>
          ) : (
            <table className="text-xs whitespace-nowrap w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/50">
                  <th className="p-3 text-left font-semibold text-zinc-600 dark:text-zinc-300 sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700/50">Student</th>
                  {report.days.map((d) => {
                    const meta = report.dayMeta?.find((m) => m.date === d);
                    const off = meta?.isWeekend || meta?.isHoliday;
                    return (
                      <th
                        key={d}
                        className={`p-2 font-medium text-center min-w-[36px] border-l border-zinc-200 dark:border-zinc-700/50 ${
                          off
                            ? 'bg-violet-100/80 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200'
                            : 'text-zinc-500'
                        }`}
                        title={meta ? `${meta.weekdayShort}${meta.isHoliday ? ' · Holiday' : ''}` : d}
                      >
                        <div className="leading-tight">{d.slice(8)}</div>
                        <div className="text-[10px] font-normal opacity-80">{meta?.weekdayShort ?? ''}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {report.students.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                    <td className="p-3 sticky left-0 font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 z-10 border-r border-zinc-200 dark:border-zinc-700/50 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                      <span className="text-zinc-500 mr-2">{s.rollNo}</span>
                      {s.name}
                    </td>
                    {report.days.map((d) => {
                      const status = report.cells[s._id]?.[d] ?? '';
                      const meta = report.dayMeta?.find((m) => m.date === d);
                      const off = meta?.isWeekend || meta?.isHoliday;
                      let statusClass = '';
                      if (status === 'P') statusClass = 'text-emerald-600 font-bold';
                      if (status === 'A') statusClass = 'text-red-600 font-bold bg-red-50 dark:bg-red-900/10';
                      if (status === 'L') statusClass = 'text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/10';

                      return (
                        <td
                          key={d}
                          className={`p-2 text-center border-l border-zinc-100 dark:border-zinc-800/50 ${statusClass} ${
                            off ? 'bg-violet-50/90 dark:bg-violet-950/25' : ''
                          }`}
                        >
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">P</span> = Present</div>
            <div className="flex items-center gap-1.5"><span className="text-red-600 font-bold px-1 bg-red-50 dark:bg-red-900/10 rounded">A</span> = Absent</div>
            <div className="flex items-center gap-1.5"><span className="text-amber-500 font-bold px-1 bg-amber-50 dark:bg-amber-900/10 rounded">L</span> = Late</div>
            <div className="flex items-center gap-1.5">Violet = Sat / Sun / holiday (School settings)</div>
          </div>
        </div>
      )}
    </div>
  );
}
