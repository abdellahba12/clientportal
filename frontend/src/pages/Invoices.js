import { useEffect, useState } from 'react';
import api from '../api';
import { useLang } from '../context/LangContext';

const STATUS_COLORS = { pending: 'badge-pending', paid: 'badge-paid', overdue: 'badge-overdue' };

export default function Invoices() {
  const { t } = useLang();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', project_id: '', amount: '', due_date: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => Promise.all([api.get('/invoices'), api.get('/clients'), api.get('/projects')])
    .then(([inv, cli, proj]) => { setInvoices(inv.data); setClients(cli.data); setProjects(proj.data); }).finally(() => setLoading(false));

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
      setError(err.response?.data?.error || t('somethingWrong'));
    }
  };

  const updateStatus = async (id, status) => { await api.put(`/invoices/${id}`, { status }); fetchAll(); };
  const deleteInvoice = async (id) => {
    if (!window.confirm(t('deleteInvoiceConfirm'))) return;
    await api.delete(`/invoices/${id}`);
    fetchAll();
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + parseFloat(i.amount), 0);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('invoices')}</h1>
          <p>{invoices.length} {t('totalInvoicesCount')}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setError(''); setShowModal(true); }}>{t('newInvoice')}</button>
      </div>
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">${totalRevenue.toLocaleString()}</div><div className="stat-label">{t('revenueCollectedStat')}</div></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">${totalPending.toLocaleString()}</div><div className="stat-label">{t('pendingPayment')}</div></div>
        <div className="stat-card"><div className="stat-icon">🧾</div><div className="stat-value">{invoices.length}</div><div className="stat-label">{t('totalInvoices')}</div></div>
      </div>
      {invoices.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💰</div><h3>{t('noInvoicesYet')}</h3><p>{t('noInvoicesDesc')}</p></div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)', fontSize: '0.8rem', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>{t('clientCol')}</th>
                <th style={{ padding: '12px 16px' }}>{t('projectCol')}</th>
                <th style={{ padding: '12px 16px' }}>{t('amountCol')}</th>
                <th style={{ padding: '12px 16px' }}>{t('dueDateCol')}</th>
                <th style={{ padding: '12px 16px' }}>{t('statusCol')}</th>
                <th style={{ padding: '12px 16px' }}>{t('actionsCol')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{inv.client_name}</td>
                  <td style={{ padding: '16px', color: 'var(--text2)', fontSize: '0.9rem' }}>{inv.project_title || '—'}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>${parseFloat(inv.amount).toLocaleString()}</td>
                  <td style={{ padding: '16px', color: 'var(--text2)', fontSize: '0.9rem' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '16px' }}><span className={`badge ${STATUS_COLORS[inv.status] || 'badge-pending'}`}>{t(inv.status)}</span></td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {inv.status !== 'paid' && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(inv.id, 'paid')}>{t('markPaid')}</button>}
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
            <h2>{t('newInvoiceTitle')}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>{t('clients')} *</label><select value={form.client_id} onChange={set('client_id')} required><option value="">{t('selectClient')}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label>{t('projects')}</label><select value={form.project_id} onChange={set('project_id')}><option value="">{t('selectProject')}</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
              <div className="form-group"><label>{t('amount')}</label><input type="number" value={form.amount} onChange={set('amount')} placeholder="1500.00" step="0.01" min="0" required /></div>
              <div className="form-group"><label>{t('dueDate')}</label><input type="date" value={form.due_date} onChange={set('due_date')} /></div>
              <div className="form-group"><label>{t('notes')}</label><textarea value={form.notes} onChange={set('notes')} placeholder={t('notesPlaceholder')} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{t('createInvoice')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
