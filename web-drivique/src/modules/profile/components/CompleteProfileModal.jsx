import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaGlobe, FaCalendarAlt, FaHashtag, FaTimes, FaSave } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import paisesMock from '@/mocks/nationalities.json'

const TIPOS_DOC = [
  { value: 'CC', sigla: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { value: 'TI', sigla: 'TI', label: 'Tarjeta de identidad (TI)' },
  { value: 'CE', sigla: 'CE', label: 'Documento extranjero (CE)' },
  { value: 'PAS', sigla: 'PAS', label: 'Pasaporte (PAS)' },
]

function getSiglaDoc(tipo) {
  if (!tipo) return ''
  const item = TIPOS_DOC.find(t => t.value === tipo || t.sigla === tipo)
  return item?.sigla || (tipo ? tipo.substring(0, 3).toUpperCase() : '')
}

function getPrefijoPais(nacionalidad) {
  if (!nacionalidad) return ''
  const pais = paisesMock.find(p => p.nombre.toLowerCase() === nacionalidad.toLowerCase())
  return pais?.prefijo || ''
}

export default function CompleteProfileModal({
  abierto,
  onCerrar,
  formData,
  errores,
  cargando,
  actualizarCampo,
  handleGuardar,
  c,
  esModoOscuro,
  esPerfilIncompleto,
}) {
  const { t } = useTranslation()

  if (!abierto) return null

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 150ms ease',
  })

  const selectStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 36px 0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '13.5px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
  })

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11.5px',
    fontWeight: 600,
    color: c.labelText,
    marginBottom: '5px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          background: c.modalBg,
          borderRadius: '20px',
          border: `1px solid ${c.cardBorder}`,
          boxShadow: esModoOscuro ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 50px rgba(30,58,138,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'fadeInUp 250ms ease-out',
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${c.modalDivider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: esModoOscuro ? '#1e293b' : '#f8fafc',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0 }}>
              {esPerfilIncompleto ? t('perfil.completeProfileTitle', 'Completar Perfil') : t('perfil.editProfileTitle', 'Editar Perfil')}
            </h2>
            <p style={{ fontSize: '12.5px', color: c.textMuted, margin: '3px 0 0' }}>
              {t('perfil.modalSubtitle', 'Actualiza tus datos personales, información de contacto y documento de identidad.')}
            </p>
          </div>
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={{
              background: 'transparent',
              border: 'none',
              color: c.textMuted,
              fontSize: '18px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = c.title}
            onMouseLeave={e => e.currentTarget.style.color = c.textMuted}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body del Modal (Grid de 3 Secciones) */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            className="modal-responsive-grid"
            style={{
              gap: '20px',
            }}
          >
            {/* Sección 1: Datos Personales */}
            <div
              style={{
                background: esModoOscuro ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                border: `1px solid ${c.innerCardBorder}`,
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: `1px solid ${c.modalDivider}` }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0 }}>
                  {t('perfil.personalInfo', 'Datos Personales')}
                </h3>
              </div>

              {/* Nombres Completo */}
              <div>
                <label style={labelStyle}>
                  <FaUser style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.firstName', 'Nombres completos')}
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                    actualizarCampo('nombre', val)
                  }}
                  placeholder="Nombres completos"
                  style={inputStyle(!!errores.nombre)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.nombre ? c.inputErrorBorder : c.inputBorder}
                />
                {errores.nombre && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.nombre}</p>}
              </div>

              {/* Apellidos Completo */}
              <div>
                <label style={labelStyle}>
                  <FaUser style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.lastName', 'Apellidos completos')}
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
                    actualizarCampo('apellido', val)
                  }}
                  placeholder="Apellidos completos"
                  style={inputStyle(!!errores.apellido)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.apellido ? c.inputErrorBorder : c.inputBorder}
                />
                {errores.apellido && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.apellido}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label style={labelStyle}>
                  <FaCalendarAlt style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.birthDate', 'Fecha de nacimiento')}
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento || ''}
                  onChange={e => actualizarCampo('fechaNacimiento', e.target.value)}
                  style={{ ...inputStyle(!!errores.fechaNacimiento), colorScheme: esModoOscuro ? 'dark' : 'light' }}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.fechaNacimiento ? c.inputErrorBorder : c.inputBorder}
                />
                {errores.fechaNacimiento && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.fechaNacimiento}</p>}
              </div>
            </div>

            {/* Sección 2: Datos de Contacto */}
            <div
              style={{
                background: esModoOscuro ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                border: `1px solid ${c.innerCardBorder}`,
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: `1px solid ${c.modalDivider}` }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0 }}>
                  {t('perfil.contactData', 'Datos de Contacto')}
                </h3>
              </div>

              {/* Correo electrónico */}
              <div>
                <label style={labelStyle}>
                  <FaEnvelope style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.email', 'Correo electrónico')}
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={e => actualizarCampo('correo', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  style={inputStyle(!!errores.correo)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.correo ? c.inputErrorBorder : c.inputBorder}
                />
                {errores.correo && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.correo}</p>}
              </div>

              {/* Nacionalidad */}
              <div>
                <label style={labelStyle}>
                  <FaGlobe style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.nationality', 'Nacionalidad')}
                </label>
                <select
                  value={formData.nacionalidad}
                  onChange={e => actualizarCampo('nacionalidad', e.target.value)}
                  style={selectStyle(!!errores.nacionalidad)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.nacionalidad ? c.inputErrorBorder : c.inputBorder}
                >
                  <option value="">{t('perfil.select', 'Seleccionar')}</option>
                  {[...paisesMock].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map(p => (
                    <option key={p.nombre} value={p.nombre}>
                      {t('perfil.countries.' + p.nombre, p.nombre)} {p.prefijo ? `(${p.prefijo})` : ''}
                    </option>
                  ))}
                </select>
                {errores.nacionalidad && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.nacionalidad}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label style={labelStyle}>
                  <FaPhone style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.phone', 'Teléfono')}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: `1.5px solid ${errores.telefono ? c.inputErrorBorder : c.inputBorder}`,
                    background: errores.telefono ? c.inputErrorBg : c.inputBg,
                    height: '42px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                >
                  {getPrefijoPais(formData.nacionalidad) && (
                    <span
                      style={{
                        padding: '0 12px',
                        height: '100%',
                        background: esModoOscuro ? '#1e293b' : '#f1f5f9',
                        borderRight: `1px solid ${c.inputBorder}`,
                        color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {getPrefijoPais(formData.nacionalidad)}
                    </span>
                  )}
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      actualizarCampo('telefono', val)
                    }}
                    placeholder="3001234567"
                    style={{
                      flex: 1,
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: c.inputText,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errores.telefono && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.telefono}</p>}
              </div>
            </div>

            {/* Sección 3: Documento de Identidad */}
            <div
              style={{
                background: esModoOscuro ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                border: `1px solid ${c.innerCardBorder}`,
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: `1px solid ${c.modalDivider}` }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? '#93c5fd' : '#1e3a8a', margin: 0 }}>
                  {t('perfil.identityDoc', 'Documento de Identidad')}
                </h3>
              </div>

              {/* Tipo de documento */}
              <div>
                <label style={labelStyle}>
                  <FaIdCard style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.docType', 'Tipo de documento')}
                </label>
                <select
                  value={formData.tipoDocumento}
                  onChange={e => actualizarCampo('tipoDocumento', e.target.value)}
                  style={selectStyle(!!errores.tipoDocumento)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.tipoDocumento ? c.inputErrorBorder : c.inputBorder}
                >
                  <option value="">{t('perfil.select', 'Seleccionar')}</option>
                  {TIPOS_DOC.map(td => (
                    <option key={td.value} value={td.value}>{t('perfil.docTypes.' + td.value, td.label)}</option>
                  ))}
                </select>
                {errores.tipoDocumento && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.tipoDocumento}</p>}
              </div>

              {/* Número de documento */}
              <div>
                <label style={labelStyle}>
                  <FaHashtag style={{ color: esModoOscuro ? '#93c5fd' : '#1e3a8a', fontSize: '11px', marginRight: '6px' }} />
                  {t('perfil.docNumber', 'Número de documento')}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: `1.5px solid ${errores.cedula ? c.inputErrorBorder : c.inputBorder}`,
                    background: errores.cedula ? c.inputErrorBg : c.inputBg,
                    height: '42px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    transition: 'all 150ms ease',
                  }}
                >
                  {getSiglaDoc(formData.tipoDocumento) && (
                    <span
                      style={{
                        padding: '0 12px',
                        height: '100%',
                        background: esModoOscuro ? '#1e293b' : '#f1f5f9',
                        borderRight: `1px solid ${c.inputBorder}`,
                        color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {getSiglaDoc(formData.tipoDocumento)}
                    </span>
                  )}
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={e => {
                      const isNumericOnly = ['CC', 'TI'].includes(formData.tipoDocumento || 'CC')
                      const val = isNumericOnly
                        ? e.target.value.replace(/\D/g, '')
                        : e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                      actualizarCampo('cedula', val)
                    }}
                    placeholder={
                      ['CC', 'TI'].includes(formData.tipoDocumento || 'CC') ? "1020304050" : "AB123456"
                    }
                    style={{
                      flex: 1,
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      color: c.inputText,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errores.cedula && <p style={{ color: c.errorText, fontSize: '11px', margin: '4px 0 0' }}>{errores.cedula}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div
          className="modal-responsive-footer"
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${c.modalDivider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            background: esModoOscuro ? '#1e293b' : '#f8fafc',
          }}
        >
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              background: c.btnSecBg,
              border: `1.5px solid ${c.btnSecBorder}`,
              color: c.btnSecText,
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.5 : 1,
            }}
          >
            {t('perfil.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleGuardar}
            disabled={cargando}
            style={{
              padding: '10px 26px',
              borderRadius: '10px',
              background: c.btnPrimary || '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                {t('perfil.saving', 'Guardando...')}
              </>
            ) : (
              <>
                <FaSave style={{ fontSize: '12px' }} />
                {t('perfil.save', 'Guardar cambios')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
