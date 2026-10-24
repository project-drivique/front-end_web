import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';

export default function SecurityCaptcha({
  onVerified,
  isVerified,
  hasError = false,
  c,
  style = {}
}) {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleClickCheckbox = () => {
    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    // Simula la verificación heurística del navegador (estilo Cloudflare Turnstile)
    setTimeout(() => {
      setIsVerifying(false);
      if (typeof onVerified === 'function') {
        onVerified(true);
      }
    }, 650);
  };

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '16px 20px',
          borderRadius: 14,
          background: c?.isDark ? 'rgba(30, 41, 59, 0.75)' : '#ffffff',
          border: `1.5px solid ${
            hasError && !isVerified
              ? '#ef4444'
              : isVerified
              ? '#10b981'
              : (c?.cardBorder || '#e2e8f0')
          }`,
          boxShadow: isVerified
            ? '0 2px 10px rgba(16, 185, 129, 0.12)'
            : '0 1px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.25s ease',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Zona Interactiva Izquierda: Checkbox + Texto */}
        <div
          onClick={handleClickCheckbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClickCheckbox();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: isVerified ? 'default' : 'pointer',
            userSelect: 'none',
            outline: 'none'
          }}
        >
          {/* Casilla Checkbox / Spinner / Check */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: isVerified
                ? '#10b981'
                : c?.isDark
                ? '#0f172a'
                : '#ffffff',
              border: isVerified
                ? '2px solid #10b981'
                : `2px solid ${hasError ? '#ef4444' : '#94a3b8'}`,
              boxShadow: isVerified
                ? '0 0 10px rgba(16, 185, 129, 0.35)'
                : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isVerifying ? (
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '2.5px solid rgba(2, 132, 199, 0.25)',
                  borderTopColor: '#0284c7',
                  animation: 'drv-spin 0.65s linear infinite'
                }}
              />
            ) : isVerified ? (
              <FaCheck size={16} color="#ffffff" />
            ) : (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: 'transparent'
                }}
              />
            )}
          </div>

          {/* Textos descriptivos */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: isVerified
                  ? (c?.isDark ? '#34d399' : '#059669')
                  : (c?.textPrimary || '#0f172a'),
                transition: 'color 0.2s'
              }}
            >
              {isVerifying
                ? t('captcha.verifying', 'Verificando seguridad...')
                : isVerified
                ? t('captcha.successLabel', 'Humano verificado con éxito')
                : t('captcha.verifyHuman', 'Confirmar que soy una persona')}
            </div>
            <div
              style={{
                fontSize: 12,
                color: isVerified
                  ? (c?.isDark ? '#10b981' : '#047857')
                  : (c?.textMuted || '#64748b'),
                marginTop: 2
              }}
            >
              {isVerified
                ? t('captcha.verifiedDesc', 'Verificación completada. Ya puedes confirmar tu reserva.')
                : t('captcha.clickToVerify', 'Haz clic en la casilla para verificar seguridad')}
            </div>
          </div>
        </div>

        {/* Zona Derecha: Insignia de Seguridad Drivique */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 16,
            borderLeft: `1px solid ${c?.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isVerified
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(2, 132, 199, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isVerified ? '#10b981' : '#0284c7',
              transition: 'all 0.25s'
            }}
          >
            <FaShieldAlt size={16} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: c?.textPrimary || '#1e293b',
                textTransform: 'uppercase'
              }}
            >
              DRIVIQUE SHIELD
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: c?.textMuted || '#94a3b8'
              }}
            >
              {t('captcha.antiBotBadge', 'Anti-bot')} • {t('captcha.privacy', 'Seguridad')}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de error si intentan avanzar sin verificar */}
      {hasError && !isVerified && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            paddingLeft: 4,
            color: '#ef4444',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          <FaExclamationCircle size={14} style={{ flexShrink: 0 }} />
          <span>{t('captcha.mustVerify', 'Debes completar la verificación de seguridad antes de confirmar la reserva.')}</span>
        </div>
      )}

      {/* Estilos para animación de spin nativa */}
      <style>{`
        @keyframes drv-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
