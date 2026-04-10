import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { ReportCardView } from '@/components/ReportCardView';
import type { ReportCardData } from '@/types/reportCard';
import { Button } from '@/components/ui/button';

export default function TeacherReportCardPage() {
  const { studentId } = useParams();
  const [data, setData] = useState<ReportCardData | null>(null);

  useEffect(() => {
    if (!studentId) return;
    api
      .get<ReportCardData>(`/api/teacher/report-card/${studentId}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null));
  }, [studentId]);

  if (!data) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center print:hidden">
        <Link to="/teacher/report-cards" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back
        </Link>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <ReportCardView data={data} />
    </div>
  );
}
