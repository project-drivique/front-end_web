// src/modules/auth/styles/loginStyles.js

export const COLOR_MARCA = '#1e3a8a'
export const COLOR_MARCA_HOVER = '#2563eb'

export const loginTokens = {
  borderRadius: {
    card: '24px',
    input: '12px',
    badge: '16px',
    alert: '12px',
  },
  fontSize: {
    label: '13px',
    input: '14px',
    helper: '12px',
    body: '14px',
    title: '1.6rem',
  },
  shadow: {
    btn: '0 4px 16px rgba(30,58,138,0.25)',
  },
}

/** Paleta completa derivada del modo */
export const coloresLogin = (esModoOscuro) => ({
  pageBg:              esModoOscuro ? '#0b1220'                   : '#f8fafc',
  cardBg:              esModoOscuro ? '#111827'                   : '#ffffff',
  cardBorder:          esModoOscuro ? '#1f2937'                   : '#f1f5f9',
  cardShadow:          esModoOscuro ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 40px rgba(0,0,0,0.08)',
  title:               esModoOscuro ? '#f8fafc'                   : '#0f172a',
  text:                esModoOscuro ? '#cbd5e1'                   : '#64748b',
  label:               esModoOscuro ? '#e5e7eb'                   : '#374151',
  inputBg:             esModoOscuro ? '#0f172a'                   : '#ffffff',
  inputText:           esModoOscuro ? '#f8fafc'                   : '#1e293b',
  inputBorder:         esModoOscuro ? '#334155'                   : '#e2e8f0',
  inputBorderHover:    esModoOscuro ? '#60a5fa'                   : COLOR_MARCA,
  inputPlaceholder:    '#94a3b8',
  inputErrorBg:        esModoOscuro ? 'rgba(127,29,29,0.22)'      : '#fef2f2',
  inputErrorBorder:    '#f87171',
  helperError:         esModoOscuro ? '#fca5a5'                   : '#ef4444',
  backLink:            esModoOscuro ? '#94a3b8'                   : '#64748b',
  backLinkHover:       esModoOscuro ? '#93c5fd'                   : COLOR_MARCA,
  eyeIcon:             '#94a3b8',
  forgot:              esModoOscuro ? '#93c5fd'                   : COLOR_MARCA,
  socialBg:            esModoOscuro ? '#0f172a'                   : '#ffffff',
  socialBorder:        esModoOscuro ? '#334155'                   : '#e2e8f0',
  socialHoverBg:       esModoOscuro ? '#172033'                   : '#f8fafc',
  socialHoverBorder:   esModoOscuro ? '#475569'                   : '#cbd5e1',
  socialText:          esModoOscuro ? '#e5e7eb'                   : '#1e293b',
  footerText:          esModoOscuro ? '#94a3b8'                   : '#64748b',
  registerLink:        esModoOscuro ? '#93c5fd'                   : COLOR_MARCA,
  successBg:           esModoOscuro ? 'rgba(20,83,45,0.30)'       : '#f0fdf4',
  successBorder:       esModoOscuro ? '#166534'                   : '#bbf7d0',
  successText:         esModoOscuro ? '#86efac'                   : '#15803d',
  successIcon:         esModoOscuro ? '#4ade80'                   : '#16a34a',
  errorBg:             esModoOscuro ? 'rgba(127,29,29,0.25)'      : '#fef2f2',
  errorBorder:         esModoOscuro ? '#7f1d1d'                   : '#fecaca',
  errorText:           esModoOscuro ? '#fca5a5'                   : '#dc2626',
  errorIcon:           esModoOscuro ? '#f87171'                   : '#dc2626',
  warnBg:              esModoOscuro ? 'rgba(120,53,15,0.28)'      : '#fffbeb',
  warnBorder:          esModoOscuro ? '#92400e'                   : '#fde68a',
  warnText:            esModoOscuro ? '#fcd34d'                   : '#92400e',
  warnIcon:            esModoOscuro ? '#f59e0b'                   : '#d97706',
})