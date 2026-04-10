import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { PortalHeader } from '@/components/PortalHeader';
import {
  IconUsers,
  IconCalendarEvent,
  IconClipboardCheck,
  IconChartHistogram,
  IconFileCertificate,
  IconAlertCircle,
  IconBooks,
} from '@tabler/icons-react';

const base = '/teacher';

export default function TeacherLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const ct = user?.isClassTeacher;

  const navItems = ct
    ? [
        { name: 'My class', path: `${base}/my-class`, icon: <IconUsers className="w-5 h-5 mr-3" /> },
        { name: 'Timetable', path: `${base}/timetable`, icon: <IconCalendarEvent className="w-5 h-5 mr-3" /> },
        {
          name: 'Attendance',
          path: `${base}/attendance`,
          icon: <IconClipboardCheck className="w-5 h-5 mr-3" />,
        },
        { name: 'Marks', path: `${base}/marks`, icon: <IconChartHistogram className="w-5 h-5 mr-3" /> },
        {
          name: 'Report cards',
          path: `${base}/report-cards`,
          icon: <IconFileCertificate className="w-5 h-5 mr-3" />,
        },
      ]
    : [
        {
          name: 'No class',
          path: `${base}/no-class`,
          icon: <IconAlertCircle className="w-5 h-5 mr-3" />,
        },
      ];

  const title =
    navItems.find(
      (i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/'),
    )?.name ?? 'Teacher';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="w-64 bg-zinc-900 flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 bg-zinc-950 border-b border-zinc-900/50">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <IconBooks className="w-6 h-6 text-emerald-400" /> Teacher Portal
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== base && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <PortalHeader title={title} />
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto text-zinc-900 dark:text-zinc-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
