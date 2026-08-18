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

export const coloresLogin = (esModoOscuro) => ({
  pageBg:              esModoOscuro ? '#0f172a'                   : '#f8fafc',
  cardBg:              esModoOscuro ? '#0e172a'                   : '#ffffff',
  cardBorder:          esModoOscuro ? '#1e293b'                   : '#dbe5f3',
  cardShadow:          esModoOscuro ? '0 20px 50px rgba(0,0,0,0.55)' : '0 10px 30px rgba(30,58,138,0.06)',
  title:               esModoOscuro ? '#ffffff'                   : '#1e3a8a',
  text:                esModoOscuro ? '#94a3b8'                   : '#64748b',
  label:               esModoOscuro ? '#ffffff'                   : '#1e3a8a',
  inputBg:             esModoOscuro ? '#172136'                   : '#ffffff',
  inputText:           esModoOscuro ? '#ffffff'                   : '#1e293b',
  inputBorder:         esModoOscuro ? '#23314d'                   : '#dbe5f3',
  inputBorderHover:    esModoOscuro ? '#60a5fa'                   : COLOR_MARCA,
  inputPlaceholder:    '#64748b',
  inputErrorBg:        esModoOscuro ? 'rgba(127,29,29,0.22)'      : '#fef2f2',
  inputErrorBorder:    '#f87171',
  helperError:         esModoOscuro ? '#fca5a5'                   : '#ef4444',
  backLink:            esModoOscuro ? '#94a3b8'                   : '#64748b',
  backLinkHover:       esModoOscuro ? '#60a5fa'                   : COLOR_MARCA,
  eyeIcon:             '#94a3b8',
  forgot:              esModoOscuro ? '#60a5fa'                   : '#1e3a8a',
  socialBg:            esModoOscuro ? '#172136'                   : '#ffffff',
  socialBorder:        esModoOscuro ? '#23314d'                   : '#dbe5f3',
  socialHoverBg:       esModoOscuro ? '#1e2a45'                   : '#f8fafc',
  socialHoverBorder:   esModoOscuro ? '#3b82f6'                   : '#cbd5e1',
  socialText:          esModoOscuro ? '#ffffff'                   : '#1e293b',
  footerText:          esModoOscuro ? '#94a3b8'                   : '#64748b',
  registerLink:        esModoOscuro ? '#60a5fa'                   : '#1e3a8a',
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