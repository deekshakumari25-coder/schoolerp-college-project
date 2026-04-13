import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DayMeta {
  date: string;
  weekdayShort: string;
  isWeekend: boolean;
  isHoliday: boolean;
}

export default function StudentAttendance() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState<string[]>([]);
  const [dayMeta, setDayMeta] = useState<DayMeta[] | undefined>();
  const [cells, setCells] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const { data } = await api.get<{
        days: string[];
        dayMeta?: DayMeta[];
        cells: Record<string, string>;
      }>('/api/student/attendance', {
        params: { month, year },
      });
      setDays(data.days);
      setDayMeta(data.dayMeta);
      setCells(data.cells);
    } catch (err) {
      console.error(err);
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      </div>

      {hasSearched && !loading && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Report for {month}/{year}</h3>
          <div className="flex gap-2 min-w-max">
            {days.map((d) => {
              const status = cells[d] || '—';
              const meta = dayMeta?.find((m) => m.date === d);
              const off = meta?.isWeekend || meta?.isHoliday;
              let statusClass = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
              if (status === 'P') statusClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
              if (status === 'A') statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
              if (status === 'L') statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

              return (
                <div
                  key={d}
                  className={`flex flex-col items-center w-10 rounded-md px-0.5 py-1 ${off ? 'bg-violet-100/70 dark:bg-violet-950/35' : ''}`}
                  title={meta ? `${meta.weekdayShort}${meta.isHoliday ? ' · Holiday' : ''}` : d}
                >
                  <span className="text-[10px] font-bold text-zinc-500 leading-tight">{d.slice(8)}</span>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{meta?.weekdayShort ?? ''}</span>
                  <span className={`text-sm font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg ${statusClass}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex gap-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/30"></span> P = Present</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/30"></span> A = Absent</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900/30"></span> L = Late</div>
          </div>
        </div>
      )}
    </div>
  );
}
