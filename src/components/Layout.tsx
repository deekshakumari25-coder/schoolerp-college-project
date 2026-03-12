import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconBooks, 
  IconCalendarEvent, 
  IconFileCertificate,
  IconLogout
} from '@tabler/icons-react';

export default function Layout() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <IconLayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Students', path: '/students', icon: <IconUsers className="w-5 h-5 mr-3" /> },
    { name: 'Classes', path: '/classes', icon: <IconBooks className="w-5 h-5 mr-3" /> },
    { name: 'Timetable', path: '/timetable', icon: <IconCalendarEvent className="w-5 h-5 mr-3" /> },
    { name: 'Exams', path: '/exams', icon: <IconFileCertificate className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            School System
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <IconLogout className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8">
          <h1 className="text-xl text-zinc-800 dark:text-zinc-100 font-semibold capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 py-1 px-3 rounded-full">
              Admin User
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto text-zinc-900 dark:text-zinc-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
