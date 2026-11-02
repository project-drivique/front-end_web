import { FaUser, FaCalendarAlt, FaEnvelope, FaGlobe, FaPhone, FaIdCard, FaHashtag } from 'react-icons/fa'
import { getNombreTipoDoc } from '@/utils/documentUtils'
import paisesMock from '@/config/datos/nationalities.json'

function getPrefijoPais(nacionalidad) {
  if (!nacionalidad) return ''
  const pais = paisesMock.find(p => p.nombre.toLowerCase() === nacionalidad.toLowerCase())
  return pais?.prefijo || ''
}

export default function PerfilCardsGrid({ c, esModoOscuro, formData, labelStyle, readonlyStyle, t }) {
  return (
    <div className="perfil-cards-grid">
              
              {/* Tarjeta 1: Datos Personales */}
              <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('perfil.personalInfo', 'Datos Personales')}
                  </h2>
                </div>
  
                {/* Nombres Completo */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaUser style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.firstName', 'Nombres completos')}
                  </label>
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.nombre ? c.readonlyText : '#94a3b8', fontStyle: formData.nombre ? 'normal' : 'italic' }}>
                      {formData.nombre || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Apellidos Completo */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaUser style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.lastName', 'Apellidos completos')}
                  </label>
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.apellido ? c.readonlyText : '#94a3b8', fontStyle: formData.apellido ? 'normal' : 'italic' }}>
                      {formData.apellido || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Fecha de nacimiento */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaCalendarAlt style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.birthDate', 'Fecha de nacimiento')}
                  </label>
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.fechaNacimiento ? c.readonlyText : '#94a3b8', fontStyle: formData.fechaNacimiento ? 'normal' : 'italic' }}>
                      {formData.fechaNacimiento || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
              </div>
  
              {/* Tarjeta 2: Datos de Contacto */}
              <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('perfil.contactData', 'Datos de Contacto')}
                  </h2>
                </div>
  
                {/* Correo electrónico */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaEnvelope style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.email', 'Correo electrónico')}
                  </label>
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.correo ? c.readonlyText : '#94a3b8', fontStyle: formData.correo ? 'normal' : 'italic' }}>
                      {formData.correo || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Nacionalidad */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaGlobe style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.nationality', 'Nacionalidad')}
                  </label>
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.nacionalidad ? c.readonlyText : '#94a3b8', fontStyle: formData.nacionalidad ? 'normal' : 'italic' }}>
                      {formData.nacionalidad ? t('perfil.countries.' + formData.nacionalidad, formData.nacionalidad) : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Teléfono */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaPhone style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.phone', 'Teléfono')}
                  </label>
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.telefono ? c.readonlyText : '#94a3b8', fontStyle: formData.telefono ? 'normal' : 'italic' }}>
                      {formData.telefono ? `${getPrefijoPais(formData.nacionalidad)} ${formData.telefono}` : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Dirección */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    {t('perfil.address', 'Dirección')}
                  </label>
                  <div style={{ ...readonlyStyle, padding: '0 14px' }}>
                    <span style={{ color: formData.direccion ? c.readonlyText : '#94a3b8', fontStyle: formData.direccion ? 'normal' : 'italic' }}>
                      {formData.direccion || t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
              </div>
  
              {/* Tarjeta 3: Documento de Identidad */}
              <div style={{ background: c.innerCardBg, borderRadius: '14px', border: `1px solid ${c.innerCardBorder}`, boxShadow: c.innerCardShadow, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}` }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: esModoOscuro ? 'var(--brand-text-dark)' : 'var(--brand-secondary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('perfil.identityDoc', 'Documento de Identidad')}
                  </h2>
                </div>
  
                {/* Tipo de documento */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaIdCard style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.docType', 'Tipo de documento')}
                  </label>
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.tipoDocumento ? c.readonlyText : '#94a3b8', fontStyle: formData.tipoDocumento ? 'normal' : 'italic' }}>
                      {formData.tipoDocumento ? getNombreTipoDoc(formData.tipoDocumento) : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
  
                {/* Número de documento */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center' }}>
                    <FaHashtag style={{ color: c.accentText || 'var(--brand-secondary)', fontSize: '12px', marginRight: '6px' }} />
                    {t('perfil.docNumber', 'Número de documento')}
                  </label>
                  <div style={readonlyStyle}>
                    <span style={{ color: formData.cedula ? c.readonlyText : '#94a3b8', fontStyle: formData.cedula ? 'normal' : 'italic' }}>
                      {formData.cedula ? formData.cedula : t('perfil.incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
              </div>
  
            </div>
  )
}
