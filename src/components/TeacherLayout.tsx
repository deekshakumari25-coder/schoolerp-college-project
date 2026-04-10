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
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Teacher</h2>
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
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Sign out
          </button>
        </div>
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
