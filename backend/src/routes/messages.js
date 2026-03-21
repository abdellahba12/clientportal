const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

async function sendEmail({ to, subject, html }) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      }
    });
    await transporter.sendMail({
      from: `ClientPortal <${process.env.GMAIL_USER}>`,
      to, subject, html
    });
    console.log('Email sent to:', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

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

  try {
    const project = await pool.query(
      `SELECT p.*, c.email as client_email, c.name as client_name, c.portal_token 
       FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = $1`,
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
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8f7ff;border-radius:16px">
            <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e5e9f8">
              <h2 style="background:linear-gradient(135deg,#4f6ef7,#7c5cfc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px">ClientPortal</h2>
              <p style="color:#0d1340">Hola <strong>${p.client_name}</strong>,</p>
              <p style="color:#667099"><strong>${freelancer.rows[0]?.name}</strong> te ha enviado un mensaje en el proyecto <strong>${p.title}</strong>:</p>
              <div style="background:#f0f4ff;padding:16px;border-radius:10px;margin:16px 0;border-left:3px solid #4f6ef7">
                <p style="margin:0;color:#0d1340">${content}</p>
              </div>
              <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f6ef7,#7c5cfc);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Ver en tu portal →</a>
              <p style="color:#9ba5c9;font-size:0.8rem;margin-top:20px">ClientPortal · Gestión profesional de proyectos</p>
            </div>
          </div>
        `
      });
    }
  } catch (err) {
    console.error('Notification error:', err);
  }

  res.json(result.rows[0]);
});

module.exports = router;
module.exports.sendEmail = sendEmail;
