import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SchoolSettings } from '@/types/auth';

export default function AdminSchool() {
  const [currentSession, setCurrentSession] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [schoolWebsite, setSchoolWebsite] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [holidayDatesText, setHolidayDatesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<SchoolSettings>('/api/school/settings')
      .then(({ data }) => {
        setCurrentSession(data.currentSession || '');
        setSessionStartDate(data.sessionStartDate || '');
        setSessionEndDate(data.sessionEndDate || '');
        setSchoolWebsite(data.schoolWebsite || '');
        setSchoolAddress(data.schoolAddress || '');
        setHolidayDatesText((data.holidayDates || []).join('\n'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    try {
      const holidayDates = holidayDatesText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      await api.patch<SchoolSettings>('/api/admin/school/settings', {
        currentSession,
        sessionStartDate: sessionStartDate || null,
        sessionEndDate: sessionEndDate || null,
        schoolWebsite: schoolWebsite || null,
        schoolAddress: schoolAddress || null,
        holidayDates,
      });
      setSaved(true);
    } catch {
      alert('Save failed');
    }
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">School Settings</h2>
      <p className="text-sm text-zinc-500">
        Update the active academic session and school details.
      </p>
      <form onSubmit={save} className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Session Details</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Session</label>
            <input
              value={currentSession}
              onChange={(e) => setCurrentSession(e.target.value)}
              placeholder="2025-26"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="hidden md:block"></div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Session Start Date</label>
            <input
              type="date"
              value={sessionStartDate}
              onChange={(e) => setSessionStartDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Session End Date</label>
            <input
              type="date"
              value={sessionEndDate}
              onChange={(e) => setSessionEndDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">School Information</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">School Website</label>
            <input
              type="url"
              value={schoolWebsite}
              onChange={(e) => setSchoolWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">School Address</label>
            <textarea
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              placeholder="Full school address"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Holiday dates (attendance grid)
            </label>
            <p className="text-xs text-zinc-500 mb-1">
              One date per line, format YYYY-MM-DD. Shown like weekends in teacher and admin monthly attendance.
            </p>
            <textarea
              value={holidayDatesText}
              onChange={(e) => setHolidayDatesText(e.target.value)}
              placeholder={'2026-01-26\n2026-03-14'}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Save Settings
          </button>
          {saved && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Settings saved successfully.</p>}
        </div>
      </form>
    </div>
  );
}
