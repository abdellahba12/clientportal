import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0, invoices: 0, revenue: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get('/projects'),
      api.get('/invoices'),
    ]).then(([clients, projects, invoices]) => {
      const paid = invoices.data.filter(i => i.status === 'paid');
      const revenue = paid.reduce((sum, i) => sum + parseFloat(i.amount), 0);
      setStats({
        clients: clients.data.length,
        projects: projects.data.length,
        invoices: invoices.data.length,
        revenue,
      });
      setRecentProjects(projects.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const statusColor = { pending: 'badge-pending', active: 'badge-active', done: 'badge-done' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your business</p>
        </div>
        <Link to="/projects" className="btn btn-primary" style={{ width: 'auto' }}>+ New Project</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats.projects}</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">${stats.revenue.toLocaleString()}</div>
          <div className="stat-label">Revenue Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">{stats.invoices}</div>
          <div className="stat-label">Invoices Sent</div>
        </div>
      </div>

      {user?.plan === 'free' && (
        <div className="card" style={{ marginBottom: 32, background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))', border: '1px solid rgba(108,99,255,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>⭐ Upgrade to Pro</h3>
              <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: '0.9rem' }}>Unlimited clients, priority support & more for $29/month</p>
            </div>
            <button className="btn btn-primary" style={{ width: 'auto' }}>Upgrade Now</button>
          </div>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: 20 }}>Recent Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
          </div>
        ) : (
          <div className="card-grid">
            {recentProjects.map(p => (
              <Link to={`/projects/${p.id}`} key={p.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1rem' }}>{p.title}</h3>
                  <span className={`badge ${statusColor[p.status] || 'badge-pending'}`}>{p.status}</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{p.client_name || 'No client'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
