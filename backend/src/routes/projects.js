const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.name as client_name, c.company as client_company
     FROM projects p
     LEFT JOIN clients c ON p.client_id = c.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const project = await pool.query(
    `SELECT p.*, c.name as client_name FROM projects p
     LEFT JOIN clients c ON p.client_id = c.id
     WHERE p.id=$1 AND p.user_id=$2`,
    [req.params.id, req.userId]
  );
  if (!project.rows[0]) return res.status(404).json({ error: 'Not found' });

  const tasks = await pool.query('SELECT * FROM tasks WHERE project_id=$1 ORDER BY created_at', [req.params.id]);
  const files = await pool.query('SELECT * FROM files WHERE project_id=$1 ORDER BY created_at DESC', [req.params.id]);
  const messages = await pool.query('SELECT * FROM messages WHERE project_id=$1 ORDER BY created_at', [req.params.id]);

  res.json({ ...project.rows[0], tasks: tasks.rows, files: files.rows, messages: messages.rows });
});

router.post('/', async (req, res) => {
  const { title, description, client_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const result = await pool.query(
    'INSERT INTO projects (user_id, client_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.userId, client_id, title, description]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;
  const result = await pool.query(
    'UPDATE projects SET title=$1, description=$2, status=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
    [title, description, status, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

// Tasks
router.post('/:id/tasks', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO tasks (project_id, title) VALUES ($1, $2) RETURNING *',
    [req.params.id, title]
  );
  res.json(result.rows[0]);
});

router.put('/:id/tasks/:taskId', async (req, res) => {
  const { status, title } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET status=$1, title=$2 WHERE id=$3 RETURNING *',
    [status, title, req.params.taskId]
  );
  res.json(result.rows[0]);
});

router.delete('/:id/tasks/:taskId', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.taskId]);
  res.json({ success: true });
});

module.exports = router;
