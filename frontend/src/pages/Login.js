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
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">ClientPortal</span>
        <h1>{t('welcomeBack')}</h1>
        <p>{t('signInSubtitle')}</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{marginTop: 8}}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <div className="auth-link">
          {t('noAccount')} <Link to="/register">{t('createFree')}</Link>
        </div>
        <div style={{marginTop: 16, textAlign: 'center'}}>
          <button onClick={toggleLang} className="lang-toggle" style={{width: 'auto', display: 'inline-flex'}}>
            {lang === 'en' ? <><img src="https://flagcdn.com/w20/es.png" alt="ES" style={{width:16, borderRadius:2}} /> Español</> : <><img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{width:16, borderRadius:2}} /> English</>}
          </button>
        </div>
      </div>
    </div>
  );
}
