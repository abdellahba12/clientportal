import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form.name, form.email, form.password); navigate('/app'); }
    catch (err) { setError(err.response?.data?.error || t('registrationFailed')); }
    finally { setLoading(false); }
  };

  const set = f => e => setForm(p => ({...p, [f]: e.target.value}));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">ClientPortal</div>
        <h2>{lang === 'es' ? 'Empieza gratis hoy mismo' : 'Start for free today'}</h2>
        <p>{lang === 'es' ? 'Únete a miles de freelancers y empresas que ya gestionan sus clientes con ClientPortal.' : 'Join thousands of freelancers and companies already managing their clients with ClientPortal.'}</p>
        <div className="auth-features">
          {(lang === 'es' ? ['Sin tarjeta de crédito','2 clientes gratis','Portal del cliente incluido','Soporte por email'] : ['No credit card required','2 free clients','Client portal included','Email support']).map(f => (
            <div key={f} className="auth-feature"><div className="auth-feature-dot"/>{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <span className="auth-logo">ClientPortal</span>
          <h1>{t('getStarted')}</h1>
          <p>{t('registerSubtitle')}</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>{t('fullName')}</label><input value={form.name} onChange={set('name')} placeholder="John Smith" required /></div>
            <div className="form-group"><label>{t('email')}</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required /></div>
            <div className="form-group"><label>{t('password')}</label><input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars" minLength={8} required /></div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{marginTop:8}}>
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>
          <div className="auth-link">{t('alreadyAccount')} <Link to="/login">{lang==='es'?'Inicia sesión':'Sign in'}</Link></div>
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
