import { useNavigate } from 'react-router-dom';

export default function UpgradeCancel() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Pago cancelado</h1>
      <p style={{ color: 'var(--text2)', maxWidth: 400 }}>No te preocupes, no se ha realizado ningún cargo. Puedes actualizar cuando quieras.</p>
      <button onClick={() => navigate('/app/upgrade')} className="btn btn-primary" style={{ width: 'auto' }}>Intentar de nuevo</button>
      <button onClick={() => navigate('/app')} className="btn btn-secondary" style={{ width: 'auto' }}>Volver al inicio</button>
    </div>
  );
}
