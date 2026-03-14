import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export default function ClientPortal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    axios.get(`${API}/portal/${token}`)
      .then(r => { setData(r.data); if (r.data.projects?.length > 0) setSelectedProject(r.data.projects[0]); })
      .catch(() => setError('Portal no encontrado o enlace inválido'))
      .finally(() => setLoading(false));
  }, [token]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProject) return;
    setSending(true);
    try {
      await axios.post(`${API}/portal/${token}/message`, { project_id: selectedProject.id, content: newMessage });
      setNewMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      // Refresh messages
      const r = await axios.get(`${API}/portal/${token}`);
      setData(r.data);
      const updated = r.data.projects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    } catch { } finally { setSending(false); }
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.logo}>ClientPortal</div>
      <p style={{ color: '#9090aa' }}>Cargando tu portal...</p>
    </div>
  );

  if (error) return (
    <div style={styles.loading}>
      <div style={styles.logo}>ClientPortal</div>
      <div style={styles.errorBox}>{error}</div>
    </div>
  );

  const STATUS_LABELS = { pending: 'Pendiente', active: 'En progreso', done: 'Completado' };
  const STATUS_COLORS = { pending: '#f59e0b', active: '#6c63ff', done: '#22c55e' };
  const INVOICE_LABELS = { pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido' };
  const INVOICE_COLORS = { pending: '#f59e0b', paid: '#22c55e', overdue: '#ef4444' };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>ClientPortal</div>
        <div>
          <div style={styles.clientName}>{data.client.name}</div>
          {data.client.company && <div style={styles.clientCompany}>{data.client.company}</div>}
        </div>
      </div>

      <div style={styles.container}>
        {/* Projects sidebar */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>📁 Proyectos</h3>
          {data.projects.length === 0 && <p style={{ color: '#9090aa', fontSize: '0.85rem' }}>No hay proyectos todavía</p>}
          {data.projects.map(p => (
            <div key={p.id} onClick={() => setSelectedProject(p)}
              style={{ ...styles.projectItem, ...(selectedProject?.id === p.id ? styles.projectItemActive : {}) }}>
              <div style={styles.projectItemTitle}>{p.title}</div>
              <span style={{ ...styles.badge, background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status] }}>
                {STATUS_LABELS[p.status] || p.status}
              </span>
            </div>
          ))}

          {/* Invoices */}
          {data.invoices.length > 0 && (
            <>
              <h3 style={{ ...styles.sidebarTitle, marginTop: 24 }}>💰 Facturas</h3>
              {data.invoices.map(inv => (
                <div key={inv.id} style={styles.invoiceItem}>
                  <div style={{ fontWeight: 600 }}>${parseFloat(inv.amount).toLocaleString()}</div>
                  <span style={{ ...styles.badge, background: INVOICE_COLORS[inv.status] + '22', color: INVOICE_COLORS[inv.status] }}>
                    {INVOICE_LABELS[inv.status] || inv.status}
                  </span>
                  {inv.due_date && <div style={{ color: '#9090aa', fontSize: '0.75rem', marginTop: 4 }}>Vence: {new Date(inv.due_date).toLocaleDateString()}</div>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Main content */}
        {selectedProject && (
          <div style={styles.main}>
            <div style={styles.projectHeader}>
              <h2 style={styles.projectTitle}>{selectedProject.title}</h2>
              <span style={{ ...styles.badge, background: STATUS_COLORS[selectedProject.status] + '22', color: STATUS_COLORS[selectedProject.status], fontSize: '0.85rem', padding: '6px 14px' }}>
                {STATUS_LABELS[selectedProject.status]}
              </span>
            </div>
            {selectedProject.description && <p style={styles.description}>{selectedProject.description}</p>}

            <div style={styles.grid}>
              {/* Tasks */}
              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>✅ Tareas</h3>
                  {selectedProject.tasks.map(t => (
                    <div key={t.id} style={styles.taskItem}>
                      <span style={{ fontSize: '1rem' }}>{t.status === 'done' ? '✅' : '⬜'}</span>
                      <span style={{ ...styles.taskText, textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? '#9090aa' : '#f0f0f8' }}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Files */}
              {selectedProject.files && selectedProject.files.length > 0 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>📎 Archivos</h3>
                  {selectedProject.files.map(f => (
                    <div key={f.id} style={styles.fileItem}>
                      <span>📄</span>
                      <span style={{ flex: 1, fontSize: '0.9rem' }}>{f.name}</span>
                      <a href={`${API.replace('/api', '')}/${f.path}`} target="_blank" rel="noreferrer"
                        style={{ color: '#6c63ff', fontSize: '0.8rem', textDecoration: 'none' }}>↓ Descargar</a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💬 Mensajes</h3>
              <div style={styles.messagesBox}>
                {(!selectedProject.messages || selectedProject.messages.length === 0) && (
                  <p style={{ color: '#9090aa', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No hay mensajes todavía</p>
                )}
                {selectedProject.messages?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(m => (
                  <div key={m.id} style={{ ...styles.message, ...(m.sender_type === 'client' ? styles.messageClient : styles.messageFreelancer) }}>
                    <div style={{ fontSize: '0.75rem', color: '#9090aa', marginBottom: 4 }}>
                      {m.sender_type === 'client' ? 'Tú' : 'Tu proveedor'} · {new Date(m.created_at).toLocaleString()}
                    </div>
                    <div>{m.content}</div>
                  </div>
                ))}
              </div>
              {sent && <div style={styles.successMsg}>✅ Mensaje enviado</div>}
              <form onSubmit={sendMessage} style={styles.messageForm}>
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje a tu proveedor..."
                  style={styles.messageInput} />
                <button type="submit" disabled={sending} style={styles.sendBtn}>
                  {sending ? '...' : 'Enviar →'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f8', fontFamily: "'Inter', sans-serif" },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  header: { display: 'flex', alignItems: 'center', gap: 24, padding: '20px 40px', borderBottom: '1px solid #2a2a38', background: '#111118' },
  clientName: { fontWeight: 700, fontSize: '1.1rem' },
  clientCompany: { color: '#9090aa', fontSize: '0.85rem' },
  container: { display: 'flex', gap: 0, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  sidebar: { width: 240, minWidth: 240, marginRight: 32 },
  sidebarTitle: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9090aa', marginBottom: 12, fontFamily: "'Syne', sans-serif" },
  projectItem: { padding: '12px 16px', borderRadius: 10, cursor: 'pointer', marginBottom: 8, border: '1px solid #2a2a38', background: '#111118', transition: 'all 0.2s' },
  projectItemActive: { borderColor: '#6c63ff', background: 'rgba(108,99,255,0.1)' },
  projectItemTitle: { fontSize: '0.9rem', fontWeight: 500, marginBottom: 6 },
  invoiceItem: { padding: '12px 16px', borderRadius: 10, marginBottom: 8, border: '1px solid #2a2a38', background: '#111118' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  main: { flex: 1 },
  projectHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  projectTitle: { fontSize: '1.6rem', fontFamily: "'Syne', sans-serif" },
  description: { color: '#9090aa', marginBottom: 24, lineHeight: 1.7 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  card: { background: '#111118', border: '1px solid #2a2a38', borderRadius: 14, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: '0.95rem', fontFamily: "'Syne', sans-serif", marginBottom: 16 },
  taskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1a1a24' },
  taskText: { fontSize: '0.9rem' },
  fileItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1a1a24' },
  messagesBox: { maxHeight: 300, overflowY: 'auto', marginBottom: 16, padding: '8px 0' },
  message: { maxWidth: '80%', padding: '10px 14px', borderRadius: 12, marginBottom: 10, fontSize: '0.9rem' },
  messageFreelancer: { background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.2)', alignSelf: 'flex-start' },
  messageClient: { background: '#1a1a24', border: '1px solid #2a2a38', marginLeft: 'auto' },
  messageForm: { display: 'flex', gap: 10 },
  messageInput: { flex: 1, background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 10, padding: '12px 16px', color: '#f0f0f8', outline: 'none', fontFamily: "'Inter', sans-serif" },
  sendBtn: { background: 'linear-gradient(135deg, #6c63ff, #8b83ff)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontWeight: 600 },
  successMsg: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '10px 16px', borderRadius: 8, marginBottom: 12, fontSize: '0.85rem' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '16px 20px', borderRadius: 10, marginTop: 16 },
};
