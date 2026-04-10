import type { ReportCardData } from '@/types/reportCard';

export function ReportCardView({ data }: { data: ReportCardData }) {
  const examIds = data.exams.map((e) => e._id);

  return (
    <div className="report-card-print bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm print:shadow-none print:border-0">
      <div className="text-center border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
        {data.logoUrl && (
          <img src={data.logoUrl} alt="" className="h-14 mx-auto mb-2 object-contain" />
        )}
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{data.schoolName}</h2>
        <p className="text-sm text-zinc-500">Session {data.currentSession}</p>
        <p className="text-sm mt-2 text-zinc-700 dark:text-zinc-300">
          <span className="font-medium">{data.student.name}</span> — Roll {data.student.rollNo} — Class{' '}
          {data.student.className}
        </p>
        {data.classTeacherName && (
          <p className="text-xs text-zinc-500 mt-1">Class teacher: {data.classTeacherName}</p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/80">
              <th className="text-left p-2 border border-zinc-200 dark:border-zinc-700">Subject</th>
              {data.exams.map((ex) => (
                <th
                  key={ex._id}
                  className="text-center p-2 border border-zinc-200 dark:border-zinc-700 min-w-[100px]"
                >
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-xs font-normal text-zinc-500">{ex.date}</div>
                </th>
              ))}
              <th className="text-center p-2 border border-zinc-200 dark:border-zinc-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((sub) => (
              <tr key={sub}>
                <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-medium">{sub}</td>
                {examIds.map((eid) => {
                  const cell = data.grid[sub]?.[eid];
                  return (
                    <td key={eid} className="text-center p-2 border border-zinc-200 dark:border-zinc-700">
                      {cell ? `${cell.obtained} / ${cell.max}` : '—'}
                    </td>
                  );
                })}
                <td className="text-center p-2 border border-zinc-200 dark:border-zinc-700 font-medium">
                  {data.rowTotals[sub]
                    ? `${data.rowTotals[sub].obtained} / ${data.rowTotals[sub].max}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 justify-end text-sm">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          Grand total: {data.grandTotal.obtained} / {data.grandTotal.max}
        </p>
        {data.percentage != null && (
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
            Percentage: {data.percentage}%
          </p>
        )}
      </div>
    </div>
  );
}
