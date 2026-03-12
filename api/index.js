import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from '../lib/supabase.js';

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();

// Debug Route
router.get('/debug', async (req, res) => {
  try {
    const hasUrl = !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('classes').select('count', { count: 'exact', head: true });
    
    if (error) throw error;

    res.json({
      status: 'OK',
      database: 'Connected (Supabase SDK)',
      count: data,
      envLoaded: { url: hasUrl, key: hasKey },
      urlPrefix: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').substring(0, 15) + '...',
      nodeEnv: process.env.NODE_ENV
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      error: err.message,
      code: err.code,
      nodeEnv: process.env.NODE_ENV
    });
  }
});

// Auth Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    return res.json({ success: true, token: 'mock-admin-token-123' });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// Students API
router.get('/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(className)');
    
    if (error) throw error;

    // Map back to what frontend expects 
    const students = data.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.classes?.className }
    }));
    res.json(students);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { name, rollNo, classId } = req.body;
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, rollNo, classId }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Classes API
router.get('/classes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) throw error;
    const classes = data.map(row => ({ ...row, _id: row.id }));
    res.json(classes);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const { className, teacherName } = req.body;
    const { data, error } = await supabase
      .from('classes')
      .insert([{ className, teacherName }])
      .select();

    if (error) throw error;
    res.json({ ...data[0], _id: data[0].id });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Timetable API
router.get('/timetable', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timetables')
      .select('*, classes(className)');
    
    if (error) throw error;
    const timetable = data.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.classes?.className }
    }));
    res.json(timetable);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/timetable', async (req, res) => {
  try {
    const { classId, day, subject, time } = req.body;
    const { data, error } = await supabase
      .from('timetables')
      .insert([{ classId, day, subject, time }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Exams API
router.get('/exams', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*, classes(className)');
    
    if (error) throw error;
    const exams = data.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.classes?.className }
    }));
    res.json(exams);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/exams', async (req, res) => {
  try {
    const { eventName, date, classId, subject } = req.body;
    const { data, error } = await supabase
      .from('exams')
      .insert([{ eventName, date, classId, subject }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Mount router on both /api (Vercel) and / (Local)
app.use('/api', router);
app.use('/', router);

export default app;
