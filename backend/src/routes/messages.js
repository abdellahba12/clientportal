const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/:projectId', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM messages WHERE project_id=$1 ORDER BY created_at ASC',
    [req.params.projectId]
  );
  res.json(result.rows);
});

router.post('/:projectId', async (req, res) => {
  const { content, sender_type } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const result = await pool.query(
    'INSERT INTO messages (project_id, user_id, content, sender_type) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.params.projectId, req.userId, content, sender_type || 'freelancer']
  );
  res.json(result.rows[0]);
});

module.exports = router;
