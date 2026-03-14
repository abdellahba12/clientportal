const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const { sendEmail } = require('./portal');
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

  // Send email to client when freelancer sends a message
  try {
    const project = await pool.query(
      'SELECT p.*, c.email as client_email, c.name as client_name, c.portal_token FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = $1',
      [req.params.projectId]
    );
    const freelancer = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
    const p = project.rows[0];

    if (p?.client_email) {
      const portalUrl = `${process.env.FRONTEND_URL}/portal/${p.portal_token}`;
      await sendEmail({
        to: p.client_email,
        subject: `Nuevo mensaje en tu proyecto: ${p.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#6c63ff">ClientPortal</h2>
            <p>Hola <strong>${p.client_name}</strong>,</p>
            <p><strong>${freelancer.rows[0]?.name}</strong> te ha enviado un mensaje en el proyecto <strong>${p.title}</strong>:</p>
            <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0">
              <p style="margin:0">${content}</p>
            </div>
            <a href="${portalUrl}" style="background:#6c63ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Ver en tu portal →</a>
            <p style="color:#999;font-size:0.8rem;margin-top:24px">Este email fue enviado desde ClientPortal</p>
          </div>
        `
      });
    }
  } catch (err) {
    console.error('Email error:', err);
  }

  res.json(result.rows[0]);
});

module.exports = router;
