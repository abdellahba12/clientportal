import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [stats, setStats] = useState({ clients: 0, projects: 0, invoices: 0, revenue: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/projects'), api.get('/invoices')])
      .then(([clients, projects, invoices]) => {
        const paid = invoices.data.filter(i => i.status === 'paid');
        const revenue = paid.reduce((sum, i) => sum + parseFloat(i.amount), 0);
        setStats({ clients: clients.data.length, projects: projects.data.length, invoices: invoices.data.length, revenue });
        setRecentProjects(projects.data.slice(0, 4));
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  const statusColor = { pending: 'badge-pending', active: 'badge-active', done: 'badge-done' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('hey')}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>{t('dashboardSubtitle')}</p>
        </div>
        <Link to="/projects" className="btn btn-primary" style={{ width: 'auto' }}>{t('newProject')}</Link>
      </div>

      <div className="stats-grid">
        {[
          { icon: '👥', value: stats.clients, label: t('totalClients'), color: '#3b6bff' },
          { icon: '📁', value: stats.projects, label: t('activeProjects'), color: '#7c3aed' },
          { icon: '💰', value: `$${stats.revenue.toLocaleString()}`, label: t('revenueCollected'), color: '#10b981' },
          { icon: '🧾', value: stats.invoices, label: t('totalInvoices'), color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '15' }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {user?.plan === 'free' && (
        <div className="upgrade-banner">
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t('upgradeTitle')}</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{t('upgradeSubtitle')}</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}>{t('upgradeNow')}</button>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: 18, fontSize: '1.1rem' }}>{t('recentProjects')}</h2>
        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>{t('noProjectsYet')}</h3>
            <p>{t('noProjectsDesc')}</p>
          </div>
        ) : (
          <div className="card-grid">
            {recentProjects.map(p => (
              <Link to={`/projects/${p.id}`} key={p.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ fontSize: '0.95rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.title}</h3>
                  <span className={`badge ${statusColor[p.status] || 'badge-pending'}`}>{t(p.status)}</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.83rem' }}>👤 {p.client_name || t('noClient')}</p>
                <p style={{ color: 'var(--text2)', fontSize: '0.77rem', marginTop: 8 }}>{new Date(p.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
