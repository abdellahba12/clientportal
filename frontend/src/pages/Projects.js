import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useLang } from '../context/LangContext';

const STATUS_COLORS = { pending: 'badge-pending', active: 'badge-active', done: 'badge-done' };

export default function Projects() {
  const { t } = useLang();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', client_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => Promise.all([api.get('/projects'), api.get('/clients')])
    .then(([p, c]) => { setProjects(p.data); setClients(c.data); }).finally(() => setLoading(false));

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', form);
      setShowModal(false);
      setForm({ title: '', description: '', client_id: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || t('somethingWrong'));
    }
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('projects')}</h1>
          <p>{projects.length} {t('totalProjectsCount')}</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setError(''); setShowModal(true); }}>{t('newProject')}</button>
      </div>
      {projects.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📁</div><h3>{t('noProjectsYet2')}</h3><p>{t('noProjectsDesc2')}</p></div>
      ) : (
        <div className="card-grid">
          {projects.map(p => (
            <Link to={`/projects/${p.id}`} key={p.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem' }}>{p.title}</h3>
                <span className={`badge ${STATUS_COLORS[p.status] || 'badge-pending'}`}>{t(p.status)}</span>
              </div>
              {p.client_name && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', marginBottom: 8 }}>👤 {p.client_name}</p>}
              {p.description && <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>}
              <p style={{ color: 'var(--text2)', fontSize: '0.75rem', marginTop: 12 }}>{new Date(p.created_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{t('newProjectTitle')}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>{t('title')}</label><input value={form.title} onChange={set('title')} placeholder={t('titlePlaceholder')} required /></div>
              <div className="form-group">
                <label>{t('client')}</label>
                <select value={form.client_id} onChange={set('client_id')}>
                  <option value="">{t('noClientOption')}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>{t('description')}</label><textarea value={form.description} onChange={set('description')} placeholder={t('descriptionPlaceholder')} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{t('createProject')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
