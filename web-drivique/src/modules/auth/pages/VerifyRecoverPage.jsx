import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVerifyRecover } from '../hooks/useVerifyRecover'
import RecoveryStepper from '../components/RecoveryStepper'
import AlertModal from '../../catalog/components/AlertModal'
import { FaExclamationTriangle } from 'react-icons/fa'

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VerifyRecoverPage() {
  const { t } = useTranslation()
  const {
    correo, codigo, cargando, error, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerifyRecover()
  
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (error) setShowModal(true)
  }, [error])

  return (
    <div style={{ minHeight: '112vh', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f8fafc', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', zoom: 0.9, position: 'relative', overflow: 'hidden' }}>
      
      {/* ── Background Animado ── */}
      <style>{`
        @keyframes float1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 50px) scale(1.1); } }
        @keyframes float2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-100px, -50px) scale(1.15); } }
        .input-premium:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important; background: #fff !important; }
        .btn-premium:hover { box-shadow: 0 12px 24px rgba(37,99,235,0.35) !important; transform: translateY(-2px) !important; }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 24px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5) inset; }
      `}</style>
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float1 12s ease-in-out infinite alternate', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', animation: 'float2 16s ease-in-out infinite alternate', zIndex: 0 }} />


      <div style={{ width: '100%', maxWidth: '500px', zIndex: 1, position: 'relative' }}>
        
        <RecoveryStepper currentStep={2} />

        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.12)', boxShadow: '0 4px 24px rgba(30,58,138,0.07)', padding: '48px 40px', position: 'relative', overflow: 'hidden', textAlign: 'left' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {t('verificarRecuperacion.title')}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {t('verificarRecuperacion.subtitle')} <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{correo || 'tu correo'}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }} onPaste={handlePaste}>
                {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                  <input
                    key={i}
                    ref={el => inputsRef.current[i] = el}
                    type="text"
                    maxLength={1}
                    value={codigo[i] || ''}
                    onChange={e => handleCambioDigito(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={cargando || expirado}
                    className="input-premium"
                    style={{
                      width: '48px', height: '60px', textAlign: 'center', fontSize: '24px',
                      fontWeight: 800, color: '#0f172a', borderRadius: '16px',
                      border: '1.5px solid rgba(203,213,225,0.6)',
                      background: 'rgba(255,255,255,0.6)', outline: 'none', transition: 'all 200ms',
                      boxShadow: codigo[i] ? '0 0 0 2px rgba(37,99,235,0.1) inset' : 'none'
                    }}
                  />
                ))}
              </div>

              <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ padding: '8px 16px', background: expirado ? '#fef2f2' : 'rgba(239, 246, 255, 0.7)', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '8px', border: `1px solid ${expirado ? '#fecaca' : 'rgba(191,219,254,0.5)'}` }}>
                  <svg width="16" height="16" fill="none" stroke={expirado ? '#dc2626' : '#2563eb'} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span style={{ color: expirado ? '#dc2626' : '#1e40af', fontSize: '13px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {formatearTiempo(segundosExpiracion)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando || codigo.length < LARGO_CODIGO || expirado}
                className="btn-premium"
                style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(90deg, #1e3a8a, #2563eb)', color: '#fff', fontSize: '15px', fontWeight: 800, border: 'none', cursor: (cargando || codigo.length < LARGO_CODIGO || expirado) ? 'not-allowed' : 'pointer', transition: 'all 200ms', opacity: (cargando || codigo.length < LARGO_CODIGO || expirado) ? 0.6 : 1, marginBottom: '20px', boxShadow: '0 6px 20px rgba(30,58,138,0.2)' }}
              >
                {cargando ? t('verificarRecuperacion.verifying') : t('verificarRecuperacion.submit')}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={reenviando || segundosReenvio > 0}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(203,213,225,0.6)', color: (reenviando || segundosReenvio > 0) ? '#94a3b8' : '#1e3a8a', fontSize: '14px', fontWeight: 700, cursor: (reenviando || segundosReenvio > 0) ? 'not-allowed' : 'pointer', transition: 'all 200ms' }}
                >
                  {reenviando ? t('verificarRecuperacion.resending') :
                   segundosReenvio > 0 ? t('verificarRecuperacion.resendIn', { seconds: segundosReenvio }) :
                   t('verificarRecuperacion.resendCode')}
                </button>

                <button
                  type="button"
                  onClick={handleCancelar}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 200ms' }}
                >
                  {t('verificarRecuperacion.cancel')}
                </button>
              </div>
            </form>

        </div>
      </div>

      {showModal && (
        <AlertModal
          icon={<FaExclamationTriangle size={22} color="#1e3a8a" />}
          titulo="Error"
          mensaje={error}
          primaryText="OK"
          onPrimary={() => setShowModal(false)}
          onCerrar={() => setShowModal(false)}
          showCloseButton
        />
      )}
    </div>
  )
}
