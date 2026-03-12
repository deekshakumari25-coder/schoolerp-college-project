import { useState, useEffect } from 'react';
import axios from 'axios';
import { IconPlus } from '@tabler/icons-react';

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await axios.get('/api/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post('/api/classes', { className, teacherName });
      setShowAdd(false);
      setClassName('');
      setTeacherName('');
      fetchData();
    } catch (err) {
      alert('Error saving class');
    }
  }

  if (loading) return <div>Loading classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Classes</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <IconPlus className="w-5 h-5 mr-1" />
          Add Class
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">New Class</h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class Name (e.g., 10th A)</label>
              <input required type="text" value={className} onChange={e => setClassName(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class Teacher</label>
              <input required type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 h-[42px]">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            No classes found. Add one above!
          </div>
        ) : (
          classes.map(c => (
            <div key={c._id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                {c.className.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{c.className}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Teacher: <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.teacherName}</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
