import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useLang } from '../context/LangContext';

const STATUSES = ['pending', 'active', 'done'];
const STATUS_COLORS = { pending: 'badge-pending', active: 'badge-active', done: 'badge-done' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef();

  const fetch = () => api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [project?.messages]);

  const updateStatus = async (status) => { await api.put(`/projects/${id}`, { ...project, status }); setProject(p => ({ ...p, status })); };
  const addTask = async (e) => { e.preventDefault(); if (!newTask.trim()) return; await api.post(`/projects/${id}/tasks`, { title: newTask }); setNewTask(''); fetch(); };
  const toggleTask = async (task) => { const status = task.status === 'done' ? 'pending' : 'done'; await api.put(`/projects/${id}/tasks/${task.id}`, { ...task, status }); fetch(); };
  const deleteTask = async (taskId) => { await api.delete(`/projects/${id}/tasks/${taskId}`); fetch(); };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/files/upload/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || t('uploadFailed'));
    } finally { setUploading(false); }
  };

  const deleteFile = async (fileId) => { if (!window.confirm(t('deleteFile'))) return; await api.delete(`/files/${fileId}`); fetch(); };
  const sendMessage = async (e) => { e.preventDefault(); if (!newMessage.trim()) return; await api.post(`/messages/${id}`, { content: newMessage }); setNewMessage(''); fetch(); };
  const formatSize = (bytes) => { if (!bytes) return ''; if (bytes < 1024) return bytes + ' B'; if (bytes < 1024*1024) return (bytes/1024).toFixed(1)+' KB'; return (bytes/(1024*1024)).toFixed(1)+' MB'; };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!project) return null;

  const doneTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', marginBottom: 8, fontSize: '0.9rem' }}>{t('back')}</button>
          <h1>{project.title}</h1>
          {project.client_name && <p>👤 {project.client_name}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => updateStatus(s)} className={`btn btn-sm ${project.status === s ? 'btn-primary' : 'btn-secondary'}`} style={{ width: 'auto' }}>{t(s)}</button>
          ))}
        </div>
      </div>
      {project.description && <div className="card" style={{ marginBottom: 24 }}><p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{project.description}</p></div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem' }}>{t('tasks')}</h2>
            <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{doneTasks}/{totalTasks}</span>
          </div>
          {totalTasks > 0 && <div style={{ background: 'var(--bg3)', borderRadius: 8, height: 6, marginBottom: 16, overflow: 'hidden' }}><div style={{ background: 'var(--accent)', height: '100%', width: `${totalTasks ? (doneTasks/totalTasks)*100 : 0}%`, transition: 'width 0.3s' }} /></div>}
          <div className="task-list" style={{ marginBottom: 16 }}>
            {project.tasks?.map(task => (
              <div key={task.id} className="task-item">
                <input type="checkbox" checked={task.status === 'done'} onChange={() => toggleTask(task)} />
                <span className={`task-title${task.status === 'done' ? ' done' : ''}`}>{task.title}</span>
                <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
            ))}
          </div>
          <form onSubmit={addTask} style={{ display: 'flex', gap: 8 }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder={t('addTask')} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', outline: 'none' }} />
            <button type="submit" className="btn btn-secondary btn-sm">{t('add')}</button>
          </form>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem' }}>{t('files')}</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? t('uploading') : t('upload')}</button>
            <input ref={fileInputRef} type="file" hidden onChange={uploadFile} />
          </div>
          <div className="file-list">
            {project.files?.length === 0 && <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{t('noFiles')}</p>}
            {project.files?.map(f => (
              <div key={f.id} className="file-item">
                <span className="file-icon">📎</span>
                <div className="file-info"><div className="file-name">{f.name}</div><div className="file-size">{formatSize(f.size)}</div></div>
                <a href={`${process.env.REACT_APP_API_URL?.replace('/api','')}/${f.path}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">↓</a>
                <button className="btn btn-danger btn-sm" onClick={() => deleteFile(f.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>{t('messages')}</h2>
        <div className="messages-container">
          {project.messages?.length === 0 && <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{t('noMessages')}</p>}
          {project.messages?.map(m => (
            <div key={m.id} className={`message ${m.sender_type}`}>
              <div>{m.content}</div>
              <div className="msg-time">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="message-input">
          <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={t('typeMessage')} />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{t('send')}</button>
        </form>
      </div>
    </div>
  );
}
