import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaLock,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaCar,
  FaCheck,
  FaTimes,
  FaDirections,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaUndo,
  FaSearch,
  FaCreditCard,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchProfile } from '../../../hooks/useBranchProfile'
import { showAlert } from '../../../utils/swalConfig'
import { getPlaceSchedule, formatSchedule } from '../../../utils/branchSchedules'
import { CIUDADES } from '../../catalog/constants'
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
    if (e) e.preventDefault()

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

  // Ciudad e infraestructura aeroportuaria / terminal
  const cityObj = useMemo(() => {
    if (!profile?.ciudad) return null
    const cleanCity = String(profile.ciudad).trim().toLowerCase()
    return (
      CIUDADES.find(
        (c) =>
          c.nombre?.toLowerCase() === cleanCity ||
          c.id?.toLowerCase() === cleanCity ||
          cleanCity.includes(c.nombre?.toLowerCase()) ||
          c.nombre?.toLowerCase().includes(cleanCity)
      ) || null
    )
  }, [profile?.ciudad])

  const hasAirportOrTerminal = Boolean(cityObj?.tieneAeropuerto || cityObj?.tieneTerminal)
  const cityName = profile?.ciudad || 'tu ciudad'

  // Horarios usando branchSchedules.js (getPlaceSchedule y formatSchedule)
  const branchScheduleObj = useMemo(() => {
    return getPlaceSchedule({ branchType: profile?.branchType })
  }, [profile?.branchType])

  const homeScheduleObj = useMemo(() => {
    return getPlaceSchedule({ kind: 'home_delivery' })
  }, [])

  const formattedBranchSchedule = useMemo(() => {
    return formatSchedule(branchScheduleObj, i18n.language)
  }, [branchScheduleObj, i18n.language])

  const formattedHomeSchedule = useMemo(() => {
    return formatSchedule(homeScheduleObj, i18n.language)
  }, [homeScheduleObj, i18n.language])

  const formattedAirportSchedule = formattedHomeSchedule

  if (loading || !profile) {
    return (
      <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
        <ManagementSidebar branchOnly={true} />
        <main className="management-main branch-profile-main">
          <div className="branch-profile-skeleton-header">
            <div className="branch-skeleton-block" style={{ width: 180, height: 28 }} />
            <div className="branch-skeleton-block" style={{ width: 320, height: 16, marginTop: 8 }} />
          </div>
          <div className="branch-profile-grid">
            <div className="branch-skeleton-block" style={{ height: 360, borderRadius: 16 }} />
            <div className="branch-skeleton-block" style={{ height: 360, borderRadius: 16 }} />
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
        {/* TOPBAR OPERATIVA UNIFICADA */}
        <div className="branch-topbar">
          <div className="branch-search-box">
            <FaSearch className="branch-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="branch-search-input"
              placeholder="Buscar en la sucursal..."
              aria-label="Buscar en la sucursal"
            />
          </div>

          <div className="branch-topbar-actions">
            {/* Selector de modo pruebas */}
            <div className="branch-profile-dev-pill">
              <span className="branch-profile-dev-label">Pruebas:</span>
              <select
                id="devBranchSelect"
                value={selectedDevBranchId || profile.id}
                onChange={(e) => setSelectedDevBranchId(e.target.value)}
                className="branch-profile-dev-select"
                aria-label="Seleccionar sucursal de prueba"
              >
                {allDevBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} ({b.branchType === 'AIRPORT_TERMINAL' ? '24h' : '8am-6pm'})
                  </option>
                ))}
              </select>
            </div>

            <div className="branch-divider-v" />

            <MenuConfiguracion />

            <div className="branch-user-profile-chip">
              <div className="branch-user-avatar">
                {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="branch-user-info-text">
                <strong className="branch-user-name">
                  {user?.nombre || 'Andrés Felipe Castro'}
                </strong>
                <span className="branch-user-role">
                  {user?.rol || 'encargado_sucursal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO BANNER INFORMATIVO DE LA SUCURSAL */}
        <header className="branch-profile-hero-banner">
          <div className="branch-profile-hero-content">
            <div className="branch-profile-hero-badge-row">
              <div className="branch-profile-hero-badge">
                <span className="branch-profile-live-dot" />
                <span>Sucursal Activa y Operativa</span>
              </div>
              <span className="branch-profile-type-tag">
                {isAirport ? 'Terminal Aeropuerto · 24 Horas' : 'Sucursal Estándar · Ciudad'}
              </span>
            </div>

            <h1 className="branch-profile-hero-title">
              {profile.nombre || 'Alamo Bogotá - Aeropuerto'}
            </h1>

            <p className="branch-profile-hero-subtitle">
              Ficha informativa y técnica de la sucursal asignada · {profile.ciudad || 'Bogotá D.C.'}
            </p>
          </div>

          <div className="branch-profile-hero-actions">
            {hasUnsavedChanges && (
              <div className="branch-profile-unsaved-alert">
                <FaExclamationTriangle aria-hidden="true" />
                <span>Cambios pendientes</span>
              </div>
            )}

            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--outlined"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges || saving}
              title="Restablecer valores originales"
            >
              <FaUndo aria-hidden="true" />
              <span>Descartar</span>
            </button>

            <button
              type="button"
              className="branch-hero-btn branch-hero-btn--white"
              onClick={handleSubmit}
              disabled={!hasUnsavedChanges || saving}
              title="Guardar información editada"
            >
              <FaSave aria-hidden="true" />
              <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </header>

        {/* FORMULARIO Y TARJETAS INFORMATIVAS */}
        <form onSubmit={handleSubmit} noValidate className="branch-profile-form-container">
          <div className="branch-profile-grid">
            {/* COLUMNA IZQUIERDA: INFORMACIÓN GENERAL + HORARIOS */}
            <div className="branch-profile-col">
              {/* TARJETA 1: INFORMACIÓN GENERAL (DATOS Y CONTACTO) */}
              <article className="branch-profile-card">
                <div className="branch-profile-card-header">
                  <div className="branch-profile-card-title-wrap">
                    <span className="branch-profile-card-title">
                      <FaBuilding className="branch-profile-card-icon" aria-hidden="true" />
                      {t('branchProfile.general.title', 'Información general')}
                    </span>
                    <span className="branch-profile-card-desc">
                      Datos visibles para los clientes en el catálogo público
                    </span>
                  </div>
                </div>

                <div className="branch-profile-card-body">
                  <div className="branch-profile-fields-row">
                    {/* Nombre de la Sede (Lectura) */}
                    <div className="branch-profile-field">
                      <label htmlFor="branchName" className="branch-profile-label">
                        {t('branchProfile.fields.name', 'Nombre de la sucursal')}
                      </label>
                      <div className="branch-profile-input-readonly">
                        <input
                          id="branchName"
                          type="text"
                          className="branch-profile-input"
                          value={profile.nombre}
                          readOnly
                        />
                        <FaLock className="branch-profile-lock-icon" aria-hidden="true" />
                      </div>
                      <span className="branch-profile-help-text">
                        {t('branchProfile.readOnlyHint', 'Solo el administrador general puede cambiarlo')}
                      </span>
                    </div>

                    {/* Ciudad (Lectura) */}
                    <div className="branch-profile-field">
                      <label htmlFor="branchCity" className="branch-profile-label">
                        {t('branchProfile.fields.city', 'Ciudad')}
                      </label>
                      <div className="branch-profile-input-readonly">
                        <input
                          id="branchCity"
                          type="text"
                          className="branch-profile-input"
                          value={profile.ciudad}
                          readOnly
                        />
                        <FaLock className="branch-profile-lock-icon" aria-hidden="true" />
                      </div>
                      <span className="branch-profile-help-text">
                        {t('branchProfile.readOnlyHint', 'Solo el administrador general puede cambiarlo')}
                      </span>
                    </div>
                  </div>

                  <div className="branch-profile-fields-row">
                    {/* Dirección Física (Editable, Obligatoria) */}
                    <div className="branch-profile-field">
                      <label htmlFor="branchAddress" className="branch-profile-label">
                        {t('branchProfile.fields.address', 'Dirección')} *
                      </label>
                      <input
                        id="branchAddress"
                        ref={addressRef}
                        type="text"
                        className={`branch-profile-input ${errors.direccion ? 'branch-profile-input--error' : ''}`}
                        value={form.direccion}
                        onChange={(e) => {
                          setForm({ ...form, direccion: e.target.value })
                          if (errors.direccion) setErrors({ ...errors, direccion: null })
                        }}
                        placeholder="Ej. Calle 26 # 103-09 Entrada 1"
                        required
                      />
                      {errors.direccion && (
                        <span className="branch-profile-error-msg" role="alert">
                          {errors.direccion}
                        </span>
                      )}
                    </div>

                    {/* Teléfono de Contacto (Editable, Opcional) */}
                    <div className="branch-profile-field">
                      <label htmlFor="branchPhone" className="branch-profile-label">
                        {t('branchProfile.fields.phone', 'Teléfono')}
                      </label>
                      <input
                        id="branchPhone"
                        ref={phoneRef}
                        type="text"
                        className={`branch-profile-input ${errors.telefono ? 'branch-profile-input--error' : ''}`}
                        value={form.telefono}
                        onChange={(e) => {
                          setForm({ ...form, telefono: e.target.value })
                          if (errors.telefono) setErrors({ ...errors, telefono: null })
                        }}
                        placeholder="Ej. +57 601 425 1000"
                      />
                      {errors.telefono && (
                        <span className="branch-profile-error-msg" role="alert">
                          {errors.telefono}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Indicaciones de recogida (Editable, Textarea) */}
                  <div className="branch-profile-field" style={{ marginTop: 4 }}>
                    <div className="branch-profile-label-row">
                      <label htmlFor="branchPickup" className="branch-profile-label">
                        {t('branchProfile.fields.pickupInstructions', 'Indicaciones de recogida')}
                      </label>
                      <span className="branch-profile-counter">
                        {form.indicacionesRecogida.length}/140
                      </span>
                    </div>
                    <textarea
                      id="branchPickup"
                      rows={2}
                      maxLength={140}
                      className="branch-profile-textarea"
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

              {/* TARJETA 2: HORARIOS DE ATENCIÓN */}
              <article className="branch-profile-card">
                <div className="branch-profile-card-header">
                  <div className="branch-profile-card-title-wrap">
                    <span className="branch-profile-card-title">
                      <FaClock className="branch-profile-card-icon" aria-hidden="true" />
                      {t('branchProfile.schedules.title', 'Horarios de atención')}
                    </span>
                    <span className="branch-profile-card-desc">
                      Regulan las horas habilitadas para entrega y devolución de vehículos
                    </span>
                  </div>
                </div>

                <div className="branch-profile-card-body">
                  <div className="branch-profile-schedule-grid">
                    <div className="branch-profile-schedule-box">
                      <div className="branch-profile-schedule-head">
                        <span className="branch-dot branch-dot--green" />
                        <span className="branch-profile-schedule-title">
                          {t('branchProfile.schedules.branchAttention', 'Atención en la sucursal')}
                        </span>
                      </div>
                      <strong className="branch-profile-schedule-val">
                        {formattedBranchSchedule}
                      </strong>
                      <span className="branch-profile-schedule-desc">
                        {isAirport
                          ? t('branchProfile.schedules.typeAirport', 'Aeropuerto o terminal')
                          : t('branchProfile.schedules.typeStandard', 'Sucursal estándar')}
                      </span>
                    </div>

                    <div className="branch-profile-schedule-box">
                      <div className="branch-profile-schedule-head">
                        <span className="branch-dot branch-dot--blue" />
                        <span className="branch-profile-schedule-title">
                          {t('branchProfile.schedules.homeDelivery', 'Entrega y recogida a domicilio')}
                        </span>
                      </div>
                      <strong className="branch-profile-schedule-val">
                        {formattedHomeSchedule}
                      </strong>
                      <span className="branch-profile-schedule-desc">
                        Servicio puerta a puerta en la ciudad
                      </span>
                    </div>
                  </div>

                  <div className="branch-profile-info-banner">
                    <FaInfoCircle className="branch-profile-info-icon" aria-hidden="true" />
                    <p className="branch-profile-info-text">
                      {t(
                        'branchProfile.schedules.infoNote',
                        'Estos horarios determinan las horas de retiro y devolución que pueden elegir tus clientes al reservar, según el lugar que escojan.'
                      )}
                    </p>
                  </div>
                </div>
              </article>
            </div>

            {/* COLUMNA DERECHA: UBICACIÓN + CÓMO FUNCIONA LA ENTREGA + RESUMEN */}
            <div className="branch-profile-col">
              {/* TARJETA 3: UBICACIÓN */}
              <article className="branch-profile-card">
                <div className="branch-profile-card-header">
                  <div className="branch-profile-card-title-wrap">
                    <span className="branch-profile-card-title">
                      <FaMapMarkerAlt className="branch-profile-card-icon" aria-hidden="true" />
                      {t('branchProfile.location.title', 'Ubicación')}
                    </span>
                    <span className="branch-profile-card-desc">
                      Posicionamiento satelital de la sede
                    </span>
                  </div>
                </div>

                <div className="branch-profile-card-body">
                  {/* Visor interactivo de Google Maps */}
                  <div className="branch-profile-map-wrap">
                    {mapIframeUrl ? (
                      <iframe
                        title={t('branchProfile.location.title', 'Ubicación')}
                        src={mapIframeUrl}
                        className="branch-profile-map-iframe"
                        loading="lazy"
                      />
                    ) : (
                      <div className="branch-profile-map-fallback">
                        <FaMapMarkerAlt className="branch-profile-fallback-icon" aria-hidden="true" />
                        <span>{t('branchProfile.location.mapUnavailable', 'Mapa no disponible')}</span>
                      </div>
                    )}
                  </div>

                  {/* Coordenadas Latitud / Longitud */}
                  <div className="branch-profile-fields-row" style={{ marginTop: 12 }}>
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
                        placeholder="Ej. 4.6983"
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
                        placeholder="Ej. -74.1415"
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
                        <span>{t('branchProfile.location.getDirections', 'Cómo llegar →')}</span>
                      </a>
                    </div>
                  )}
                </div>
              </article>

              {/* NUEVA TARJETA: CÓMO FUNCIONA LA ENTREGA SEGÚN EL PAGO (SOLO LECTURA) */}
              <article className="branch-profile-card">
                <div className="branch-profile-card-header">
                  <div className="branch-profile-card-title-wrap">
                    <span className="branch-profile-card-title">
                      <FaCreditCard className="branch-profile-card-icon" aria-hidden="true" />
                      {t('branchProfile.deliveryByPayment.title', 'Cómo funciona la entrega según el pago')}
                    </span>
                  </div>
                </div>

                <div className="branch-profile-card-body">
                  <p className="branch-delivery-intro">
                    {t(
                      'branchProfile.deliveryByPayment.intro',
                      'Esto es lo que ven tus clientes al elegir dónde retirar y devolver su vehículo, según cómo paguen.'
                    )}
                  </p>

                  <div className="branch-delivery-table-wrap">
                    <table className="branch-delivery-table">
                      <thead>
                        <tr>
                          <th className="branch-delivery-th-place">
                            {t('branchProfile.deliveryByPayment.title', 'Lugar')}
                          </th>
                          <th className="branch-delivery-th">
                            {t('branchProfile.deliveryByPayment.colCash', 'Efectivo')}
                          </th>
                          <th className="branch-delivery-th">
                            {t('branchProfile.deliveryByPayment.colOnline', 'Pago en línea')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Fila 1: En esta sucursal */}
                        <tr>
                          <td className="branch-delivery-td-name">
                            <span className="branch-delivery-place-title">
                              {t('branchProfile.deliveryByPayment.rowBranch', 'En esta sucursal')}
                            </span>
                          </td>
                          <td>
                            <div className="branch-delivery-avail-cell">
                              <FaCheck className="branch-delivery-icon-check" aria-hidden="true" />
                              <span className="branch-delivery-schedule">{formattedBranchSchedule}</span>
                            </div>
                          </td>
                          <td>
                            <div className="branch-delivery-avail-cell">
                              <FaCheck className="branch-delivery-icon-check" aria-hidden="true" />
                              <span className="branch-delivery-schedule">{formattedBranchSchedule}</span>
                            </div>
                          </td>
                        </tr>

                        {/* Fila 2: A domicilio */}
                        <tr>
                          <td className="branch-delivery-td-name">
                            <span className="branch-delivery-place-title">
                              {t('branchProfile.deliveryByPayment.rowHome', 'A domicilio')}
                            </span>
                          </td>
                          <td>
                            <div className="branch-delivery-avail-cell">
                              <FaTimes className="branch-delivery-icon-cross" aria-hidden="true" />
                            </div>
                          </td>
                          <td>
                            <div className="branch-delivery-avail-cell">
                              <FaCheck className="branch-delivery-icon-check" aria-hidden="true" />
                              <span className="branch-delivery-schedule">{formattedHomeSchedule}</span>
                            </div>
                          </td>
                        </tr>

                        {/* Fila 3: En aeropuerto o terminal */}
                        <tr>
                          <td className="branch-delivery-td-name">
                            <span className="branch-delivery-place-title">
                              {t('branchProfile.deliveryByPayment.rowAirport', {
                                city: cityName,
                                defaultValue: `En aeropuerto o terminal de ${cityName}`,
                              })}
                            </span>
                          </td>
                          {hasAirportOrTerminal ? (
                            <>
                              <td>
                                <div className="branch-delivery-avail-cell">
                                  <FaTimes className="branch-delivery-icon-cross" aria-hidden="true" />
                                </div>
                              </td>
                              <td>
                                <div className="branch-delivery-avail-cell">
                                  <FaCheck className="branch-delivery-icon-check" aria-hidden="true" />
                                  <span className="branch-delivery-schedule">{formattedAirportSchedule}</span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <td colSpan={2} className="branch-delivery-td-no-option">
                              <span className="branch-delivery-no-option">
                                {t('branchProfile.deliveryByPayment.noAirportOption', 'Tu ciudad no ofrece esta opción')}
                              </span>
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Nota pequeña con ícono de información */}
                  <div className="branch-delivery-note">
                    <FaInfoCircle className="branch-delivery-note-icon" aria-hidden="true" />
                    <span>
                      {t('branchProfile.deliveryByPayment.note', {
                        schedule: formattedBranchSchedule,
                        defaultValue: `El horario de tu sucursal es ${formattedBranchSchedule} según su tipo. Esto se define desde Mi sucursal → Horarios de atención.`,
                      })}
                    </span>
                  </div>
                </div>
              </article>

              {/* TARJETA 4: RESUMEN (SOLO LECTURA) */}
              <article className="branch-profile-card">
                <div className="branch-profile-card-header">
                  <div className="branch-profile-card-title-wrap">
                    <span className="branch-profile-card-title">
                      <FaCar className="branch-profile-card-icon" aria-hidden="true" />
                      {t('branchProfile.summaryCard.title', 'Resumen')}
                    </span>
                    <span className="branch-profile-card-desc">
                      Resumen de vehículos, categorías y servicios habilitados
                    </span>
                  </div>
                </div>

                <div className="branch-profile-card-body">
                  <div className="branch-profile-summary-grid">
                    {/* Encargado */}
                    <div className="branch-profile-summary-row">
                      <span className="branch-profile-summary-label">
                        {t('branchProfile.summaryCard.manager', 'Encargado')}
                      </span>
                      <strong className="branch-profile-summary-val">
                        {profile.encargado || user?.nombre || 'Andrés Felipe Castro'}
                      </strong>
                    </div>

                    {/* Vehículos */}
                    <div className="branch-profile-summary-row">
                      <span className="branch-profile-summary-label">
                        {t('branchProfile.summaryCard.vehicles', 'Vehículos')}
                      </span>
                      <div className="branch-profile-fleet-action">
                        <strong className="branch-profile-summary-val">
                          {profile.vehiculosCount || 5} {t('branchProfile.summaryCard.vehicles', 'vehículos').toLowerCase()}
                        </strong>
                        <button
                          type="button"
                          className="branch-profile-link-btn"
                          onClick={() => navigate('/encargado/vehicles')}
                        >
                          {t('branchProfile.summaryCard.viewFleet', 'Ver flota →')}
                        </button>
                      </div>
                    </div>

                    {/* Categorías que ofrece */}
                    <div className="branch-profile-summary-row branch-profile-summary-row--col">
                      <span className="branch-profile-summary-label">
                        {t('branchProfile.summaryCard.categories', 'Categorías que ofrece')}
                      </span>
                      <div className="branch-profile-tags-cloud">
                        {(profile.categorias || ['Sedán', 'SUV', '4x4', 'Compacto', 'Crossover']).map((cat) => (
                          <span key={cat} className="branch-profile-category-tag">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Servicios activos en sede */}
                    <div className="branch-profile-summary-row branch-profile-summary-row--col">
                      <span className="branch-profile-summary-label">Servicios activos en sede</span>
                      <div className="branch-profile-services-list">
                        <div className="branch-profile-service-item">
                          <FaCheckCircle className="branch-profile-service-icon" aria-hidden="true" />
                          <span>Entrega y recepción en mostrador</span>
                        </div>
                        <div className="branch-profile-service-item">
                          <FaCheckCircle className="branch-profile-service-icon" aria-hidden="true" />
                          <span>Servicio a domicilio</span>
                        </div>
                        <div className="branch-profile-service-item">
                          <FaCheckCircle className="branch-profile-service-icon" aria-hidden="true" />
                          <span>Validación biométrica e inspección digital</span>
                        </div>
                      </div>
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
