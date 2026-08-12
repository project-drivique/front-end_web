import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRecover } from '../hooks/useRecover'
import RecoveryStepper from '../components/RecoveryStepper'
import AlertModal from '@/modules/catalog/components/AlertModal'
import { FaExclamationTriangle } from 'react-icons/fa'

export default function RecuperarContrasenaPage() {
  const { t } = useTranslation()
  const { correo, setCorreo, cargando, error, handleSubmit } = useRecover()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) {
      setShowModal(true)
    }
  }, [error])

  const isNotRegistered = error && error.toLowerCase().includes('registrado')

  return (
    <div style={{ minHeight: '112vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', zoom: 0.9, position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Background Animado ── */}
      <style>{`
        @keyframes float1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 50px) scale(1.1); } }
        @keyframes float2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-100px, -50px) scale(1.15); } }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .input-premium:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important; background: #fff !important; }
        .btn-premium:hover { box-shadow: 0 12px 24px rgba(37,99,235,0.35) !important; transform: translateY(-2px) !important; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset; }
      `}</style>
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float1 12s ease-in-out infinite alternate', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float2 16s ease-in-out infinite alternate', zIndex: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', zIndex: 1, position: 'relative' }}>
        
        {/* ── Botón Flotante Volver ── */}
        <Link
          to="/login"
          style={{ position: 'absolute', top: '32px', left: '32px', zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 700, background: 'rgba(255,255,255,0.7)', padding: '10px 16px', borderRadius: '100px', border: '1px solid rgba(203,213,225,0.6)', backdropFilter: 'blur(12px)', transition: 'all 200ms', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1e3a8a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('recuperar.backToLogin')}
        </Link>

        <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px' }}>
          <RecoveryStepper currentStep={1} />
        </div>

        <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.12)', boxShadow: '0 4px 24px rgba(30,58,138,0.07)', padding: '48px 40px', textAlign: 'left', transition: 'all 300ms' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {t('recuperar.title')}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {t('recuperar.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                {t('recuperar.email')}
              </label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder={t('recuperar.emailPlaceholder')}
                className="input-premium"
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: '14px',
                  border: error ? '1.5px solid #fecaca' : '1.5px solid rgba(203,213,225,0.6)',
                  background: error ? '#fef2f2' : 'rgba(255,255,255,0.6)',
                  fontSize: '15px', color: '#0f172a', outline: 'none',
                  transition: 'all 200ms', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn-premium"
              style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff', fontSize: '15px', fontWeight: 800, border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', transition: 'all 200ms', marginTop: '4px', opacity: cargando ? 0.8 : 1, boxShadow: '0 6px 20px rgba(30,58,138,0.2)' }}
            >
              {cargando ? t('recuperar.sending') : t('recuperar.submit')}
            </button>
          </form>
          
          <div style={{ marginTop: '32px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
            {t('recuperar.noAccount')} <Link to="/registro" style={{ color: '#1e3a8a', fontWeight: 800, textDecoration: 'none' }}>{t('recuperar.registerHere')}</Link>
          </div>
        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color="#1e3a8a" />}
          titulo={isNotRegistered ? t('recuperar.notRegisteredTitle') : 'Error'}
          mensaje={isNotRegistered ? t('recuperar.notRegisteredSub') : error}
          primaryText="OK"
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}