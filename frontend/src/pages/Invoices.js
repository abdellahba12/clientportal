import { useEffect, useState } from 'react';
import api from '../api';

const STATUS_COLORS = { pending: 'badge-pending', paid: 'badge-paid', overdue: 'badge-overdue' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', project_id: '', amount: '', due_date: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => Promise.all([
    api.get('/invoices'),
    api.get('/clients'),
    api.get('/projects'),
  ]).then(([inv, cli, proj]) => {
    setInvoices(inv.data);
    setClients(cli.data);
    setProjects(proj.data);
  }).finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/invoices', form);
      setShowModal(false);
      setForm({ client_id: '', project_id: '', amount: '', due_date: '', notes: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/invoices/${id}`, { status });
    fetchAll();
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    await api.delete(`/invoices/${id}`);
    fetchAll();
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + parseFloat(i.amount), 0);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>{invoices.length} total invoices</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setError(''); setShowModal(true); }}>
          + New Invoice
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">${totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Revenue Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">${totalPending.toLocaleString()}</div>
          <div className="stat-label">Pending Payment</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">{invoices.length}</div>
          <div className="stat-label">Total Invoices</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No invoices yet</h3>
          <p>Create your first invoice to start getting paid</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)', fontSize: '0.8rem', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>CLIENT</th>
                <th style={{ padding: '12px 16px' }}>PROJECT</th>
                <th style={{ padding: '12px 16px' }}>AMOUNT</th>
                <th style={{ padding: '12px 16px' }}>DUE DATE</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{inv.client_name}</td>
                  <td style={{ padding: '16px', color: 'var(--text2)', fontSize: '0.9rem' }}>{inv.project_title || '—'}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>${parseFloat(inv.amount).toLocaleString()}</td>
                  <td style={{ padding: '16px', color: 'var(--text2)', fontSize: '0.9rem' }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${STATUS_COLORS[inv.status] || 'badge-pending'}`}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {inv.status !== 'paid' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(inv.id, 'paid')}>
                          Mark Paid
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(inv.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Invoice</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Client *</label>
                <select value={form.client_id} onChange={set('client_id')} required>
                  <option value="">— Select client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Project</label>
                <select value={form.project_id} onChange={set('project_id')}>
                  <option value="">— Select project (optional) —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($) *</label>
                <input type="number" value={form.amount} onChange={set('amount')} placeholder="1500.00" step="0.01" min="0" required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.due_date} onChange={set('due_date')} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={set('notes')} placeholder="Payment terms, bank details, etc." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
