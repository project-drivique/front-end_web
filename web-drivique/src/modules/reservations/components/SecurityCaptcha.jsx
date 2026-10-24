import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaSyncAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Genera un código aleatorio alfanumérico legible (omitiendo caracteres ambiguos como 0, O, 1, I, l)
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 5;

function generateRandomCode(length = CODE_LENGTH) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export default function SecurityCaptcha({
  onVerified,
  isVerified,
  hasError = false,
  c,
  style = {}
}) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dibuja el código en el Canvas con distorsión, líneas y ruido anti-bot
  const drawCaptcha = useCallback((code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Limpiar canvas y fondo
    ctx.clearRect(0, 0, width, height);

    // Fondo degradado sutil
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (c?.isDark) {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(1, '#e2e8f0');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Líneas de interferencia aleatorias (curvas y rectas)
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = c?.isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // 3. Puntos de ruido aleatorios
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = c?.isDark ? 'rgba(203, 213, 225, 0.35)' : 'rgba(71, 85, 105, 0.3)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Renderizado de cada carácter con ángulo aleatorio, sombra y colores vivos
    const charSpacing = width / (code.length + 1);
    const colors = c?.isDark
      ? ['#60a5fa', '#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#34d399']
      : ['#1d4ed8', '#0284c7', '#4338ca', '#6d28d9', '#be185d', '#059669'];

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 34 - 17) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${Math.floor(height * 0.58)}px 'Outfit', 'Inter', monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = c?.isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [c?.isDark]);

  const refreshCaptcha = useCallback(() => {
    setIsRefreshing(true);
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput('');
    setLocalError('');
    onVerified(false);
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsRefreshing(false);
    }, 150);
  }, [drawCaptcha, onVerified]);

  useEffect(() => {
    const code = generateRandomCode();
    setCaptchaCode(code);
    drawCaptcha(code);
  }, [drawCaptcha]);

  const handleValidar = () => {
    const cleanInput = userInput.trim().toUpperCase();
    if (!cleanInput) {
      setLocalError(t('captcha.emptyCode', 'Por favor ingresa el código de seguridad.'));
      onVerified(false);
      return;
    }

    if (cleanInput === captchaCode.toUpperCase()) {
      setLocalError('');
      onVerified(true);
    } else {
      setLocalError(t('captcha.invalidCode', 'Código incorrecto. Generamos uno nuevo.'));
      onVerified(false);
      // Generar nuevo código para evitar ataques de fuerza bruta
      const newCode = generateRandomCode();
      setCaptchaCode(newCode);
      setUserInput('');
      drawCaptcha(newCode);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidar();
    }
  };

  return (
    <div
      style={{
        background: c?.isDark ? 'rgba(30, 41, 59, 0.75)' : '#ffffff',
        border: `1.5px solid ${
          isVerified
            ? '#10b981'
            : (hasError || localError)
            ? '#ef4444'
            : (c?.cardBorder || '#e2e8f0')
        }`,
        borderRadius: 16,
        padding: '18px 20px',
        transition: 'all 0.25s ease',
        boxShadow: isVerified
          ? '0 4px 14px rgba(16, 185, 129, 0.12)'
          : (hasError || localError)
          ? '0 4px 14px rgba(239, 68, 68, 0.12)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        ...style
      }}
    >
      {/* Encabezado con Ícono de Seguridad */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(var(--brand-primary-rgb, 37, 99, 235), 0.12)',
              color: isVerified ? '#10b981' : (c?.accentText || 'var(--brand-primary)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0
            }}
          >
            {isVerified ? <FaCheckCircle size={18} /> : <FaShieldAlt size={16} />}
          </div>
          <div>
            <h4
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: c?.textPrimary || '#0f172a',
                margin: 0,
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {t('captcha.title', 'Verificación de Seguridad')}
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 12,
                  background: isVerified ? '#ecfdf5' : (c?.isDark ? '#334155' : '#f1f5f9'),
                  color: isVerified ? '#047857' : (c?.textSecondary || '#64748b'),
                  border: isVerified ? '1px solid #a7f3d0' : 'none'
                }}
              >
                {isVerified ? t('captcha.verifiedBadge', 'Verificado ✓') : t('captcha.antiBotBadge', 'Anti-bot')}
              </span>
            </h4>
            <p style={{ fontSize: 11.5, color: c?.textSecondary || '#64748b', margin: '2px 0 0', lineHeight: 1.3 }}>
              {isVerified
                ? t('captcha.verifiedDesc', 'Verificación completada. Ya puedes confirmar tu reserva.')
                : t('captcha.promptDesc', 'Ingresa los 5 caracteres de la imagen para confirmar que eres una persona.')}
            </p>
          </div>
        </div>
      </div>

      {isVerified ? (
        /* Vista de Verificación Exitosa */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: c?.isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 12,
            padding: '10px 14px',
            marginTop: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCheckCircle color="#10b981" size={16} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: c?.isDark ? '#a7f3d0' : '#065f46' }}>
              {t('captcha.successLabel', 'Humano verificado con éxito')}
            </span>
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            style={{
              background: 'none',
              border: 'none',
              color: c?.isDark ? '#94a3b8' : '#64748b',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {t('captcha.reset', 'Cambiar')}
          </button>
        </div>
      ) : (
        /* Formulario de Captcha */
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 6
            }}
          >
            {/* Canvas del Captcha */}
            <div
              style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                border: `1.5px solid ${c?.cardBorder || '#cbd5e1'}`,
                display: 'inline-flex',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
            >
              <canvas
                ref={canvasRef}
                width={170}
                height={44}
                style={{
                  display: 'block',
                  cursor: 'default',
                  userSelect: 'none'
                }}
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                title={t('captcha.refreshTooltip', 'Generar nuevo código')}
                disabled={isRefreshing}
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: c?.isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                  border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
                  borderRadius: 6,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: c?.textPrimary || '#1e293b',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <FaSyncAlt size={12} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Input y Botón de Validación */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px' }}>
              <input
                type="text"
                value={userInput}
                maxLength={CODE_LENGTH}
                onChange={(e) => {
                  setUserInput(e.target.value.toUpperCase());
                  setLocalError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder={t('captcha.placeholder', 'Ingresa el código')}
                style={{
                  flex: 1,
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${
                    localError || hasError ? '#ef4444' : (c?.cardBorder || '#cbd5e1')
                  }`,
                  background: c?.isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  color: c?.textPrimary || '#0f172a',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="button"
                onClick={handleValidar}
                style={{
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 10,
                  background: userInput.trim() ? 'var(--brand-gradient)' : (c?.isDark ? '#334155' : '#94a3b8'),
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  flexShrink: 0
                }}
              >
                {t('captcha.validateBtn', 'Verificar')}
              </button>
            </div>
          </div>

          {/* Mensajes de Error */}
          {(localError || hasError) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 10,
                color: c?.isDark ? '#fca5a5' : '#dc2626',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              <FaExclamationCircle size={14} style={{ flexShrink: 0 }} />
              <span>{localError || t('captcha.mustVerify', 'Debes completar la verificación de seguridad antes de confirmar la reserva.')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
