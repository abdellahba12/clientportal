import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Upgrade() {
  const { user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.post('/stripe/create-checkout');
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const res = await api.post('/stripe/portal');
      window.location.href = res.data.url;
    } catch {
      alert('No se encontró una suscripción activa');
      setPortalLoading(false);
    }
  };

  const features = lang === 'es'
    ? ['Clientes ilimitados', 'Proyectos ilimitados', 'Portal del cliente', 'Notificaciones por email', 'Soporte prioritario', 'Subida de archivos ilimitada']
    : ['Unlimited clients', 'Unlimited projects', 'Client portal', 'Email notifications', 'Priority support', 'Unlimited file uploads'];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 0' }}>
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1>{lang === 'es' ? 'Actualiza a Pro' : 'Upgrade to Pro'}</h1>
        <p>{lang === 'es' ? 'Desbloquea todo el potencial de ClientPortal' : 'Unlock the full potential of ClientPortal'}</p>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #eef1fe, #f3eeff)', border: '2px solid rgba(79,110,247,0.2)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Pro Plan</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              €29<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text2)' }}>/mes</span>
            </div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text2)', marginTop: 4 }}>
              {lang === 'es' ? 'Facturado mensualmente · Cancela cuando quieras' : 'Billed monthly · Cancel anytime'}
            </div>
          </div>
          <div style={{ background: 'var(--accent)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
            {lang === 'es' ? 'Más popular' : 'Most popular'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1rem' }}>✓</span>
              <span style={{ color: 'var(--text)' }}>{f}</span>
            </div>
          ))}
        </div>

        {user?.plan === 'pro' ? (
          <div>
            <div style={{ background: 'rgba(15,185,129,0.1)', border: '1px solid rgba(15,185,129,0.2)', color: 'var(--success)', padding: '12px 16px', borderRadius: 10, marginBottom: 12, fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
              ✅ {lang === 'es' ? 'Ya tienes el Plan Pro activo' : 'You already have Pro Plan active'}
            </div>
            <button onClick={handleManage} disabled={portalLoading} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              {portalLoading ? '...' : (lang === 'es' ? 'Gestionar suscripción →' : 'Manage subscription →')}
            </button>
          </div>
        ) : (
          <button onClick={handleUpgrade} disabled={loading} className="btn btn-primary">
            {loading ? (lang === 'es' ? 'Redirigiendo a Stripe...' : 'Redirecting to Stripe...') : (lang === 'es' ? '⚡ Actualizar a Pro — €29/mes' : '⚡ Upgrade to Pro — €29/month')}
          </button>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.9rem', marginBottom: 14, fontWeight: 700 }}>
          {lang === 'es' ? 'Plan Gratuito (actual)' : 'Free Plan (current)'}
        </h3>
        {(lang === 'es' ? ['Hasta 2 clientes', 'Proyectos ilimitados', 'Portal del cliente', 'Soporte estándar'] : ['Up to 2 clients', 'Unlimited projects', 'Client portal', 'Standard support']).map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', marginBottom: 8 }}>
            <span style={{ color: 'var(--text3)' }}>–</span>
            <span style={{ color: 'var(--text2)' }}>{f}</span>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
        {lang === 'es' ? '← Volver al inicio' : '← Back to dashboard'}
      </button>
    </div>
  );
}
