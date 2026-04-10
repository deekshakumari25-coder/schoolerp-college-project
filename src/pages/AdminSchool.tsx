import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SchoolSettings } from '@/types/auth';

export default function AdminSchool() {
  const [currentSession, setCurrentSession] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<SchoolSettings>('/api/school/settings')
      .then(({ data }) => {
        setCurrentSession(data.currentSession);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    try {
      await api.patch<SchoolSettings>('/api/admin/school/settings', {
        currentSession,
      });
      setSaved(true);
    } catch {
      alert('Save failed');
    }
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">School session</h2>
      <p className="text-sm text-zinc-500">
        Update the active academic session.
      </p>
      <form onSubmit={save} className="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <label className="block text-sm font-medium mb-1">Current session</label>
          <input
            value={currentSession}
            onChange={(e) => setCurrentSession(e.target.value)}
            placeholder="2025-26"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
        <button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium">
          Save
        </button>
      </form>
    </div>
  );
}
