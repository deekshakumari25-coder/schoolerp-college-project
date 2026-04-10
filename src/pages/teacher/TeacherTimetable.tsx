import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimetableBlock } from '@/pages/teacher/TimetableBlock';

interface Row {
  _id: string;
  day: string;
  time: string;
  subject: string;
  room?: string;
}

export default function TeacherTimetable() {
  const [cls, setCls] = useState<Row[]>([]);
  const [personal, setPersonal] = useState<Row[]>([]);

  useEffect(() => {
    Promise.all([api.get<Row[]>('/api/teacher/timetable/class'), api.get<Row[]>('/api/teacher/timetable/personal')])
      .then(([a, b]) => {
        setCls(a.data);
        setPersonal(b.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Timetable</h2>
      <Tabs defaultValue="class">
        <TabsList>
          <TabsTrigger value="class">Class timetable</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>
        <TabsContent value="class" className="mt-4">
          <TimetableBlock rows={cls} />
        </TabsContent>
        <TabsContent value="personal" className="mt-4">
          <TimetableBlock rows={personal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
