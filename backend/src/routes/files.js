const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `uploads/${req.userId}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/upload/:projectId', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const result = await pool.query(
    'INSERT INTO files (project_id, user_id, name, path, size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [req.params.projectId, req.userId, req.file.originalname, req.file.path, req.file.size]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const file = await pool.query('SELECT * FROM files WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  if (!file.rows[0]) return res.status(404).json({ error: 'Not found' });

  if (fs.existsSync(file.rows[0].path)) fs.unlinkSync(file.rows[0].path);
  await pool.query('DELETE FROM files WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
