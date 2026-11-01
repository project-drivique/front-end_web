import { useTranslation } from 'react-i18next'
import { FaDirections, FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa'

export default function BranchLocationMapCard({
  mapIframeUrl,
  googleMapsExternalUrl,
  form,
  setForm,
  errors,
  setErrors,
  latRef,
  lngRef,
}) {
  const { t } = useTranslation()

  return (
    <article className="branch-profile-card branch-profile-card--equal">
      <div className="branch-profile-card-header">
        <div className="branch-profile-card-title-wrap">
          <span className="branch-profile-card-title">
            <FaMapMarkerAlt className="branch-profile-card-icon" aria-hidden="true" />
            {t('branchProfile.location.title', 'Ubicación')}
          </span>
          <span className="branch-profile-card-desc">
            {t('branchProfile.location.desc', 'Posicionamiento satelital de la sucursal')}
          </span>
        </div>
      </div>

      <div className="branch-profile-card-body branch-profile-card-body--stretched">
        <div className="branch-profile-map-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
          {mapIframeUrl ? (
            <iframe
              title={t('branchProfile.location.title', 'Ubicación')}
              src={mapIframeUrl}
              className="branch-profile-map-iframe"
              loading="lazy"
              style={{ border: 'none', width: '100%', height: '100%', minHeight: 220 }}
            />
          ) : (
            <div className="branch-profile-map-fallback">
              <FaMapMarkerAlt className="branch-profile-fallback-icon" aria-hidden="true" />
              <span>{t('branchProfile.location.mapUnavailable', 'Mapa no disponible')}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, marginBottom: 4 }}>
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--brand-primary, #2563eb)',
              textDecoration: 'none',
            }}
          >
            <FaExternalLinkAlt size={11} /> {t('branchProfile.location.openInMaps', 'Abrir en Google Maps')}
          </a>
        </div>

        <div className="branch-profile-fields-row" style={{ marginTop: 10 }}>
          <div className="branch-profile-field">
            <label htmlFor="branchLat" className="branch-profile-label">
              {t('branchProfile.fields.latitude', 'Latitud')}
            </label>
            <input
              id="branchLat"
              ref={latRef}
              type="text"
              className={`branch-profile-input ${errors.latitud ? 'branch-profile-input--error' : ''}`}
              value={form.latitud}
              onChange={(e) => {
                setForm({ ...form, latitud: e.target.value })
                if (errors.latitud) setErrors({ ...errors, latitud: null, longitud: null })
              }}
              placeholder="Ej. 4.7016"
            />
          </div>

          <div className="branch-profile-field">
            <label htmlFor="branchLng" className="branch-profile-label">
              {t('branchProfile.fields.longitude', 'Longitud')}
            </label>
            <input
              id="branchLng"
              ref={lngRef}
              type="text"
              className={`branch-profile-input ${errors.longitud ? 'branch-profile-input--error' : ''}`}
              value={form.longitud}
              onChange={(e) => {
                setForm({ ...form, longitud: e.target.value })
                if (errors.longitud) setErrors({ ...errors, latitud: null, longitud: null })
              }}
              placeholder="Ej. -74.1469"
            />
          </div>
        </div>

        {googleMapsExternalUrl && (
          <div className="branch-profile-directions-wrap">
            <a
              href={googleMapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="branch-profile-directions-link"
            >
              <FaDirections aria-hidden="true" />
              <span>{t('branchProfile.location.getDirections', 'Cómo llegar')}</span>
            </a>
          </div>
        )}
      </div>
    </article>
  )
}

