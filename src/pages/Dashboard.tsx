import { useState, useEffect } from 'react';
import axios from 'axios';
import { IconUsers, IconBooks, IconCalendarEvent, IconFileCertificate } from '@tabler/icons-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, classes: 0, timetable: 0, exams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [students, classes, timetable, exams] = await Promise.all([
          axios.get('/api/students'),
          axios.get('/api/classes'),
          axios.get('/api/timetable'),
          axios.get('/api/exams')
        ]);
        
        setStats({
          students: students.data.length,
          classes: classes.data.length,
          timetable: timetable.data.length,
          exams: exams.data.length
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: <IconUsers className="w-8 h-8 text-blue-600" />, color: 'bg-blue-50 border-blue-100' },
    { title: 'Active Classes', value: stats.classes, icon: <IconBooks className="w-8 h-8 text-emerald-600" />, color: 'bg-emerald-50 border-emerald-100' },
    { title: 'Timetable Slots', value: stats.timetable, icon: <IconCalendarEvent className="w-8 h-8 text-amber-600" />, color: 'bg-amber-50 border-amber-100' },
    { title: 'Upcoming Exams', value: stats.exams, icon: <IconFileCertificate className="w-8 h-8 text-purple-600" />, color: 'bg-purple-50 border-purple-100' },
  ];

  if (loading) {
    return <div className="animate-pulse text-zinc-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${card.color} dark:bg-zinc-900/50 dark:border-zinc-800 flex items-center justify-between`}>
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{card.value}</h3>
            </div>
            <div className="p-3 bg-white/50 dark:bg-zinc-800 rounded-xl">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Welcome to School Admin</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          This is a simple dashboard to manage your school's entities. Use the sidebar on the left to navigate to Students, Classes, Timetables, and Exams.
        </p>
      </div>
    </div>
  );
}
