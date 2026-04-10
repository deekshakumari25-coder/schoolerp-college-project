import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ReportCardView } from '@/components/ReportCardView';
import type { ReportCardData } from '@/types/reportCard';
import { Button } from '@/components/ui/button';

export default function StudentReportCard() {
  const [data, setData] = useState<ReportCardData | null>(null);

  useEffect(() => {
    api
      .get<ReportCardData>('/api/student/report-card')
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <ReportCardView data={data} />
    </div>
  );
}
