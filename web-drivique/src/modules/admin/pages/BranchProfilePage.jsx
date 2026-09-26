import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaLock,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchProfile } from '../../../hooks/useBranchProfile'
import { showAlert } from '../../../utils/swalConfig'
import ManagementSidebar from '../components/ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import './BranchProfilePage.css'

export default function BranchProfilePage() {
  const { t, i18n } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const {
    profile,
    loading,
    saving,
    allDevBranches,
    selectedDevBranchId,
    setSelectedDevBranchId,
    saveBranchProfile,
  } = useBranchProfile(user)

  // Estado del formulario editable
  const [form, setForm] = useState({
    direccion: '',
    telefono: '',
    indicacionesRecogida: '',
    latitud: '',
    longitud: '',
  })

  // Estado original para detección de cambios sin guardar
  const [originalForm, setOriginalForm] = useState({
    direccion: '',
    telefono: '',
    indicacionesRecogida: '',
    latitud: '',
    longitud: '',
  })

  // Errores de validación en línea
  const [errors, setErrors] = useState({})

  // Referencias para autofoco en errores
  const addressRef = useRef(null)
  const phoneRef = useRef(null)
  const latRef = useRef(null)
  const lngRef = useRef(null)

  // Sincronizar el formulario cuando el perfil cargue
  useEffect(() => {
    if (profile) {
      const initial = {
        direccion: profile.direccion || '',
        telefono: profile.telefono || '',
        indicacionesRecogida: profile.indicacionesRecogida || '',
        latitud: String(profile.latitud || ''),
        longitud: String(profile.longitud || ''),
      }
      setForm(initial)
      setOriginalForm(initial)
      setErrors({})
    }
  }, [profile])

  // Evaluación de cambios pendientes sin guardar
  const hasUnsavedChanges = useMemo(() => {
    return (
      form.direccion !== originalForm.direccion ||
      form.telefono !== originalForm.telefono ||
      form.indicacionesRecogida !== originalForm.indicacionesRecogida ||
      form.latitud !== originalForm.latitud ||
      form.longitud !== originalForm.longitud
    )
  }, [form, originalForm])

  // Validación de campos
  const validateForm = () => {
    const errs = {}

    // Dirección obligatoria
    if (!form.direccion.trim()) {
      errs.direccion = t('branchProfile.errors.addressRequired', 'La dirección es obligatoria.')
    }

    // Teléfono opcional: solo dígitos, espacios, +, -, de 7 a 13 dígitos
    if (form.telefono.trim()) {
      const digitsOnly = form.telefono.replace(/[^\d]/g, '')
      const validChars = /^[0-9\s+\-]+$/.test(form.telefono)
      if (!validChars || digitsOnly.length < 7 || digitsOnly.length > 13) {
        errs.telefono = t(
          'branchProfile.errors.phoneInvalid',
          'El teléfono debe contener entre 7 y 13 dígitos.'
        )
      }
    }

    // Latitud y Longitud
    const hasLat = form.latitud.trim() !== ''
    const hasLng = form.longitud.trim() !== ''

    if (hasLat || hasLng) {
      if (!hasLat || !hasLng) {
        errs.latitud = t(
          'branchProfile.errors.bothCoordsRequired',
          'Debes ingresar latitud y longitud juntas.'
        )
        errs.longitud = t(
          'branchProfile.errors.bothCoordsRequired',
          'Debes ingresar latitud y longitud juntas.'
        )
      } else {
        const latNum = parseFloat(form.latitud)
        const lngNum = parseFloat(form.longitud)

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
          errs.latitud = t(
            'branchProfile.errors.latInvalid',
            'La latitud debe estar entre -90 y 90.'
          )
        }
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
          errs.longitud = t(
            'branchProfile.errors.lngInvalid',
            'La longitud debe estar entre -180 y 180.'
          )
        }
      }
    }

    setErrors(errs)

    // Autofoco en el primer campo con error
    if (errs.direccion && addressRef.current) {
      addressRef.current.focus()
    } else if (errs.telefono && phoneRef.current) {
      phoneRef.current.focus()
    } else if (errs.latitud && latRef.current) {
      latRef.current.focus()
    } else if (errs.longitud && lngRef.current) {
      lngRef.current.focus()
    }

    return Object.keys(errs).length === 0
  }

  // Cancelar cambios
  const handleCancel = () => {
    setForm({ ...originalForm })
    setErrors({})
  }

  // Guardar cambios
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!hasUnsavedChanges) {
      showAlert({
        icon: 'info',
        title: t('branchProfile.noChanges', 'No hay cambios por guardar'),
        text: t('branchProfile.noChangesHint', 'No has modificado ningún campo de la sucursal.'),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    }

    if (!validateForm()) {
      return
    }

    saveBranchProfile(form)
      .then((updated) => {
        const newFormState = {
          direccion: updated.direccion,
          telefono: updated.telefono,
          indicacionesRecogida: updated.indicacionesRecogida,
          latitud: String(updated.latitud),
          longitud: String(updated.longitud),
        }
        setForm(newFormState)
        setOriginalForm(newFormState)
        setErrors({})

        showAlert({
          icon: 'success',
          title: t('branchProfile.saveSuccessTitle', 'Cambios guardados'),
          text: t(
            'branchProfile.saveSuccessMsg',
            'Los datos de la sucursal han sido actualizados con éxito.'
          ),
          confirmButtonText: t('common.accept', 'Aceptar'),
        })
      })
      .catch((err) => {
        console.error('Error guardando sucursal:', err)
      })
  }

  // Mapa iframe URL dinámica
  const isValidMapCoord =
    !isNaN(parseFloat(form.latitud)) &&
    !isNaN(parseFloat(form.longitud)) &&
    parseFloat(form.latitud) >= -90 &&
    parseFloat(form.latitud) <= 90 &&
    parseFloat(form.longitud) >= -180 &&
    parseFloat(form.longitud) <= 180

  const mapIframeUrl = isValidMapCoord
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        form.latitud
      )},${encodeURIComponent(form.longitud)}&z=16&output=embed`
    : null

  const googleMapsExternalUrl = isValidMapCoord
    ? `https://www.google.com/maps?q=${encodeURIComponent(form.latitud)},${encodeURIComponent(
        form.longitud
      )}`
    : null

  if (loading || !profile) {
    return (
      <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
        <ManagementSidebar branchOnly={true} />
        <main className="management-main branch-profile-main">
          <div className="branch-profile-skeleton-header">
            <div className="branch-skeleton-block" style={{ width: 140, height: 26 }} />
            <div className="branch-skeleton-block" style={{ width: 280, height: 14, marginTop: 6 }} />
          </div>
          <div className="branch-columns-grid">
            <div className="branch-skeleton-block" style={{ height: 320 }} />
            <div className="branch-skeleton-block" style={{ height: 320 }} />
          </div>
        </main>
      </div>
    )
  }

  const isAirport =
    profile.branchType === 'AIRPORT_TERMINAL' ||
    String(profile.branchType).toLowerCase().includes('airport')

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={true} />

      <main className="management-main branch-profile-main">
        {/* ENCABEZADO DE PÁGINA */}
        <header className="branch-profile-header">
          <div className="branch-profile-header__left">
            <h1 className="branch-profile-title">
              {t('branchProfile.title', 'Mi sucursal')}
            </h1>
            <p className="branch-profile-subtitle">
              {t('branchProfile.subtitle', 'Datos que ven tus clientes en el catálogo')}
            </p>
          </div>

          <div className="branch-profile-header__right">
            {/* Selector dev para probar ambas sucursales en modo desarrollo */}
            <div className="branch-dev-selector">
              <label htmlFor="devBranchSelect" className="branch-dev-label">
                {t('branchProfile.devSwitch', 'Modo Pruebas:')}
              </label>
              <select
                id="devBranchSelect"
                value={selectedDevBranchId || profile.id}
                onChange={(e) => setSelectedDevBranchId(e.target.value)}
                className="branch-dev-select"
              >
                {allDevBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} ({b.branchType === 'AIRPORT_TERMINAL' ? '24h' : '8am-6pm'})
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso de cambios sin guardar */}
            {hasUnsavedChanges && (
              <span className="branch-unsaved-text">
                <FaExclamationTriangle aria-hidden="true" />
                {t('branchProfile.unsavedChanges', 'Tienes cambios sin guardar')}
              </span>
            )}

            <div className="branch-profile-actions">
              <button
                type="button"
                className="branch-btn branch-btn--secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                {t('branchProfile.actions.cancel', 'Cancelar')}
              </button>

              <button
                type="button"
                className="branch-btn branch-btn--primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Guardando...' : t('branchProfile.actions.save', 'Guardar cambios')}
              </button>
            </div>
          </div>
        </header>

        {/* CUERPO EN DOS COLUMNAS (1.4fr / 1fr, ALINEADAS ARRIBA) */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="branch-columns-grid">
            {/* COLUMNA IZQUIERDA (1.4fr) */}
            <div className="branch-left-column">
              {/* TARJETA a) Información general */}
              <article className="branch-card">
                <h2 className="branch-card-title">
                  {t('branchProfile.general.title', 'Información general')}
                </h2>

                <div className="branch-form-grid">
                  {/* Nombre (Lectura) y Ciudad (Lectura) */}
                  <div className="branch-form-row branch-form-row--2col">
                    <div className="branch-field">
                      <label htmlFor="branchName" className="branch-label">
                        {t('branchProfile.fields.name', 'Nombre de la sucursal')}
                      </label>
                      <div className="branch-input-readonly-wrap">
                        <input
                          id="branchName"
                          type="text"
                          className="branch-input branch-input--readonly"
                          value={profile.nombre}
                          readOnly
                        />
                        <FaLock className="branch-lock-icon" aria-hidden="true" />
                      </div>
                      <span className="branch-help-text">
                        {t('branchProfile.readOnlyHint', 'Solo el administrador general puede cambiarlo')}
                      </span>
                    </div>

                    <div className="branch-field">
                      <label htmlFor="branchCity" className="branch-label">
                        {t('branchProfile.fields.city', 'Ciudad')}
                      </label>
                      <div className="branch-input-readonly-wrap">
                        <input
                          id="branchCity"
                          type="text"
                          className="branch-input branch-input--readonly"
                          value={profile.ciudad}
                          readOnly
                        />
                        <FaLock className="branch-lock-icon" aria-hidden="true" />
                      </div>
                      <span className="branch-help-text">
                        {t('branchProfile.readOnlyHint', 'Solo el administrador general puede cambiarlo')}
                      </span>
                    </div>
                  </div>

                  {/* Estado (Lectura) */}
                  <div className="branch-field">
                    <label htmlFor="branchStatus" className="branch-label">
                      {t('branchProfile.fields.status', 'Estado')}
                    </label>
                    <div className="branch-input-readonly-wrap">
                      <div className="branch-status-pill-wrap">
                        <span
                          className={`branch-status-pill ${
                            profile.estado === 'activa'
                              ? 'branch-status-pill--active'
                              : 'branch-status-pill--inactive'
                          }`}
                        >
                          {profile.estado === 'activa'
                            ? t('branchProfile.status.active', 'Activa')
                            : t('branchProfile.status.inactive', 'Inactiva')}
                        </span>
                      </div>
                      <FaLock className="branch-lock-icon" aria-hidden="true" />
                    </div>
                    <span className="branch-help-text">
                      {t('branchProfile.readOnlyHint', 'Solo el administrador general puede cambiarlo')}
                    </span>
                  </div>

                  {/* Dirección (Editable, Obligatoria) */}
                  <div className="branch-field">
                    <label htmlFor="branchAddress" className="branch-label">
                      {t('branchProfile.fields.address', 'Dirección')} *
                    </label>
                    <input
                      id="branchAddress"
                      ref={addressRef}
                      type="text"
                      className={`branch-input ${errors.direccion ? 'branch-input--error' : ''}`}
                      value={form.direccion}
                      onChange={(e) => {
                        setForm({ ...form, direccion: e.target.value })
                        if (errors.direccion) setErrors({ ...errors, direccion: null })
                      }}
                      aria-describedby={errors.direccion ? 'err-direccion' : undefined}
                      required
                    />
                    {errors.direccion && (
                      <span id="err-direccion" className="branch-error-msg" role="alert">
                        {errors.direccion}
                      </span>
                    )}
                  </div>

                  {/* Teléfono (Editable, Opcional) */}
                  <div className="branch-field">
                    <label htmlFor="branchPhone" className="branch-label">
                      {t('branchProfile.fields.phone', 'Teléfono')}
                    </label>
                    <input
                      id="branchPhone"
                      ref={phoneRef}
                      type="text"
                      className={`branch-input ${errors.telefono ? 'branch-input--error' : ''}`}
                      value={form.telefono}
                      onChange={(e) => {
                        setForm({ ...form, telefono: e.target.value })
                        if (errors.telefono) setErrors({ ...errors, telefono: null })
                      }}
                      aria-describedby={errors.telefono ? 'err-telefono' : undefined}
                    />
                    {errors.telefono && (
                      <span id="err-telefono" className="branch-error-msg" role="alert">
                        {errors.telefono}
                      </span>
                    )}
                  </div>

                  {/* Indicaciones de recogida (Textarea, Max 140 chars) */}
                  <div className="branch-field">
                    <div className="branch-label-with-counter">
                      <label htmlFor="branchPickup" className="branch-label">
                        {t('branchProfile.fields.pickupInstructions', 'Indicaciones de recogida')}
                      </label>
                      <span className="branch-char-counter">
                        {form.indicacionesRecogida.length}/140
                      </span>
                    </div>
                    <textarea
                      id="branchPickup"
                      rows={2}
                      maxLength={140}
                      className="branch-textarea"
                      placeholder={t(
                        'branchProfile.placeholders.pickupInstructions',
                        'Frente a la salida 3 del aeropuerto'
                      )}
                      value={form.indicacionesRecogida}
                      onChange={(e) =>
                        setForm({ ...form, indicacionesRecogida: e.target.value })
                      }
                    />
                  </div>
                </div>
              </article>

              {/* TARJETA b) Horarios de atención (Solo Lectura) */}
              <article className="branch-card">
                <h2 className="branch-card-title">
                  {t('branchProfile.schedules.title', 'Horarios de atención')}
                </h2>

                <div className="branch-schedules-list">
                  {/* Fila: Tipo de sucursal */}
                  <div className="branch-schedule-row">
                    <div className="branch-schedule-label-wrap">
                      <span className="branch-schedule-label">
                        {t('branchProfile.schedules.typeLabel', 'Tipo de sucursal')}
                      </span>
                      <FaLock className="branch-lock-icon-sm" aria-hidden="true" />
                    </div>
                    <span className="branch-type-pill">
                      {isAirport
                        ? t('branchProfile.schedules.typeAirport', 'Aeropuerto o terminal')
                        : t('branchProfile.schedules.typeStandard', 'Sucursal estándar')}
                    </span>
                  </div>

                  {/* Fila: Atención en la sucursal */}
                  <div className="branch-schedule-row">
                    <span className="branch-schedule-label">
                      {t('branchProfile.schedules.branchAttention', 'Atención en la sucursal')}
                    </span>
                    <strong className="branch-schedule-val">
                      {profile.horarios?.branchFormatted}
                    </strong>
                  </div>

                  {/* Fila: Entrega a domicilio */}
                  <div className="branch-schedule-row">
                    <span className="branch-schedule-label">
                      {t('branchProfile.schedules.homeDelivery', 'Entrega y recogida a domicilio')}
                    </span>
                    <strong className="branch-schedule-val">
                      {profile.horarios?.homeFormatted}
                    </strong>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="branch-schedule-info-note">
                  <FaInfoCircle className="branch-info-icon" aria-hidden="true" />
                  <span>
                    {t(
                      'branchProfile.schedules.infoNote',
                      'Estos horarios determinan las horas de retiro y devolución que pueden elegir tus clientes al reservar, según el lugar que escojan.'
                    )}
                  </span>
                </div>
              </article>
            </div>

            {/* COLUMNA DERECHA (1fr) */}
            <div className="branch-right-column">
              {/* TARJETA c) Ubicación */}
              <article className="branch-card">
                <h2 className="branch-card-title">
                  {t('branchProfile.location.title', 'Ubicación')}
                </h2>

                {/* Iframe Mapa o Fallback */}
                <div className="branch-map-container">
                  {mapIframeUrl ? (
                    <iframe
                      title={t('branchProfile.location.title', 'Ubicación')}
                      src={mapIframeUrl}
                      className="branch-map-iframe"
                      loading="lazy"
                    />
                  ) : (
                    <div className="branch-map-fallback">
                      <FaMapMarkerAlt className="branch-map-fallback-icon" aria-hidden="true" />
                      <span>{t('branchProfile.location.mapUnavailable', 'Mapa no disponible')}</span>
                    </div>
                  )}
                </div>

                {/* Inputs Latitud y Longitud */}
                <div className="branch-form-row branch-form-row--2col" style={{ marginTop: 14 }}>
                  <div className="branch-field">
                    <label htmlFor="branchLat" className="branch-label">
                      {t('branchProfile.fields.latitude', 'Latitud')}
                    </label>
                    <input
                      id="branchLat"
                      ref={latRef}
                      type="text"
                      className={`branch-input ${errors.latitud ? 'branch-input--error' : ''}`}
                      value={form.latitud}
                      onChange={(e) => {
                        setForm({ ...form, latitud: e.target.value })
                        if (errors.latitud) setErrors({ ...errors, latitud: null, longitud: null })
                      }}
                      aria-describedby={errors.latitud ? 'err-latitud' : undefined}
                    />
                    {errors.latitud && (
                      <span id="err-latitud" className="branch-error-msg" role="alert">
                        {errors.latitud}
                      </span>
                    )}
                  </div>

                  <div className="branch-field">
                    <label htmlFor="branchLng" className="branch-label">
                      {t('branchProfile.fields.longitude', 'Longitud')}
                    </label>
                    <input
                      id="branchLng"
                      ref={lngRef}
                      type="text"
                      className={`branch-input ${errors.longitud ? 'branch-input--error' : ''}`}
                      value={form.longitud}
                      onChange={(e) => {
                        setForm({ ...form, longitud: e.target.value })
                        if (errors.longitud) setErrors({ ...errors, latitud: null, longitud: null })
                      }}
                      aria-describedby={errors.longitud ? 'err-longitud' : undefined}
                    />
                    {errors.longitud && (
                      <span id="err-longitud" className="branch-error-msg" role="alert">
                        {errors.longitud}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enlace Cómo llegar */}
                {googleMapsExternalUrl && (
                  <div className="branch-directions-wrapper">
                    <a
                      href={googleMapsExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="branch-link branch-directions-link"
                    >
                      <span>{t('branchProfile.location.getDirections', 'Cómo llegar →')}</span>
                    </a>
                  </div>
                )}
              </article>

              {/* TARJETA d) Resumen (Solo Lectura) */}
              <article className="branch-card">
                <h2 className="branch-card-title">
                  {t('branchProfile.summaryCard.title', 'Resumen')}
                </h2>

                <div className="branch-summary-rows">
                  {/* Encargado */}
                  <div className="branch-summary-item">
                    <span className="branch-summary-item-label">
                      {t('branchProfile.summaryCard.manager', 'Encargado')}
                    </span>
                    <strong className="branch-summary-item-val">{profile.encargado}</strong>
                  </div>

                  {/* Vehículos */}
                  <div className="branch-summary-item">
                    <span className="branch-summary-item-label">
                      {t('branchProfile.summaryCard.vehicles', 'Vehículos')}
                    </span>
                    <div className="branch-summary-vehicles-wrap">
                      <strong className="branch-summary-item-val">
                        {profile.vehiculosCount} vehículos
                      </strong>
                      <button
                        type="button"
                        className="branch-link"
                        onClick={() => navigate('/encargado/vehicles')}
                      >
                        {t('branchProfile.summaryCard.viewFleet', 'Ver flota →')}
                      </button>
                    </div>
                  </div>

                  {/* Categorías que ofrece */}
                  <div className="branch-summary-item branch-summary-item--column">
                    <span className="branch-summary-item-label">
                      {t('branchProfile.summaryCard.categories', 'Categorías que ofrece')}
                    </span>
                    <div className="branch-tags-cloud">
                      {(profile.categorias || []).map((cat) => (
                        <span key={cat} className="branch-category-pill">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
