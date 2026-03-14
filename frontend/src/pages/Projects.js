import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_COLORS = { pending: 'badge-pending', active: 'badge-active', done: 'badge-done' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', client_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => Promise.all([
    api.get('/projects'),
    api.get('/clients'),
  ]).then(([p, c]) => { setProjects(p.data); setClients(c.data); }).finally(() => setLoading(false));

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
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{projects.length} total projects</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setError(''); setShowModal(true); }}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start tracking work</p>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map(p => (
            <Link to={`/projects/${p.id}`} key={p.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem' }}>{p.title}</h3>
                <span className={`badge ${STATUS_COLORS[p.status] || 'badge-pending'}`}>{p.status}</span>
              </div>
              {p.client_name && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', marginBottom: 8 }}>👤 {p.client_name}</p>}
              {p.description && <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>}
              <p style={{ color: 'var(--text2)', fontSize: '0.75rem', marginTop: 12 }}>
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Project</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="Website Redesign" required />
              </div>
              <div className="form-group">
                <label>Client</label>
                <select value={form.client_id} onChange={set('client_id')}>
                  <option value="">— No client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')} placeholder="What's this project about?" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
