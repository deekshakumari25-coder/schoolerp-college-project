interface Row {
  _id: string;
  day: string;
  time: string;
  subject: string;
  room?: string;
}

export function TimetableBlock({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="text-zinc-500 text-sm">No entries.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r._id}
          className="flex justify-between items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        >
          <div>
            <span className="font-medium">{r.subject}</span>
            <span className="text-zinc-500 text-sm ml-2">{r.day}</span>
          </div>
          <span className="text-amber-700 dark:text-amber-400 text-sm font-medium">{r.time}</span>
        </li>
      ))}
    </ul>
  );
}
