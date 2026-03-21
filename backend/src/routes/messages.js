const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const { sendEmail } = require('../email');
const router = express.Router();

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

  // Respond immediately
  res.json(result.rows[0]);

  // Send email in background
  pool.query(
    `SELECT p.*, c.email as client_email, c.name as client_name, c.portal_token 
     FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = $1`,
    [req.params.projectId]
  ).then(async (project) => {
    const p = project.rows[0];
    if (!p?.client_email) return;
    const freelancer = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
    const portalUrl = `${process.env.FRONTEND_URL}/portal/${p.portal_token}`;
    await sendEmail({
      to: p.client_email,
      subject: `Nuevo mensaje en tu proyecto: ${p.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#4f6ef7">ClientPortal</h2>
          <p>Hola <strong>${p.client_name}</strong>,</p>
          <p><strong>${freelancer.rows[0]?.name}</strong> te ha enviado un mensaje en <strong>${p.title}</strong>:</p>
          <div style="background:#f0f4ff;padding:16px;border-radius:10px;margin:16px 0;border-left:3px solid #4f6ef7">
            <p style="margin:0">${content}</p>
          </div>
          <a href="${portalUrl}" style="display:inline-block;background:#4f6ef7;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Ver en tu portal →</a>
        </div>
      `
    });
  }).catch(err => console.error('Notification error:', err.message));
});

module.exports = router;
