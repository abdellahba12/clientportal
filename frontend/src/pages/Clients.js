import { useEffect, useState } from 'react';
import api from '../api';
import { useLang } from '../context/LangContext';

const FRONTEND_URL = window.location.origin;

export default function Clients() {
  const { t } = useLang();
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  const fetchClients = () => api.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchClients(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', company: '' }); setEditing(null); setError(''); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, email: c.email || '', company: c.company || '' }); setEditing(c); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) { await api.put(`/clients/${editing.id}`, form); }
      else { await api.post('/clients', form); }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.error || t('somethingWrong'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    await api.delete(`/clients/${id}`);
    fetchClients();
  };

  const copyPortalLink = (token) => {
    const url = `${FRONTEND_URL}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(''), 2000);
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('clients')}</h1>
          <p>{clients.length} {t('totalClientsCount')}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}>{t('addClient')}</button>
      </div>
      {clients.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><h3>{t('noClientsYet')}</h3><p>{t('noClientsDesc')}</p></div>
      ) : (
        <div className="card-grid">
          {clients.map(c => (
            <div key={c.id} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{c.name}</h3>
                  {c.company && <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginBottom: 8 }}>{c.company}</p>}
                  {c.email && <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>✉️ {c.email}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>{t('edit')}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>✕</button>
                </div>
              </div>
              {c.portal_token && (
                <button
                  onClick={() => copyPortalLink(c.portal_token)}
                  style={{ width: '100%', marginTop: 8, background: copied === c.portal_token ? 'rgba(34,197,94,0.15)' : 'rgba(108,99,255,0.1)', border: `1px solid ${copied === c.portal_token ? 'rgba(34,197,94,0.3)' : 'rgba(108,99,255,0.3)'}`, borderRadius: 8, padding: '8px 12px', color: copied === c.portal_token ? '#22c55e' : 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s' }}
                >
                  {copied === c.portal_token ? '✅ ¡Enlace copiado!' : '🔗 Copiar enlace del portal'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? t('editClient') : t('newClient')}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>{t('name')}</label><input value={form.name} onChange={set('name')} placeholder={t('namePlaceholder')} required /></div>
              <div className="form-group"><label>{t('email')}</label><input type="email" value={form.email} onChange={set('email')} placeholder={t('emailPlaceholder')} /></div>
              <div className="form-group"><label>{t('company')}</label><input value={form.company} onChange={set('company')} placeholder={t('companyPlaceholder')} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{editing ? t('saveChanges') : t('addClient')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
