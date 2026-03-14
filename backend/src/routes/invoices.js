const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT i.*, c.name as client_name, p.title as project_title
     FROM invoices i
     LEFT JOIN clients c ON i.client_id = c.id
     LEFT JOIN projects p ON i.project_id = p.id
     WHERE i.user_id = $1
     ORDER BY i.created_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { client_id, project_id, amount, due_date, notes } = req.body;
  if (!client_id || !amount) return res.status(400).json({ error: 'Client and amount required' });

  const result = await pool.query(
    'INSERT INTO invoices (user_id, client_id, project_id, amount, due_date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.userId, client_id, project_id, amount, due_date, notes]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { status, amount, due_date, notes } = req.body;
  const result = await pool.query(
    'UPDATE invoices SET status=$1, amount=$2, due_date=$3, notes=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [status, amount, due_date, notes, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM invoices WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
