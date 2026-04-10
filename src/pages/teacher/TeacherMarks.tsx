import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ExamOpt {
  _id: string;
  eventName: string;
  date: string;
}

interface Matrix {
  exam: { _id: string; eventName: string; date: string };
  subjects: string[];
  students: { _id: string; name: string; rollNo: string }[];
  marks: { studentId: string; subjectName: string; marksObtained: number; maxMarks: number }[];
}

export default function TeacherMarks() {
  const [exams, setExams] = useState<ExamOpt[]>([]);
  const [examId, setExamId] = useState('');
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [cells, setCells] = useState<Record<string, { obtained: number; max: number }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<ExamOpt[]>('/api/teacher/exams')
      .then(({ data }) => {
        setExams(data);
        if (data.length) setExamId((prev) => prev || data[0]._id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!examId) return;
    api
      .get<Matrix>('/api/teacher/marks-matrix', { params: { examId } })
      .then(({ data }) => {
        setMatrix(data);
        const m: Record<string, { obtained: number; max: number }> = {};
        for (const row of data.marks) {
          m[`${row.studentId}|${row.subjectName}`] = {
            obtained: row.marksObtained,
            max: row.maxMarks,
          };
        }
        for (const st of data.students) {
          for (const sub of data.subjects) {
            const k = `${st._id}|${sub}`;
            if (!m[k]) m[k] = { obtained: 0, max: 100 };
          }
        }
        setCells(m);
      })
      .catch(() => setMatrix(null));
  }, [examId]);

  const key = (sid: string, sub: string) => `${sid}|${sub}`;

  function setCell(sid: string, sub: string, field: 'obtained' | 'max', v: number) {
    const k = key(sid, sub);
    setCells((prev) => ({
      ...prev,
      [k]: { ...prev[k], obtained: prev[k]?.obtained ?? 0, max: prev[k]?.max ?? 100, [field]: v },
    }));
  }

  async function save() {
    if (!matrix) return;
    setSaving(true);
    const entries: { studentId: string; subjectName: string; marksObtained: number; maxMarks: number }[] = [];
    for (const st of matrix.students) {
      for (const sub of matrix.subjects) {
        const c = cells[key(st._id, sub)];
        if (c) entries.push({ studentId: st._id, subjectName: sub, marksObtained: c.obtained, maxMarks: c.max });
      }
    }
    try {
      await api.put('/api/teacher/marks', { examId: matrix.exam._id, entries });
      alert('Marks saved.');
    } catch {
      alert('Save failed (check subjects you are assigned to teach).');
    } finally {
      setSaving(false);
    }
  }

  if (!exams.length) return <p className="text-zinc-500">No exams for your class.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Marks entry</h2>
      <div>
        <label className="text-sm font-medium mr-2">Exam</label>
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
        >
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.eventName} ({e.date})
            </option>
          ))}
        </select>
      </div>
      {!matrix ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="text-sm min-w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="p-2 text-left">Student</th>
                  {matrix.subjects.map((sub) => (
                    <th key={sub} className="p-2 text-left min-w-[140px]">
                      {sub}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.students.map((st) => (
                  <tr key={st._id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="p-2 whitespace-nowrap">
                      {st.rollNo} {st.name}
                    </td>
                    {matrix.subjects.map((sub) => {
                      const c = cells[key(st._id, sub)] ?? { obtained: 0, max: 100 };
                      return (
                        <td key={sub} className="p-2">
                          <div className="flex gap-1 items-center">
                            <input
                              type="number"
                              className="w-16 rounded border border-zinc-300 px-1 py-0.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                              value={c.obtained}
                              onChange={(e) => setCell(st._id, sub, 'obtained', Number(e.target.value))}
                            />
                            <span>/</span>
                            <input
                              type="number"
                              className="w-16 rounded border border-zinc-300 px-1 py-0.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                              value={c.max}
                              onChange={(e) => setCell(st._id, sub, 'max', Number(e.target.value))}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => save()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save marks'}
          </button>
        </>
      )}
    </div>
  );
}
