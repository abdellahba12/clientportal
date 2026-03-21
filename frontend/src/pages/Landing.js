import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const content = {
  es: {
    nav: { features: 'Características', pricing: 'Precios', login: 'Iniciar sesión', cta: 'Empezar gratis' },
    hero: {
      badge: '✨ Nuevo — Portal de cliente incluido',
      title1: 'Gestiona tus clientes',
      title2: 'como un profesional',
      subtitle: 'La plataforma todo-en-uno para freelancers y agencias. Proyectos, archivos, facturas y mensajes en un solo lugar.',
      cta: 'Empezar gratis →',
      sub: 'Sin tarjeta de crédito · 2 clientes gratis',
    },
    stats: [
      { value: '10,000+', label: 'Proyectos gestionados' },
      { value: '2,500+', label: 'Freelancers activos' },
      { value: '95%', label: 'Tiempo ahorrado' },
      { value: '4.9★', label: 'Valoración media' },
    ],
    features: {
      title: 'Todo lo que necesitas',
      subtitle: 'Deja de perder tiempo con emails y carpetas de Drive. ClientPortal centraliza todo tu negocio.',
      items: [
        { icon: '👥', title: 'Gestión de clientes', desc: 'Ficha completa de cada cliente con historial de proyectos, archivos y conversaciones.' },
        { icon: '📁', title: 'Seguimiento de proyectos', desc: 'Tareas, progreso visual y estados actualizados. Sabe siempre en qué punto está cada trabajo.' },
        { icon: '🔗', title: 'Portal del cliente', desc: 'Cada cliente tiene su propio espacio donde puede ver el estado de su proyecto y comunicarse contigo.' },
        { icon: '💬', title: 'Mensajes integrados', desc: 'Olvídate del email. Toda la comunicación de cada proyecto en un solo hilo organizado.' },
        { icon: '💰', title: 'Facturas profesionales', desc: 'Crea y envía facturas en segundos. Controla qué está pagado y qué está pendiente.' },
        { icon: '📎', title: 'Gestión de archivos', desc: 'Sube y comparte archivos directamente en cada proyecto. Hasta 10MB por archivo.' },
      ]
    },
    pricing: {
      title: 'Precios simples y transparentes',
      subtitle: 'Empieza gratis y escala cuando lo necesites.',
      plans: [
        {
          name: 'Gratis', price: '0', period: '/mes', color: '#6b7280',
          features: ['Hasta 2 clientes', 'Proyectos ilimitados', 'Portal del cliente', 'Gestión de archivos', 'Soporte estándar'],
          cta: 'Empezar gratis', highlighted: false,
        },
        {
          name: 'Pro', price: '29', period: '/mes', color: '#4f6ef7',
          badge: 'Más popular',
          features: ['Clientes ilimitados', 'Proyectos ilimitados', 'Portal del cliente', 'Notificaciones por email', 'Soporte prioritario', 'Archivos ilimitados'],
          cta: 'Empezar con Pro', highlighted: true,
        },
      ]
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        { q: '¿Necesito tarjeta de crédito para empezar?', a: 'No. El plan gratuito no requiere ningún dato de pago. Puedes usar ClientPortal con hasta 2 clientes sin coste.' },
        { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Sin permanencia ni penalizaciones. Cancela cuando quieras desde tu panel de suscripción.' },
        { q: '¿Mis clientes necesitan crear una cuenta?', a: 'No. Cada cliente recibe un enlace único a su portal personal. Sin registro necesario.' },
        { q: '¿Es seguro subir archivos?', a: 'Sí. Todos los archivos se almacenan de forma segura y solo son accesibles para ti y tu cliente.' },
      ]
    },
    cta: {
      title: '¿Listo para profesionalizar tu negocio?',
      subtitle: 'Únete a miles de freelancers que ya gestionan sus clientes con ClientPortal.',
      btn: 'Crear cuenta gratis →',
    },
    footer: 'Todos los derechos reservados.',
  },
  en: {
    nav: { features: 'Features', pricing: 'Pricing', login: 'Log in', cta: 'Get started free' },
    hero: {
      badge: '✨ New — Client portal included',
      title1: 'Manage your clients',
      title2: 'like a professional',
      subtitle: 'The all-in-one platform for freelancers and agencies. Projects, files, invoices and messages in one place.',
      cta: 'Get started free →',
      sub: 'No credit card required · 2 free clients',
    },
    stats: [
      { value: '10,000+', label: 'Projects managed' },
      { value: '2,500+', label: 'Active freelancers' },
      { value: '95%', label: 'Time saved' },
      { value: '4.9★', label: 'Average rating' },
    ],
    features: {
      title: 'Everything you need',
      subtitle: 'Stop wasting time with emails and Drive folders. ClientPortal centralizes your entire business.',
      items: [
        { icon: '👥', title: 'Client management', desc: 'Complete profile for each client with project history, files and conversations.' },
        { icon: '📁', title: 'Project tracking', desc: 'Tasks, visual progress and updated statuses. Always know where each job stands.' },
        { icon: '🔗', title: 'Client portal', desc: 'Each client has their own space where they can see their project status and communicate with you.' },
        { icon: '💬', title: 'Integrated messages', desc: 'Forget email. All communication for each project in one organized thread.' },
        { icon: '💰', title: 'Professional invoices', desc: 'Create and send invoices in seconds. Track what\'s paid and what\'s pending.' },
        { icon: '📎', title: 'File management', desc: 'Upload and share files directly in each project. Up to 10MB per file.' },
      ]
    },
    pricing: {
      title: 'Simple, transparent pricing',
      subtitle: 'Start free and scale when you need it.',
      plans: [
        {
          name: 'Free', price: '0', period: '/mo', color: '#6b7280',
          features: ['Up to 2 clients', 'Unlimited projects', 'Client portal', 'File management', 'Standard support'],
          cta: 'Get started free', highlighted: false,
        },
        {
          name: 'Pro', price: '29', period: '/mo', color: '#4f6ef7',
          badge: 'Most popular',
          features: ['Unlimited clients', 'Unlimited projects', 'Client portal', 'Email notifications', 'Priority support', 'Unlimited files'],
          cta: 'Start with Pro', highlighted: true,
        },
      ]
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        { q: 'Do I need a credit card to get started?', a: 'No. The free plan requires no payment details. You can use ClientPortal with up to 2 clients at no cost.' },
        { q: 'Can I cancel at any time?', a: 'Yes. No lock-in or penalties. Cancel whenever you want from your subscription panel.' },
        { q: 'Do my clients need to create an account?', a: 'No. Each client receives a unique link to their personal portal. No registration required.' },
        { q: 'Is it safe to upload files?', a: 'Yes. All files are stored securely and are only accessible to you and your client.' },
      ]
    },
    cta: {
      title: 'Ready to professionalize your business?',
      subtitle: 'Join thousands of freelancers already managing their clients with ClientPortal.',
      btn: 'Create free account →',
    },
    footer: 'All rights reserved.',
  }
};

export default function Landing() {
  const [lang, setLang] = useState('es');
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const t = content[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d1340', background: '#fff', overflowX: 'hidden' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e5e9f8' : 'none',
        transition: 'all 0.3s',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ClientPortal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="#features" style={navLinkStyle}>{t.nav.features}</a>
          <a href="#pricing" style={navLinkStyle}>{t.nav.pricing}</a>
          <button onClick={() => setLang(l => l === 'es' ? 'en' : 'es')} style={langBtnStyle}>
            {lang === 'es' ? <><img src="https://flagcdn.com/w20/gb.png" alt="EN" style={{width:14,borderRadius:2,verticalAlign:'middle'}}/> EN</> : <><img src="https://flagcdn.com/w20/es.png" alt="ES" style={{width:14,borderRadius:2,verticalAlign:'middle'}}/> ES</>}
          </button>
          <Link to="/login" style={navLinkStyle}>{t.nav.login}</Link>
          <Link to="/register" style={ctaBtnStyle}>{t.nav.cta}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0f4ff 0%, #f8f5ff 50%, #fff0fa 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,110,247,0.08) 0%, transparent 70%)', top: '10%', left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#4f6ef7', marginBottom: 28 }}>
          {t.hero.badge}
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 12, maxWidth: 800 }}>
          {t.hero.title1}<br/>
          <span style={{ background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.hero.title2}</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#667099', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          {t.hero.subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Link to="/register" style={{ ...ctaBtnStyle, fontSize: '1rem', padding: '14px 32px', borderRadius: 14, boxShadow: '0 8px 24px rgba(79,110,247,0.35)' }}>
            {t.hero.cta}
          </Link>
          <span style={{ fontSize: '0.82rem', color: '#9ba5c9' }}>{t.hero.sub}</span>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#667099', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 40px', background: '#fff', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 14 }}>{t.features.title}</h2>
          <p style={{ color: '#667099', fontSize: '1rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>{t.features.subtitle}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {t.features.items.map((f, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 20, border: '1.5px solid #e5e9f8', background: '#fafbff', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f6ef7'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,110,247,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e9f8'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, rgba(79,110,247,0.1), rgba(124,92,252,0.1))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#667099', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 40px', background: 'linear-gradient(160deg, #f8f7ff 0%, #fff 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 14 }}>{t.pricing.title}</h2>
          <p style={{ color: '#667099', fontSize: '1rem' }}>{t.pricing.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {t.pricing.plans.map((plan, i) => (
            <div key={i} style={{
              flex: '1', minWidth: 280, maxWidth: 340,
              padding: 32, borderRadius: 24,
              border: plan.highlighted ? '2px solid #4f6ef7' : '1.5px solid #e5e9f8',
              background: plan.highlighted ? 'linear-gradient(160deg, #eef1fe, #f3eeff)' : 'white',
              boxShadow: plan.highlighted ? '0 16px 48px rgba(79,110,247,0.15)' : '0 2px 12px rgba(0,0,0,0.04)',
              position: 'relative',
            }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: plan.highlighted ? '#4f6ef7' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#0d1340', lineHeight: 1 }}>€{plan.price}</span>
                  <span style={{ color: '#667099', fontSize: '0.9rem', marginBottom: 8 }}>{plan.period}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                    <span style={{ color: '#0fb981', fontWeight: 700 }}>✓</span>
                    <span style={{ color: '#0d1340' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', padding: '12px 20px',
                borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                background: plan.highlighted ? 'linear-gradient(135deg, #4f6ef7, #7c5cfc)' : 'white',
                color: plan.highlighted ? 'white' : '#0d1340',
                border: plan.highlighted ? 'none' : '1.5px solid #e5e9f8',
                boxShadow: plan.highlighted ? '0 4px 14px rgba(79,110,247,0.3)' : 'none',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 40px', background: '#fff', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>{t.faq.title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {t.faq.items.map((item, i) => (
            <div key={i} style={{ border: '1.5px solid #e5e9f8', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
                {item.q}
                <span style={{ color: '#4f6ef7', fontSize: '1.2rem', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 24px 18px', color: '#667099', fontSize: '0.875rem', lineHeight: 1.7 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #4f6ef7 0%, #7c5cfc 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', marginBottom: 16, maxWidth: 600, margin: '0 auto 16px' }}>{t.cta.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 36 }}>{t.cta.subtitle}</p>
        <Link to="/register" style={{ display: 'inline-block', background: 'white', color: '#4f6ef7', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {t.cta.btn}
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', background: '#0d1340', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ClientPortal</div>
        <div style={{ color: '#667099', fontSize: '0.82rem' }}>© 2026 ClientPortal. {t.footer}</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/login" style={{ color: '#667099', fontSize: '0.82rem', textDecoration: 'none' }}>{t.nav.login}</Link>
          <Link to="/register" style={{ color: '#4f6ef7', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>{t.nav.cta}</Link>
        </div>
      </footer>
    </div>
  );
}

const navLinkStyle = { color: '#667099', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '8px 14px', borderRadius: 8, transition: 'all 0.15s' };
const ctaBtnStyle = { background: 'linear-gradient(135deg, #4f6ef7, #7c5cfc)', color: 'white', padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', border: 'none', cursor: 'pointer', display: 'inline-block' };
const langBtnStyle = { background: '#f4f6fd', border: '1px solid #e5e9f8', borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: '#667099', display: 'flex', alignItems: 'center', gap: 4 };
