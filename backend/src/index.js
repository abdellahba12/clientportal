require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const clientRoutes = require('./routes/clients');
const fileRoutes = require('./routes/files');
const invoiceRoutes = require('./routes/invoices');
const messageRoutes = require('./routes/messages');
const portalRoutes = require('./routes/portal');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/portal', portalRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
