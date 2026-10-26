import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../../../services/httpClient';
import { captchaTokenStore } from '../../../services/captchaTokenStore';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('turnstile-script'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Captcha real (Cloudflare Turnstile). El navegador solo obtiene un token de un solo uso;
 * el servidor lo valida con Cloudflare al crear la reserva. La clave pública la entrega el backend.
 */
export default function SecurityCaptcha({
  onVerified,
  hasError = false,
  c,
  style = {}
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifiedRef = useRef(onVerified);
  const [status, setStatus] = useState('loading'); // loading | ready | failed | off
  const [hasToken, setHasToken] = useState(false);
  const verified = hasToken;

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    let cancelled = false;

    const notify = (ok, token) => {
      captchaTokenStore.set(ok ? token : null);
      if (!cancelled) setHasToken(Boolean(ok && token));
      if (typeof onVerifiedRef.current === 'function') onVerifiedRef.current(ok, token);
    };

    (async () => {
      try {
        const { data: config } = await api.get('/captcha/config');
        if (cancelled) return;
        if (!config?.enabled) {
          setStatus('off');
          captchaTokenStore.set(null);
          if (typeof onVerifiedRef.current === 'function') onVerifiedRef.current(true, null);
          return;
        }
        const turnstile = await loadTurnstile();
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: config.siteKey,
          theme: c?.isDark ? 'dark' : 'light',
          callback: (token) => notify(true, token),
          'expired-callback': () => notify(false),
          'timeout-callback': () => notify(false),
          'error-callback': () => {
            notify(false);
            setStatus('failed');
          }
        });
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('failed');
      }
    })();

    // Cuando el servidor consume el token (reserva creada o con error) el widget se reinicia
    const unsubscribe = captchaTokenStore.subscribe(() => {
      setHasToken(false);
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
      if (typeof onVerifiedRef.current === 'function') onVerifiedRef.current(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* el widget ya no existe */
        }
      }
      widgetIdRef.current = null;
      captchaTokenStore.set(null);
      // El padre no debe seguir creyendo que está verificado cuando el widget ya no existe
      if (typeof onVerifiedRef.current === 'function') onVerifiedRef.current(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'off') return null;

  const borderColor = hasError && !verified
    ? '#ef4444'
    : verified
      ? '#10b981'
      : (c?.cardBorder || '#e2e8f0');

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', ...style }}>
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
          border: `1.5px solid ${borderColor}`,
          boxShadow: verified ? '0 2px 10px rgba(16, 185, 129, 0.12)' : '0 1px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220, flex: '1 1 220px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: verified ? '#10b981' : 'rgba(2, 132, 199, 0.1)',
              color: verified ? '#ffffff' : '#0284c7',
              transition: 'all 0.2s'
            }}
          >
            {verified ? <FaCheck size={16} /> : <FaShieldAlt size={16} />}
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: verified ? (c?.isDark ? '#34d399' : '#059669') : (c?.textPrimary || '#0f172a')
              }}
            >
              {verified
                ? t('captcha.successLabel', 'Humano verificado con éxito')
                : t('captcha.verifyHuman', 'Confirmar que soy una persona')}
            </div>
            <div style={{ fontSize: 12, color: c?.textMuted || '#64748b', marginTop: 2 }}>
              {verified
                ? t('captcha.verifiedDesc', 'Verificación completada. Ya puedes confirmar tu reserva.')
                : status === 'failed'
                  ? t('captcha.loadError', 'No se pudo cargar la verificación. Revisa tu conexión y recarga la página.')
                  : t('captcha.clickToVerify', 'Completa la verificación de seguridad')}
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          style={{ minHeight: 65 }}
          aria-live="polite"
        />
      </div>

      {hasError && !verified && (
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
    </div>
  );
}
