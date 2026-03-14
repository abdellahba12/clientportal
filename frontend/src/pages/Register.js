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
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={toggleLang} className="lang-toggle" style={{ marginBottom: 16 }}>
          {lang === 'en' ? (
            <><img src="https://flagcdn.com/w20/es.png" alt="ES" style={{width:20, marginRight:6, borderRadius:2, verticalAlign:'middle'}} />Español</>
          ) : (
            <><img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{width:20, marginRight:6, borderRadius:2, verticalAlign:'middle'}} />English</>
          )}
        </button>
        <h1>{t('getStarted')}</h1>
        <p>{t('registerSubtitle')}</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('fullName')}</label>
            <input value={form.name} onChange={set('name')} placeholder={t('namePlaceholder')} required />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 caracteres" minLength={8} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>
        <div className="auth-link">
          {t('alreadyAccount')} <Link to="/login">{t('signIn').replace(' →','')}</Link>
        </div>
      </div>
    </div>
  );
}
