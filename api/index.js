import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from '../lib/db.js';

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();

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
    const result = await pool.query(`
      SELECT s.*, c."className" 
      FROM students s 
      LEFT JOIN classes c ON s."classId" = c.id
    `);
    const students = result.rows.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.className }
    }));
    res.json(students);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { name, rollNo, classId } = req.body;
    const result = await pool.query(
      'INSERT INTO students (name, "rollNo", "classId") VALUES ($1, $2, $3) RETURNING *',
      [name, rollNo, classId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

// Classes API
router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes');
    const classes = result.rows.map(row => ({ ...row, _id: row.id }));
    res.json(classes);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const { className, teacherName } = req.body;
    const result = await pool.query(
      'INSERT INTO classes ("className", "teacherName") VALUES ($1, $2) RETURNING *',
      [className, teacherName]
    );
    res.json({ ...result.rows[0], _id: result.rows[0].id });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

// Timetable API
router.get('/timetable', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c."className" 
      FROM timetables t 
      LEFT JOIN classes c ON t."classId" = c.id
    `);
    const timetable = result.rows.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.className }
    }));
    res.json(timetable);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

router.post('/timetable', async (req, res) => {
  try {
    const { classId, day, subject, time } = req.body;
    const result = await pool.query(
      'INSERT INTO timetables ("classId", day, subject, time) VALUES ($1, $2, $3, $4) RETURNING *',
      [classId, day, subject, time]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

// Exams API
router.get('/exams', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c."className" 
      FROM exams e 
      LEFT JOIN classes c ON e."classId" = c.id
    `);
    const exams = result.rows.map(row => ({
      ...row,
      _id: row.id,
      classId: { _id: row.classId, className: row.className }
    }));
    res.json(exams);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

router.post('/exams', async (req, res) => {
  try {
    const { eventName, date, classId, subject } = req.body;
    const result = await pool.query(
      'INSERT INTO exams ("eventName", date, "classId", subject) VALUES ($1, $2, $3, $4) RETURNING *',
      [eventName, date, classId, subject]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, code: err.code });
  }
});

// Mount router on both /api (Vercel) and / (Local)
app.use('/api', router);
app.use('/', router);

export default app;
