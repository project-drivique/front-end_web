import { useState, useEffect } from 'react'
import { FaFilePdf, FaSpinner, FaIdCard } from 'react-icons/fa'
import { api } from '../services/httpClient'
import { resolveDocumentUrl } from '../utils/documentUtils'

export default function DocumentPreviewer({
  url,
  title = 'Documento KYC',
  isZoomed = false,
  onBlobReady,
  className = '',
  style = {},
  fallbackSubtitle = '',
  fallbackDocNumber = '',
}) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [isPdf, setIsPdf] = useState(false)

  useEffect(() => {
    let isMounted = true
    let activeObjectUrl = null

    if (!url) {
      setBlobUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    // Si ya es un blob: o data: URL, usarlo directamente
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      setBlobUrl(url)
      const pdf = url.toLowerCase().includes('.pdf') || url.startsWith('data:application/pdf')
      setIsPdf(pdf)
      setLoading(false)
      if (onBlobReady) onBlobReady(url)
      return
    }

    const fetchDocumentBlob = async () => {
      setLoading(true)
      setError(false)
      try {
        const resolved = resolveDocumentUrl(url)
        // Descargamos el blob con el cliente HTTP para incluir automáticamente
        // el Bearer token y eludir restricciones cruzadas CSP frame-ancestors
        const response = await api.get(resolved, { responseType: 'blob' })
        if (!isMounted) return

        const contentType = response.headers?.['content-type'] || response.data?.type || ''
        const pdf = contentType.toLowerCase().includes('pdf') || url.toLowerCase().includes('.pdf')
        const blob = new Blob([response.data], {
          type: pdf ? 'application/pdf' : (contentType || 'image/jpeg')
        })
        activeObjectUrl = URL.createObjectURL(blob)

        setBlobUrl(activeObjectUrl)
        setIsPdf(pdf)
        if (onBlobReady) onBlobReady(activeObjectUrl)
      } catch (err) {
        if (!isMounted) return
        console.warn('Aviso: No se pudo descargar el archivo para vista previa:', err?.message || err)
        setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDocumentBlob()

    return () => {
      isMounted = false
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl)
      }
    }
  }, [url])

  if (loading) {
    return (
      <div
        className="doc-preview-loading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: isZoomed ? '50vh' : '380px',
          gap: 12,
          ...style,
        }}
      >
        <FaSpinner
          className="spin"
          style={{
            fontSize: 32,
            color: 'var(--brand-primary, #6366f1)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: 13, color: 'var(--city-muted, #64748b)', fontWeight: 500 }}>
          Cargando documento seguro...
        </span>
      </div>
    )
  }

  if (error || !url) {
    return (
      <div
        className="doc-preview-empty"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: isZoomed ? '50vh' : '380px',
          gap: 10,
          padding: 24,
          textAlign: 'center',
          background: 'var(--city-bg, #f8fafc)',
          borderRadius: 12,
          border: '1.5px dashed var(--city-border, #cbd5e1)',
          ...style,
        }}
      >
        {error ? (
          <>
            <FaIdCard size={44} style={{ color: 'var(--brand-primary, #6366f1)', marginBottom: 6, opacity: 0.85 }} />
            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              {title}
            </h4>
            {fallbackSubtitle && (
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: '#64748b' }}>
                {fallbackSubtitle}
              </p>
            )}
            <span
              style={{
                fontSize: 11.5,
                color: '#059669',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '4px 10px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              ✓ {fallbackDocNumber ? `Expediente N.° ${fallbackDocNumber}` : 'Expediente registrado en sucursal'}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              (Archivo digitalizado protegido en servidor)
            </span>
          </>
        ) : (
          <>
            <FaFilePdf style={{ fontSize: 38, opacity: 0.35, color: 'var(--city-muted, #94a3b8)' }} />
            <span style={{ fontSize: 13, color: 'var(--city-muted, #64748b)' }}>
              No disponible
            </span>
          </>
        )}
      </div>
    )
  }

  if (isPdf) {
    return (
      <div
        className={`doc-preview-container ${className}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: isZoomed ? '68vh' : '420px',
          position: 'relative',
          cursor: 'default',
          overflow: 'hidden',
          borderRadius: 8,
          ...style,
        }}
      >
        <iframe
          src={`${blobUrl}#toolbar=${isZoomed ? '1' : '0'}&navpanes=0`}
          title={title}
          className="doc-preview-iframe"
          style={{
            width: '100%',
            height: '100%',
            minHeight: isZoomed ? '68vh' : '420px',
            border: 'none',
            borderRadius: 8,
            pointerEvents: 'auto',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`doc-preview-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: isZoomed ? '60vh' : '380px',
        position: 'relative',
        cursor: 'default',
        overflow: 'auto',
        borderRadius: 8,
        ...style,
      }}
    >
      <img
        src={blobUrl}
        alt={title}
        className={isZoomed ? 'doc-zoom-img' : 'doc-preview-img'}
        style={{
          width: '100%',
          height: '100%',
          maxHeight: isZoomed ? '70vh' : '420px',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
