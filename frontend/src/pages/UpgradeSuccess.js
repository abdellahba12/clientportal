import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeSuccess() {
  const navigate = useNavigate();
  useEffect(() => { setTimeout(() => navigate('/'), 4000); }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: '4rem' }}>🎉</div>
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>¡Bienvenido a Pro!</h1>
      <p style={{ color: 'var(--text2)', maxWidth: 400 }}>Tu cuenta ha sido actualizada. Ahora tienes clientes ilimitados y todas las funciones Pro desbloqueadas.</p>
      <div style={{ background: 'rgba(15,185,129,0.1)', border: '1px solid rgba(15,185,129,0.2)', color: 'var(--success)', padding: '12px 20px', borderRadius: 12, fontWeight: 600 }}>
        Redirigiendo al dashboard...
      </div>
    </div>
  );
}
