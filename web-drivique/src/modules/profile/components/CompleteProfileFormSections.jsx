import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaGlobe, FaCalendarAlt, FaHashtag } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import paisesMock from '@/config/datos/nationalities.json'

const TIPOS_DOC = [
  { value: 'CC', sigla: 'CC', label: 'Cédula de ciudadanía (CC)' },
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

export default function CompleteProfileFormSections({
  formData,
  errores,
  actualizarCampo,
  c,
  esModoOscuro,
  inputStyle,
  selectStyle,
  labelStyle,
}) {
  const { t } = useTranslation()

  return (
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
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0 }}>
            {t('perfil.personalInfo', 'Datos Personales')}
          </h3>
        </div>

        {/* Nombres Completo */}
        <div>
          <label style={labelStyle}>
            <FaUser style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
            <FaUser style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
            <FaCalendarAlt style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0 }}>
            {t('perfil.contactData', 'Datos de Contacto')}
          </h3>
        </div>

        {/* Correo electrónico */}
        <div>
          <label style={labelStyle}>
            <FaEnvelope style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
            <FaGlobe style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
            <FaPhone style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
                  color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)',
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

        {/* Dirección */}
        <div>
          <label style={labelStyle}>
            {t('perfil.address', 'Dirección')}
          </label>
          <input
            type="text"
            value={formData.direccion || ''}
            onChange={e => actualizarCampo('direccion', e.target.value)}
            maxLength={255}
            placeholder={t('perfil.addressPlaceholder', 'Calle 10 # 20-30, Medellín')}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              border: `1.5px solid ${c.inputBorder}`,
              background: c.inputBg,
              padding: '0 12px',
              fontSize: '13.5px',
              color: c.inputText,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
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
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0 }}>
            {t('perfil.identityDoc', 'Documento de Identidad')}
          </h3>
        </div>

        {/* Tipo de documento */}
        <div>
          <label style={labelStyle}>
            <FaIdCard style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
            <FaHashtag style={{ color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', fontSize: '11px', marginRight: '6px' }} />
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
                  color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)',
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
  )
}
