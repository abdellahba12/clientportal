const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, email, company } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const user = await pool.query('SELECT plan FROM users WHERE id = $1', [req.userId]);
  if (user.rows[0].plan === 'free') {
    const count = await pool.query('SELECT COUNT(*) FROM clients WHERE user_id = $1', [req.userId]);
    if (parseInt(count.rows[0].count) >= 2)
      return res.status(403).json({ error: 'Plan gratuito limitado a 2 clientes. Actualiza a Pro.' });
  }

  const result = await pool.query(
    'INSERT INTO clients (user_id, name, email, company) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.userId, name, email, company]
  );
  res.json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, email, company } = req.body;
  const result = await pool.query(
    'UPDATE clients SET name=$1, email=$2, company=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
    [name, email, company, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM clients WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
