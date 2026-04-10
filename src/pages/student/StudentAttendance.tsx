import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StudentAttendance() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState<string[]>([]);
  const [cells, setCells] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get<{ days: string[]; cells: Record<string, string> }>('/api/student/attendance', {
        params: { month, year },
      })
      .then(({ data }) => {
        setDays(data.days);
        setCells(data.cells);
      })
      .catch(console.error);
  }, [month, year]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Attendance</h2>
      <div className="flex flex-wrap gap-4 items-end">
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
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div className="flex gap-1 min-w-max">
          {days.map((d) => (
            <div key={d} className="flex flex-col items-center w-10">
              <span className="text-[10px] text-zinc-500">{d.slice(8)}</span>
              <span className="text-sm font-medium mt-1 w-8 h-8 flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                {cells[d] || '·'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
