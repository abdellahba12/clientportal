const express = require('express');
const { pool } = require('../db');
const router = express.Router();

async function sendEmail({ to, subject, html }) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS?.replace(/\s/g, ''),
      },
      tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail({
      from: `ClientPortal <${process.env.GMAIL_USER}>`,
      to, subject, html
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

router.get('/:token', async (req, res) => {
  try {
    const client = await pool.query('SELECT * FROM clients WHERE portal_token = $1', [req.params.token]);
    if (!client.rows[0]) return res.status(404).json({ error: 'Portal not found' });
    const c = client.rows[0];

    const projects = await pool.query(
      `SELECT p.*, 
        json_agg(DISTINCT jsonb_build_object('id', t.id, 'title', t.title, 'status', t.status)) FILTER (WHERE t.id IS NOT NULL) as tasks,
        json_agg(DISTINCT jsonb_build_object('id', f.id, 'name', f.name, 'path', f.path, 'size', f.size)) FILTER (WHERE f.id IS NOT NULL) as files,
        json_agg(DISTINCT jsonb_build_object('id', m.id, 'content', m.content, 'sender_type', m.sender_type, 'created_at', m.created_at)) FILTER (WHERE m.id IS NOT NULL) as messages
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       LEFT JOIN files f ON f.project_id = p.id
       LEFT JOIN messages m ON m.project_id = p.id
       WHERE p.client_id = $1
       GROUP BY p.id ORDER BY p.created_at DESC`,
      [c.id]
    );

    const invoices = await pool.query('SELECT * FROM invoices WHERE client_id = $1 ORDER BY created_at DESC', [c.id]);
    res.json({ client: { name: c.name, company: c.company }, projects: projects.rows, invoices: invoices.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:token/message', async (req, res) => {
  const { project_id, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  try {
    const client = await pool.query('SELECT * FROM clients WHERE portal_token = $1', [req.params.token]);
    if (!client.rows[0]) return res.status(404).json({ error: 'Portal not found' });

    const result = await pool.query(
      'INSERT INTO messages (project_id, user_id, content, sender_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, client.rows[0].user_id, content, 'client']
    );

    const freelancer = await pool.query('SELECT * FROM users WHERE id = $1', [client.rows[0].user_id]);
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [project_id]);

    if (freelancer.rows[0]?.email) {
      await sendEmail({
        to: freelancer.rows[0].email,
        subject: `Nuevo mensaje de ${client.rows[0].name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8f7ff;border-radius:16px">
            <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e5e9f8">
              <h2 style="background:linear-gradient(135deg,#4f6ef7,#7c5cfc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px">ClientPortal</h2>
              <p style="color:#0d1340">Tu cliente <strong>${client.rows[0].name}</strong> te ha enviado un mensaje en <strong>${project.rows[0]?.title}</strong>:</p>
              <div style="background:#f0f4ff;padding:16px;border-radius:10px;margin:16px 0;border-left:3px solid #4f6ef7">
                <p style="margin:0;color:#0d1340">${content}</p>
              </div>
              <a href="${process.env.FRONTEND_URL}/app/projects/${project_id}" style="display:inline-block;background:linear-gradient(135deg,#4f6ef7,#7c5cfc);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Ver mensaje →</a>
            </div>
          </div>
        `
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.sendEmail = sendEmail;
