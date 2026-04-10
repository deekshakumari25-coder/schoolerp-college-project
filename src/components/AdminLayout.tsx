import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { PortalHeader } from '@/components/PortalHeader';
import {
  IconLayoutDashboard,
  IconUsers,
  IconBooks,
  IconCalendarEvent,
  IconFileCertificate,
  IconSchool,
  IconUserPlus,
  IconShieldLock,
} from '@tabler/icons-react';

const base = '/admin';

export default function AdminLayout() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: `${base}`, icon: <IconLayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Students', path: `${base}/students`, icon: <IconUsers className="w-5 h-5 mr-3" /> },
    { name: 'Teachers', path: `${base}/teachers`, icon: <IconUserPlus className="w-5 h-5 mr-3" /> },
    { name: 'Classes', path: `${base}/classes`, icon: <IconBooks className="w-5 h-5 mr-3" /> },
    { name: 'Timetable', path: `${base}/timetable`, icon: <IconCalendarEvent className="w-5 h-5 mr-3" /> },
    { name: 'Exams', path: `${base}/exams`, icon: <IconFileCertificate className="w-5 h-5 mr-3" /> },
    { name: 'School', path: `${base}/school`, icon: <IconSchool className="w-5 h-5 mr-3" /> },
  ];

  const title =
    navItems.find((i) => {
      if (i.path === base)
        return location.pathname === base || location.pathname === `${base}/`;
      return location.pathname === i.path || location.pathname.startsWith(`${i.path}/`);
    })?.name ?? 'Admin';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="w-64 bg-zinc-900 flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 bg-zinc-950 border-b border-zinc-900/50">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <IconShieldLock className="w-6 h-6 text-blue-400" /> Admin Portal
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === base
                ? location.pathname === base || location.pathname === `${base}/`
                : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
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
