import { useState, useEffect } from 'react';
import axios from 'axios';
import { IconPlus, IconClock } from '@tabler/icons-react';

export default function Timetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [classId, setClassId] = useState('');
  const [day, setDay] = useState('Monday');
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tableRes, classRes] = await Promise.all([
        axios.get('/api/timetable'),
        axios.get('/api/classes')
      ]);
      setTimetable(tableRes.data);
      setClasses(classRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post('/api/timetable', { classId, day, subject, time });
      setShowAdd(false);
      setSubject('');
      setTime('');
      fetchData();
    } catch (err) {
      alert('Error saving timetable entry');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Timetable Setup</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <IconPlus className="w-5 h-5 mr-1" />
          Add Schedule
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class</label>
              <select required value={classId} onChange={e => setClassId(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Day</label>
              <select required value={day} onChange={e => setDay(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
              <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
              <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white pt-1.5" />
            </div>
            <div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 h-[42px]">
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {days.map(d => {
          const dayEntries = timetable.filter(t => t.day === d).sort((a,b) => a.time.localeCompare(b.time));
          if (dayEntries.length === 0) return null;
          
          return (
            <div key={d} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200">
                {d}
              </div>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {dayEntries.map(entry => (
                  <li key={entry._id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{entry.subject}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Class: {entry.classId?.className || 'N/A'}</p>
                    </div>
                    <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md">
                      <IconClock className="w-4 h-4 mr-1.5" />
                      {entry.time}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  );
}
