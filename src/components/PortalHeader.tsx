import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { SchoolSettings } from '@/types/auth';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { IconLogout } from '@tabler/icons-react';

export function PortalHeader({ title }: { title: string }) {
  const { logout, user } = useContext(AuthContext);
  const [school, setSchool] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<SchoolSettings>('/api/school/settings');
        if (!cancelled) setSchool(data);
      } catch {
        if (!cancelled)
          setSchool({ schoolName: 'School', logoUrl: null, currentSession: '' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="h-auto min-h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 px-6 py-3">
      <div className="flex items-center gap-4 min-w-0">
        <img
          src="/school_logo.png"
          alt="SH School Logo"
          className="h-10 w-10 rounded-lg object-contain border border-zinc-200 dark:border-zinc-700 shrink-0 bg-white"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
            SH School
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Session {school?.currentSession ?? '—'}
          </p>
        </div>
      </div>
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:text-center">
        {title}
      </h1>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[140px] truncate hidden sm:inline">
          {user?.displayName}
        </span>
        <ChangePasswordDialog>
          <Button type="button" variant="outline" size="sm">
            Password
          </Button>
        </ChangePasswordDialog>
        <Button type="button" variant="destructive" size="sm" onClick={logout} className="bg-red-600 hover:bg-red-700 text-white shadow-sm border-none">
          <IconLogout className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
