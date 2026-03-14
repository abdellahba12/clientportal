import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: t('dashboard'), icon: '⚡' },
    { to: '/clients', label: t('clients'), icon: '👥' },
    { to: '/projects', label: t('projects'), icon: '📁' },
    { to: '/invoices', label: t('invoices'), icon: '💰' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">ClientPortal</div>
        <nav>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={toggleLang} className="lang-toggle">
            {lang === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
          </button>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="plan">{user?.plan === 'free' ? t('freePlan') : t('proPlan')}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }}>
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
