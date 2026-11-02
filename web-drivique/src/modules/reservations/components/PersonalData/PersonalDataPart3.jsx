export default function PersonalDataPart3({ c, datosForm, errores, headerStyle, onCambio, sectionCardStyle, setVerTyC, t, terminosLeidos }) {
  return (
    <div style={sectionCardStyle}>
          <div style={headerStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c?.accentText || 'var(--brand-secondary)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
              {t('vehiculo.policiesAndSecurity', 'Políticas y seguridad')}
            </h3>
          </div>
  
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <input
              type="checkbox"
              id="tyc"
              checked={Boolean(datosForm.terminos)}
              onChange={e => {
                if (!terminosLeidos) {
                  e.preventDefault();
                  setVerTyC(true);
                  return;
                }
                onCambio('terminos', e.target.checked);
              }}
              onClick={e => {
                if (!terminosLeidos) {
                  e.preventDefault();
                  setVerTyC(true);
                }
              }}
              style={{
                width: 17,
                height: 17,
                cursor: 'pointer',
                marginTop: 2,
                flexShrink: 0,
                accentColor: c?.accentText || 'var(--brand-secondary)',
                borderRadius: 4
              }}
            />
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 400, color: c?.textPrimary || '#0f172a', lineHeight: 1.45 }}>
              <label
                htmlFor="tyc"
                onClick={e => {
                  if (!terminosLeidos) {
                    e.preventDefault();
                    setVerTyC(true);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {t('vehiculo.termsAgreementText', 'Acepto los términos, condiciones del contrato de alquiler y la política de privacidad')} *
              </label>{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setVerTyC(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: c?.accentText || 'var(--brand-secondary)',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  display: 'inline',
                  verticalAlign: 'baseline',
                  marginLeft: 6
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {t('vehiculo.viewTermsAndConditions', 'Ver términos y condiciones')}
              </button>
            </div>
          </div>
          {errores.terminos && <p style={{ color: '#ef4444', fontSize: 12, margin: '8px 0 0 29px', fontWeight: 600 }}>{errores.terminos}</p>}
        </div>
  )
}
