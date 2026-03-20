import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || t('loginFailed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">ClientPortal</div>
        <h2>{lang === 'es' ? 'Gestiona tu negocio como un profesional' : 'Manage your business like a pro'}</h2>
        <p>{lang === 'es' ? 'Todo lo que necesitas para gestionar clientes, proyectos, archivos y facturas en un solo lugar.' : 'Everything you need to manage clients, projects, files and invoices in one place.'}</p>
        <div className="auth-features">
          {(lang === 'es' ? ['Portal de cliente incluido','Notificaciones por email','Facturas profesionales','Seguimiento de proyectos'] : ['Client portal included','Email notifications','Professional invoices','Project tracking']).map(f => (
            <div key={f} className="auth-feature"><div className="auth-feature-dot" />{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <span className="auth-logo">ClientPortal</span>
          <h1>{t('welcomeBack')}</h1>
          <p>{t('signInSubtitle')}</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="form-group">
              <label>{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{marginTop:8}}>
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>
          <div className="auth-link">{t('noAccount')} <Link to="/register">{t('createFree')}</Link></div>
          <div style={{marginTop:16,textAlign:'center'}}>
            <button onClick={toggleLang} className="lang-toggle" style={{width:'auto',display:'inline-flex'}}>
              {lang==='en' ? <><img src="https://flagcdn.com/w20/es.png" alt="ES" style={{width:14,borderRadius:2}}/> Español</> : <><img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{width:14,borderRadius:2}}/> English</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
