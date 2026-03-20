import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: t('dashboard'), icon: '⚡', end: true },
    { to: '/clients', label: t('clients'), icon: '👥' },
    { to: '/projects', label: t('projects'), icon: '📁' },
    { to: '/invoices', label: t('invoices'), icon: '💰' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">ClientPortal</div>
          <div className="sidebar-tagline">Business Management</div>
        </div>

        <nav>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', fontWeight: 700, padding: '14px 4px 6px', marginBottom: 4 }}>
            {lang === 'es' ? 'Menú principal' : 'Main menu'}
          </div>
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={toggleLang} className="lang-toggle">
            {lang === 'en'
              ? <><img src="https://flagcdn.com/w20/es.png" alt="ES" style={{width:16,borderRadius:2}} /> Español</>
              : <><img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{width:16,borderRadius:2}} /> English</>
            }
          </button>

          <div className="user-card">
            <div className="user-card-top">
              <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="name">{user?.name}</div>
                <div className="email">{user?.email}</div>
              </div>
            </div>
            <div className="plan-badge">
              {user?.plan === 'free' ? '🆓 Free Plan' : '⭐ Pro Plan'}
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
