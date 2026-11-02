import { FaUser } from 'react-icons/fa'
import paisesMock from '@/config/datos/nationalities.json'
import { getSiglaDoc } from '@/utils/documentUtils'

export default function PersonalDataPart({ c, datosForm, docsDisponibles, errores, handleCambioNacionalidad, inputStyle, onCambio, prefijoActual, sectionCardStyle, t }) {
  return (
    <div style={sectionCardStyle}>
          <div style={{ margin: '0 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FaUser color={c?.accentText || 'var(--brand-secondary)'} size={15} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
                {t('vehiculo.personalData', 'Datos personales')}
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.4 }}>
              {t('vehiculo.personalDataSubtitle', 'Completa tus datos de contacto para la reserva y el contrato digital')}
            </p>
            <div style={{ height: 1, background: c?.cardBorder || '#e2e8f0', margin: '14px 0 0' }} />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.name', 'Nombre completo')} *
              </label>
              <input
                type="text"
                value={datosForm.nombre}
                onChange={e => onCambio('nombre', e.target.value)}
                placeholder={t('hc.ej_juan_perez', 'Ej. Juan Pérez')}
                style={inputStyle(errores.nombre)}
              />
              {errores.nombre && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.nombre}</p>}
            </div>
  
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.nationality', 'Nacionalidad')} *
              </label>
              <select
                value={datosForm.nacionalidad || ''}
                onChange={e => handleCambioNacionalidad(e.target.value)}
                style={inputStyle(errores.nacionalidad)}
              >
                <option value="">{t('common.select', 'Seleccionar')}</option>
                {[...paisesMock].filter(p => p.nombre !== 'Otro').map(p => (
                  <option key={p.nombre} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
                <option value="Otro">{t('common.other', 'Otro')}</option>
              </select>
              {errores.nacionalidad && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.nacionalidad}</p>}
            </div>
  
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.email', 'Correo electrónico')} *
              </label>
              <input
                type="email"
                value={datosForm.correo}
                onChange={e => onCambio('correo', e.target.value)}
                placeholder={t('hc2.ej_juan_correo_com', 'Ej. juan@correo.com')}
                style={inputStyle(errores.correo)}
              />
              {errores.correo && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.correo}</p>}
            </div>
  
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.phoneNumber', 'Teléfono celular')} *
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {prefijoActual ? (
                  <div style={{
                    height: 46,
                    minWidth: 64,
                    padding: '0 10px',
                    borderRadius: 12,
                    border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                    background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    color: c?.textSecondary || '#64748b',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}>
                    {prefijoActual}
                  </div>
                ) : null}
                <input
                  type="tel"
                  disabled={!datosForm.nacionalidad}
                  value={datosForm.celular}
                  onChange={e => onCambio('celular', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder={!datosForm.nacionalidad ? t('vehiculo.selectNationalityFirst', 'Primero selecciona tu nacionalidad') : 'Ej. 3144214909'}
                  style={{
                    ...inputStyle(errores.celular),
                    flex: 1,
                    opacity: !datosForm.nacionalidad ? 0.6 : 1,
                    cursor: !datosForm.nacionalidad ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              {errores.celular && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.celular}</p>}
            </div>
  
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.docType', 'Tipo de documento')} *
              </label>
              <select
                disabled={!datosForm.nacionalidad}
                value={datosForm.tipoDoc || ''}
                onChange={e => onCambio('tipoDoc', e.target.value)}
                style={{
                  ...inputStyle(errores.tipoDoc),
                  opacity: !datosForm.nacionalidad ? 0.6 : 1,
                  cursor: !datosForm.nacionalidad ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">{t('common.select', 'Seleccionar')}</option>
                {docsDisponibles.map(doc => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
              {errores.tipoDoc && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.tipoDoc}</p>}
            </div>
  
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c?.textSecondary || '#64748b', marginBottom: 6 }}>
                {t('vehiculo.docNumber', 'Número de documento')} *
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {datosForm.tipoDoc && getSiglaDoc(datosForm.tipoDoc) ? (
                  <div style={{
                    height: 46,
                    minWidth: 54,
                    padding: '0 10px',
                    borderRadius: 12,
                    border: `1.5px solid ${c?.cardBorder || '#e2e8f0'}`,
                    background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    color: c?.textSecondary || '#64748b',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}>
                    {getSiglaDoc(datosForm.tipoDoc)}
                  </div>
                ) : null}
                <input
                  type="text"
                  disabled={!datosForm.tipoDoc}
                  value={datosForm.numDoc}
                  onChange={e => onCambio('numDoc', e.target.value)}
                  placeholder={!datosForm.tipoDoc ? t('vehiculo.selectDocTypeFirst', 'Primero selecciona el tipo de documento') : 'Ej. 1075228306'}
                  style={{
                    ...inputStyle(errores.numDoc),
                    flex: 1,
                    opacity: !datosForm.tipoDoc ? 0.6 : 1,
                    cursor: !datosForm.tipoDoc ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>{errores.numDoc}</p>}
            </div>
          </div>
        </div>
  )
}
