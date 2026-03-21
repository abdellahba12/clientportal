import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [stats, setStats] = useState({ clients: 0, projects: 0, invoices: 0, revenue: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/projects'), api.get('/invoices')])
      .then(([c, p, i]) => {
        const revenue = i.data.filter(x => x.status==='paid').reduce((s,x) => s+parseFloat(x.amount),0);
        setStats({ clients: c.data.length, projects: p.data.length, invoices: i.data.length, revenue });
        setRecentProjects(p.data.slice(0,4));
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  const statusColor = { pending:'badge-pending', active:'badge-active', done:'badge-done' };
  const now = new Date().toLocaleDateString(lang==='es'?'es-ES':'en-US',{weekday:'long',month:'long',day:'numeric'});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('hey')}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{textTransform:'capitalize'}}>{now}</p>
        </div>
        <Link to="/projects" className="btn btn-primary" style={{width:'auto'}}>
          + {lang==='es'?'Nuevo Proyecto':'New Project'}
        </Link>
      </div>

      <div className="stats-grid">
        {[
          { icon:'👥', value:stats.clients, label:t('totalClients'), color:'#4f6ef7', bg:'rgba(79,110,247,0.1)' },
          { icon:'📁', value:stats.projects, label:t('activeProjects'), color:'#7c5cfc', bg:'rgba(124,92,252,0.1)' },
          { icon:'💰', value:`$${stats.revenue.toLocaleString()}`, label:t('revenueCollected'), color:'#0fb981', bg:'rgba(15,185,129,0.1)' },
          { icon:'🧾', value:stats.invoices, label:t('totalInvoices'), color:'#f5a623', bg:'rgba(245,166,35,0.1)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon" style={{background:s.bg,color:s.color}}>{s.icon}</div>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {user?.plan==='free' && (
        <div className="upgrade-banner">
          <div>
            <h3 style={{fontSize:'0.95rem',fontWeight:700,marginBottom:3}}>{t('upgradeTitle')}</h3>
            <p style={{color:'var(--text2)',fontSize:'0.83rem'}}>{t('upgradeSubtitle')}</p>
          </div>
          <button className="btn btn-primary" style={{width:'auto',flexShrink:0}}>{t('upgradeNow')}</button>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h2 style={{fontSize:'1rem',fontWeight:700}}>{t('recentProjects')}</h2>
        <Link to="/projects" style={{fontSize:'0.82rem',color:'var(--accent)',textDecoration:'none',fontWeight:600}}>
          {lang==='es'?'Ver todos →':'View all →'}
        </Link>
      </div>

      {recentProjects.length===0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>{t('noProjectsYet')}</h3>
          <p>{t('noProjectsDesc')}</p>
        </div>
      ) : (
        <div className="card-grid">
          {recentProjects.map(p => (
            <Link to={`/app/projects/${p.id}`} key={p.id} className="item-card" style={{textDecoration:'none',color:'inherit'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <h3 style={{fontSize:'0.92rem',fontWeight:700,lineHeight:1.3}}>{p.title}</h3>
                <span className={`badge ${statusColor[p.status]||'badge-pending'}`}>{t(p.status)}</span>
              </div>
              {p.client_name && <p style={{color:'var(--text2)',fontSize:'0.8rem',marginBottom:6}}>👤 {p.client_name}</p>}
              {p.description && <p style={{color:'var(--text3)',fontSize:'0.8rem',lineHeight:1.5}}>{p.description.slice(0,70)}{p.description.length>70?'…':''}</p>}
              <p style={{color:'var(--text3)',fontSize:'0.73rem',marginTop:10}}>
                {new Date(p.created_at).toLocaleDateString(lang==='es'?'es-ES':'en-US')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
