import { FaIdCard, FaCheckCircle, FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const DocumentUploader = ({ label, helpText, error, file, loading, onUpload, onClear, required = true, c }) => {
  const { t } = useTranslation();
  const isDark = c?.isDark;
  
  return (
    <div className="doc-uploader-card" style={{
      border: `1.5px dashed ${error ? '#ef4444' : (isDark ? 'var(--brand-accent)' : 'var(--brand-border)')}`,
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'center',
      background: c?.cardBg || '#ffffff',
      transition: 'all 200ms ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative',
      minWidth: 0,
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span className="doc-uploader-label" style={{ fontSize: 15, fontWeight: 800, color: c?.textPrimary || '#0f172a' }}>{label}{required ? ' *' : ''}</span>
        <span className="doc-uploader-help" style={{ fontSize: 12, color: c?.textSecondary || '#64748b', maxWidth: '420px', lineHeight: 1.45, textAlign: 'center', margin: '0 0 4px' }}>{helpText}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c?.accentText || 'var(--brand-primary)', fontWeight: 700 }}>
          <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Subiendo...</span>
        </div>
      ) : file ? (
        <div className="doc-uploader-file" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
          border: `1px solid ${isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
          padding: '10px 16px',
          borderRadius: 14,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* Blue checkmark circle */}
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FaCheckCircle size={14} color="#ffffff" />
          </div>

          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: c?.accentText || 'var(--brand-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {file.name}
            </div>
            <div style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: c?.textSecondary || '#64748b',
              marginTop: 2
            }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          {/* Trash delete button */}
          <button
            type="button"
            onClick={onClear}
            title={t('hc.eliminar_archivo', 'Eliminar archivo')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: c?.textSecondary || '#64748b',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: 8,
              transition: 'opacity 0.2s',
              opacity: 0.85
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      ) : (
        <label className="doc-uploader-btn" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 24px',
          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : (c?.cardBorder || '#e2e8f0')}`,
          borderRadius: 14,
          fontSize: 13.5,
          fontWeight: 700,
          color: c?.accentText || 'var(--brand-secondary)',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          transition: 'all 150ms ease'
        }}>
          <FaCloudUploadAlt size={18} color={c?.accentText || 'var(--brand-secondary)'} />
          <span>{t('hc.subir_pdf_max_5mb', 'Subir PDF (máx 5MB)')}</span>
          <input
            type="file"
            accept=".pdf"
            onChange={onUpload}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0', fontWeight: 600 }}>{error}</p>
      )}
    </div>
  );
};

export default function PersonalDataPart2({ c, cedulaCargando, cedulaError, datosForm, docsVerificados, errores, handleUpload, licenciaCargando, licenciaError, nombreDocSeleccionado, onCambio, sectionCardStyle, t }) {
  return (
    <div style={sectionCardStyle}>
          <div style={{ margin: '0 0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FaIdCard color={c?.accentText || 'var(--brand-secondary)'} size={15} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
                {docsVerificados
                  ? t('vehiculo.docsVerification', 'Verificación Documental')
                  : t('vehiculo.mandatoryDocsVerification', 'Verificación Documental Obligatoria')}
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: c?.textSecondary || '#64748b', lineHeight: 1.4 }}>
              {docsVerificados
                ? t('vehiculo.docsAlreadyVerifiedSub', 'Ya verificamos tus documentos en una reserva anterior. Si quieres, puedes reemplazarlos subiendo nuevos archivos PDF.')
                : t('vehiculo.mandatoryDocsSub', 'Sube los documentos requeridos para verificar tu identidad y habilitar la reserva del vehículo.')}
            </p>
          </div>
  
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {docsVerificados && (
              <div style={{
                background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
                border: `1px solid ${c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}>
                <div style={{
                  color: 'var(--brand-text)',
                  fontSize: 18,
                  marginTop: 2,
                  flexShrink: 0
                }}>
                  <FaCheckCircle />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: c?.isDark ? 'var(--brand-border)' : 'var(--brand-primary-active)',
                  lineHeight: 1.45
                }}>
                  {t('vehiculo.docsAlreadyRegisteredTitle', 'Documentos ya registrados:')}{' '}
                  {t('vehiculo.docsAlreadyRegisteredDesc', 'Ya has subido tu cédula y licencia de conducción anteriormente. No es obligatorio volver a cargarlos, pero si lo deseas puedes reemplazarlos subiendo nuevos archivos PDF.')}
                </p>
              </div>
            )}
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentUploader
                label={nombreDocSeleccionado}
                helpText={
                  datosForm.tipoDoc === 'PASAPORTE'
                    ? t('vehiculo.passportHelpText', 'Sube tu pasaporte vigente en formato PDF (página de datos y foto, máx 5MB)')
                    : (datosForm.tipoDoc
                        ? t('vehiculo.docHelpTextDynamic', 'Sube tu {{doc}} en un solo archivo PDF (ambos lados incluidos si aplica, máx 5MB)', { doc: nombreDocSeleccionado })
                        : t('vehiculo.nationalIdHelpText', 'Sube tu Cédula de Ciudadanía (CC) en un solo archivo PDF (ambos lados incluidos si aplica, máx 5MB)')
                      )
                }
                error={errores.cedulaPdf || cedulaError}
                file={datosForm.cedulaPdf}
                loading={cedulaCargando}
                required={!docsVerificados}
                onUpload={(e) => handleUpload('cedula', e)}
                onClear={() => onCambio('cedulaPdf', null)}
                c={c}
              />
              <DocumentUploader
                label={t('vehiculo.driverLicense', 'Licencia de Conducción')}
                helpText={t('vehiculo.driverLicenseHelpText', 'Sube tu licencia de conducción vigente y legible en formato PDF (máx 5MB)')}
                error={errores.licenciaPdf || licenciaError}
                file={datosForm.licenciaPdf}
                loading={licenciaCargando}
                required={!docsVerificados}
                onUpload={(e) => handleUpload('licencia', e)}
                onClear={() => onCambio('licenciaPdf', null)}
                c={c}
              />
            </div>
  
            {/* Privacy & Legal Notice Banner */}
            <div style={{
              background: c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.08)' : 'var(--brand-soft)',
              border: `1px solid ${c?.isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-border)'}`,
              borderRadius: 14,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `1.8px solid ${c?.accentText || 'var(--brand-secondary)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c?.accentText || 'var(--brand-secondary)'
                }} />
              </div>
              <p style={{
                margin: 0,
                fontSize: 12.5,
                fontWeight: 500,
                color: c?.accentText || 'var(--brand-secondary)',
                lineHeight: 1.45
              }}>
                {t('vehiculo.docsSecurityNotice', 'Tus documentos se usan exclusivamente para la elaboración del contrato digital de alquiler y la verificación de identidad.')}
              </p>
            </div>
          </div>
        </div>
  )
}
