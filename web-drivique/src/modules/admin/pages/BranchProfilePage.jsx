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
  FaCreditCard,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaUndo,
  FaSave,
  FaPlane,
  FaBus,
  FaHome,
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

/**
 * Componente: BranchProfilePage
 * 
 * @description
 * PÃ¡gina de gestiÃ³n y consulta operativa del perfil de la sucursal asignada al Encargado.
 * 
 * CaracterÃ­sticas principales:
 * 1. Tarjeta de InformaciÃ³n General y UbicaciÃ³n Satelital alineadas en la misma fila con altura equilibrada.
 * 2. MÃ³dulo detallado de Horarios de AtenciÃ³n y Entrega segÃºn el MÃ©todo de Pago:
 *    - Pago Virtual (Wompi): Desglose de horarios por Aeropuerto (24h), Terminal (06:00-22:00), Sede fÃ­sica y Domicilio.
 *    - Pago en Efectivo: Exclusivamente limitado al horario de atenciÃ³n fÃ­sica de la sucursal asignada.
 * 3. Matriz comparativa de disponibilidad y plazos de pago para clientes.
 * 4. Resumen de flota y servicios activos.
 * 5. Soporte para tema oscuro, personalizaciÃ³n de marca e internacionalizaciÃ³n (i18n).
 * 
 * @returns {JSX.Element}
 */
export default function BranchProfilePage() {
  const { t, i18n } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const {
    profile,
    loading,
    saving,
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

  // Estado original para detecciÃ³n de cambios sin guardar
  const [originalForm, setOriginalForm] = useState({
    direccion: '',
    telefono: '',
    indicacionesRecogida: '',
    latitud: '',
    longitud: '',
  })

  // Errores de validaciÃ³n en lÃ­nea
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

  // EvaluaciÃ³n de cambios pendientes sin guardar
  const hasUnsavedChanges = useMemo(() => {
    return (
      form.direccion !== originalForm.direccion ||
      form.telefono !== originalForm.telefono ||
      form.indicacionesRecogida !== originalForm.indicacionesRecogida ||
      form.latitud !== originalForm.latitud ||
      form.longitud !== originalForm.longitud
    )
  }, [form, originalForm])

  // ValidaciÃ³n de campos
  const validateForm = () => {
    const errs = {}

    // DirecciÃ³n obligatoria
    if (!form.direccion.trim()) {
      errs.direccion = t('branchProfile.errors.addressRequired', 'La direcciÃ³n es obligatoria.')
    }

    // TelÃ©fono opcional: solo dÃ­gitos, espacios, +, -, de 7 a 13 dÃ­gitos
    if (form.telefono.trim()) {
      const digitsOnly = form.telefono.replace(/[^\d]/g, '')
      const validChars = /^[0-9\s+\-]+$/.test(form.telefono)
      if (!validChars || digitsOnly.length < 7 || digitsOnly.length > 13) {
        errs.telefono = t(
          'branchProfile.errors.phoneInvalid',
          'El telÃ©fono debe contener entre 7 y 13 dÃ­gitos.'
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
        text: t('branchProfile.noChangesHint', 'No has modificado ningÃºn campo de la sucursal.'),
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
            'Los datos de la sucursal han sido actualizados con Ã©xito.'
          ),
          confirmButtonText: t('common.accept', 'Aceptar'),
        })
      })
      .catch((err) => {
        console.error('Error guardando sucursal:', err)
      })
  }

  // Mapa iframe URL dinÃ¡mica
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

  // Ciudad e infraestructura
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

  // Horarios usando branchSchedules.js
  const branchScheduleObj = useMemo(() => {
    return getPlaceSchedule({ branchType: profile?.branchType })
  }, [profile?.branchType])

  const homeScheduleObj = useMemo(() => {
    return getPlaceSchedule({ kind: 'home_delivery' })
  }, [])

  const airportScheduleObj = useMemo(() => {
    return getPlaceSchedule({ branchType: 'AIRPORT_TERMINAL' })
  }, [])

  const formattedBranchSchedule = useMemo(() => {
    return formatSchedule(branchScheduleObj, i18n.language)
  }, [branchScheduleObj, i18n.language])

  const formattedHomeSchedule = useMemo(() => {
    return formatSchedule(homeScheduleObj, i18n.language)
  }, [homeScheduleObj, i18n.language])

  const formattedAirportSchedule = useMemo(() => {
    return formatSchedule(airportScheduleObj, i18n.language)
  }, [airportScheduleObj, i18n.language])

  if (loading || !profile) {
    return (
      <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
        <ManagementSidebar branchOnly={true} />
        <main className="management-main branch-profile-main">
          <div className="branch-profile-skeleton-header">
            <div className="branch-skeleton-block" style={{ width: 180, height: 28 }} />
            <div className="branch-skeleton-block" style={{ width: 320, height: 16, marginTop: 8 }} />
          </div>
          <div className="branch-profile-row-grid">
            <div className="branch-skeleton-block" style={{ height: 380, borderRadius: 16 }} />
            <div className="branch-skeleton-block" style={{ height: 380, borderRadius: 16 }} />
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
          <div className="branch-topbar-brand-title">
            <span className="branch-topbar-badge">{t('branchProfile.managementBadge', 'GestiÃ³n de Sucursal')}</span>
            <h1 className="branch-topbar-heading">{t('branchProfile.title', 'Mi Sucursal')}</h1>
          </div>

          <div className="branch-topbar-actions">
            {hasUnsavedChanges && (
              <div className="branch-profile-unsaved-alert" style={{ marginRight: 4, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#b45309', background: '#fef3c7', padding: '6px 12px', borderRadius: 8, fontWeight: 600 }}>
                <FaExclamationTriangle aria-hidden="true" />
                <span>{t('branchProfile.unsavedChanges', 'Cambios pendientes')}</span>
              </div>
            )}

            <button
              type="button"
              className="cities-secondary"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges || saving}
              title="Restablecer valores originales"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}
            >
              <FaUndo aria-hidden="true" />
              <span>{t('branchProfile.discard', 'Descartar')}</span>
            </button>

            <button
              type="button"
              className="cities-primary"
              onClick={handleSubmit}
              disabled={!hasUnsavedChanges || saving}
              title="Guardar informaciÃ³n editada"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, fontWeight: 600 }}
            >
              <FaSave aria-hidden="true" />
              <span>{saving ? t('branchProfile.saving', 'Guardando...') : t('branchProfile.save', 'Guardar cambios')}</span>
            </button>

            <MenuConfiguracion />

            <div className="branch-user-profile-chip">
              <div className="branch-user-avatar">
                {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="branch-user-info-text">
                <strong className="branch-user-name">
                  {user?.nombre || 'AndrÃ©s Felipe Castro'}
                </strong>
                <span className="branch-user-role">
                  {user?.rol || 'encargado_sucursal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIO Y CONTENEDOR ESTRUCTURADO */}
        <form onSubmit={handleSubmit} noValidate className="branch-profile-form-container">
          
          {/* FILA 1: INFORMACIÃ“N GENERAL Y UBICACIÃ“N (MISMA ALTURA Y PROPORCIÃ“N) */}
          <div className="branch-profile-row-grid">
            
            {/* TARJETA 1: INFORMACIÃ“N GENERAL (DATOS Y CONTACTO) */}
            <article className="branch-profile-card branch-profile-card--equal">
              <div className="branch-profile-card-header">
                <div className="branch-profile-card-title-wrap">
                  <span className="branch-profile-card-title">
                    <FaBuilding className="branch-profile-card-icon" aria-hidden="true" />
                    {t('branchProfile.general.title', 'InformaciÃ³n general')}
                  </span>
                  <span className="branch-profile-card-desc">
                    {t('branchProfile.general.desc', 'Datos visibles para los clientes en el catÃ¡logo pÃºblico')}
                  </span>
                </div>
              </div>

              <div className="branch-profile-card-body branch-profile-card-body--stretched">
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
                  {/* DirecciÃ³n FÃ­sica (Editable, Obligatoria) */}
                  <div className="branch-profile-field">
                    <label htmlFor="branchAddress" className="branch-profile-label">
                      {t('branchProfile.fields.address', 'DirecciÃ³n')} *
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
                      placeholder="Ej. Av. El Dorado # 103-09, FontibÃ³n"
                      required
                    />
                    {errors.direccion && (
                      <span className="branch-profile-error-msg" role="alert">
                        {errors.direccion}
                      </span>
                    )}
                  </div>

                  {/* TelÃ©fono de Contacto (Editable, Opcional) */}
                  <div className="branch-profile-field">
                    <label htmlFor="branchPhone" className="branch-profile-label">
                      {t('branchProfile.fields.phone', 'TelÃ©fono')}
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
                      placeholder="Ej. +57 601 742 8900"
                    />
                    {errors.telefono && (
                      <span className="branch-profile-error-msg" role="alert">
                        {errors.telefono}
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicaciones de recogida (Editable, Textarea) */}
                <div className="branch-profile-field" style={{ marginTop: 2 }}>
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
                    rows={3}
                    maxLength={140}
                    className="branch-profile-textarea"
                    placeholder={t(
                      'branchProfile.placeholders.pickupInstructions',
                      'Frente a la salida 3 del aeropuerto - hall de entregas.'
                    )}
                    value={form.indicacionesRecogida}
                    onChange={(e) =>
                      setForm({ ...form, indicacionesRecogida: e.target.value })
                    }
                  />
                </div>
              </div>
            </article>

            {/* TARJETA 2: UBICACIÃ“N Y GOOGLE MAPS (MISMA ALTURA QUE INFORMACIÃ“N GENERAL) */}
            <article className="branch-profile-card branch-profile-card--equal">
              <div className="branch-profile-card-header">
                <div className="branch-profile-card-title-wrap">
                  <span className="branch-profile-card-title">
                    <FaMapMarkerAlt className="branch-profile-card-icon" aria-hidden="true" />
                    {t('branchProfile.location.title', 'UbicaciÃ³n')}
                  </span>
                  <span className="branch-profile-card-desc">
                    {t('branchProfile.location.desc', 'Posicionamiento satelital de la sucursal')}
                  </span>
                </div>
              </div>

              <div className="branch-profile-card-body branch-profile-card-body--stretched">
                {/* Visor interactivo de Google Maps */}
                <div className="branch-profile-map-wrap">
                  {mapIframeUrl ? (
                    <iframe
                      title={t('branchProfile.location.title', 'UbicaciÃ³n')}
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
                      <span>{t('branchProfile.location.getDirections', 'CÃ³mo llegar')}</span>
                    </a>
                  </div>
                )}
              </div>
            </article>

          </div>

          {/* FILA 2: CÃ“MO FUNCIONA LA ENTREGA SEGÃšN EL PAGO (TEXTO EXPLICATIVO COMPLETO) */}
          <article className="branch-profile-card branch-profile-card--full" style={{ marginTop: 24 }}>
            <div className="branch-profile-card-header">
              <div className="branch-profile-card-title-wrap">
                <span className="branch-profile-card-title">
                  <FaCreditCard className="branch-profile-card-icon" aria-hidden="true" />
                  {t('branchProfile.paymentAndHours.title', 'Puntos de Entrega y Horarios segÃºn el Medio de Pago')}
                </span>
                <span className="branch-profile-card-desc">
                  {t('branchProfile.paymentAndHours.desc', 'La sucursal administra mÃºltiples puntos de recogida y devoluciÃ³n segÃºn el medio de pago y el lugar de retiro seleccionado por el usuario.')}
                </span>
              </div>
            </div>

            <div className="branch-profile-card-body">
              {/* NOTA INFORMATIVA DESTACADA */}
              <div className="branch-profile-info-banner">
                <FaInfoCircle className="branch-profile-info-icon" aria-hidden="true" />
                <p className="branch-profile-info-text" dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.info', '<strong>Puntos y horarios de la sucursal:</strong> La disponibilidad del punto de recogida y devoluciÃ³n depende directamente del <strong>medio de pago</strong> y del <strong>lugar de retiro seleccionado</strong> al reservar.')}}>
                </p>
              </div>

              {/* BLOQUES EXPLICATIVOS EN TEXTO */}
              <div className="branch-payment-explanatory-grid">
                
                {/* 1. PAGO VIRTUAL CON WOMPI */}
                <div className="branch-payment-explanatory-card">
                  <div className="branch-payment-explanatory-header">
                    <div className="branch-payment-method-icon-box">
                      <FaCreditCard aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="branch-payment-explanatory-title">{t('branchProfile.paymentAndHours.onlinePayment', 'Pago Virtual con Wompi (En lÃ­nea)')}</h4>
                      <span className="branch-payment-explanatory-badge">{t('branchProfile.paymentAndHours.onlineBadge', 'MÃºltiples Puntos Habilitados')}</span>
                    </div>
                  </div>

                  <div className="branch-payment-explanatory-body">
                    <p>
                      {t('branchProfile.paymentAndHours.onlineDesc', 'Al pagar en lÃ­nea por adelantado, la sucursal habilita todos sus puntos de entrega y recogida coordinados:')}
                    </p>
                    <ul className="branch-payment-explanatory-list">
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.airportTitle', 'Aeropuerto:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.airportDesc', '<strong>24 Horas</strong> (OperaciÃ³n continua 24/7 para recepciÃ³n de vuelos y viajeros).')}} />
                      </li>
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.terminalTitle', 'Terminal de Transporte:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.terminalDesc', '<strong>24 Horas</strong> (OperaciÃ³n continua 24/7 para llegadas de transporte terrestre).')}} />
                      </li>
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.deliveryTitle', 'Entrega a Domicilio:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.deliveryDesc', '<strong>07:00 AM â€“ 07:00 PM</strong> (Lunes a SÃ¡bado), servicio puerta a puerta en la ciudad.')}} />
                      </li>
                      <li>
                        <strong>{t('branchProfile.paymentAndHours.branchTitle', 'Instalaciones de la Sucursal')} ({profile.nombre}):</strong> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.branchDesc', '<strong>08:00 AM â€“ 06:00 PM</strong> (Horario regular de atenciÃ³n de la sucursal).')}} />
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. PAGO EN EFECTIVO EN SUCURSAL */}
                <div className="branch-payment-explanatory-card branch-payment-explanatory-card--cash">
                  <div className="branch-payment-explanatory-header">
                    <div className="branch-payment-method-icon-box" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                      <FaMoneyBillWave aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="branch-payment-explanatory-title">{t('branchProfile.paymentAndHours.cashPayment', 'Pago en Efectivo (Taquilla de Sucursal)')}</h4>
                      <span className="branch-payment-explanatory-badge branch-payment-explanatory-badge--cash">{t('branchProfile.paymentAndHours.cashBadge', 'Presencial en Sucursal')}</span>
                    </div>
                  </div>

                  <div className="branch-payment-explanatory-body">
                    <p dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashDesc', 'Cuando el cliente elige pagar en efectivo, la entrega queda <strong>estrictamente condicionada a la atenciÃ³n presencial en la sucursal asignada donde se encuentra el vehÃ­culo ({branchName})</strong>:', { branchName: profile.nombre })}}>
                    </p>
                    <ul className="branch-payment-explanatory-list">
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashHoursTitle', 'Horario de caja y mostrador:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashHoursDesc', '<strong>08:00 AM â€“ 06:00 PM</strong>. El cliente debe acudir a la sucursal dentro de esta jornada para el pago presencial, arqueo de dinero en caja y firma del contrato.')}} />
                      </li>
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashNoDeliveryTitle', 'Sin entregas fuera de turno:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashNoDeliveryDesc', 'No se realizan entregas en efectivo fuera del horario de taquilla de la sucursal.')}} />
                      </li>
                      <li>
                        <strong dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashLocationTitle', 'UbicaciÃ³n Ãºnica:')}} /> <span dangerouslySetInnerHTML={{__html: t('branchProfile.paymentAndHours.cashLocationDesc', 'El cobro en efectivo solo se recibe en la sucursal fÃ­sica donde estÃ¡ inventariado el vehÃ­culo.')}} />
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* SECCIÃ“N: PLAZO DE PAGO Y EXPIRACIÃ“N AUTOMÃTICA */}
              <div className="branch-payment-deadline-section" style={{ marginTop: 14 }}>
                <div className="branch-payment-deadline-header">
                  <div className="branch-payment-deadline-icon-wrap">
                    <FaHourglassHalf className="branch-payment-deadline-icon" aria-hidden="true" />
                  </div>
                  <span className="branch-payment-deadline-title">
                    {t('branchProfile.paymentDeadline.title', 'Plazo de pago, cÃ³mputo de 24 horas y tiempo lÃ­mite de reserva')}
                  </span>
                </div>

                <div className="branch-payment-deadline-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  <p className="branch-payment-deadline-text" dangerouslySetInnerHTML={{__html: `â€¢ <strong>${t('branchProfile.paymentDeadline.rule1Title', 'CÃ¡lculo del plazo lÃ­mite de pago:')}</strong> ${t('branchProfile.paymentDeadline.rule1Desc', 'Si la reserva se realiza con anticipaciÃ³n suficiente, el cliente cuenta con hasta <strong>72 horas</strong> para completar el pago (virtual con Wompi o presencial en efectivo en sucursal). Si la reserva es para el mismo dÃ­a o con menor antelaciÃ³n, el sistema <strong>calcula dinÃ¡micamente las horas disponibles segÃºn la hora exacta de retiro seleccionada</strong> antes del viaje.')}`}}>
                  </p>
                  <p className="branch-payment-deadline-text" dangerouslySetInnerHTML={{__html: `â€¢ <strong>${t('branchProfile.paymentDeadline.rule2Title', 'CÃ³mputo de 24 horas por dÃ­a de alquiler:')}</strong> ${t('branchProfile.paymentDeadline.rule2Desc', 'Cada dÃ­a de reserva cuenta con una duraciÃ³n exacta de <strong>24 horas</strong>, y el ciclo de alquiler comienza a regir a partir de la <strong>hora exacta de retiro que el cliente selecciona</strong> en el calendario.')}`}}>
                  </p>
                  <p className="branch-payment-deadline-text" dangerouslySetInnerHTML={{__html: `â€¢ <strong>${t('branchProfile.paymentDeadline.rule3Title', 'CancelaciÃ³n y liberaciÃ³n automÃ¡tica:')}</strong> ${t('branchProfile.paymentDeadline.rule3Desc', 'En caso de que no se registre el pago dentro del tiempo lÃ­mite calculado por el sistema, la reserva se cancela automÃ¡ticamente y el vehÃ­culo queda liberado de inmediato en el catÃ¡logo para otros usuarios.')}`}}>
                  </p>
                </div>
              </div>
            </div>
          </article>
        </form>
      </main>
    </div>
  )
}
