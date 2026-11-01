import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaLock, FaBuilding, FaExclamationTriangle, FaUndo, FaSave } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchProfile } from '../../../hooks/useBranchProfile'
import { showAlert } from '../../../utils/swalConfig'
import ManagementSidebar from '../components/ManagementSidebar'
import BranchLocationMapCard from '../components/BranchLocationMapCard'
import BranchPaymentAndHoursCard from '../components/BranchPaymentAndHoursCard'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import './BranchProfilePage.css'

const CITY_COORDINATES = {
  bogota: { lat: 4.6558, lng: -74.0573 },
  medellin: { lat: 6.2088, lng: -75.5683 },
  barranquilla: { lat: 11.0069, lng: -74.8194 },
  cali: { lat: 3.4682, lng: -76.5298 },
  cartagena: { lat: 10.4072, lng: -75.5562 },
}

export default function BranchProfilePage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)

  const {
    profile,
    loading,
    saving,
    saveBranchProfile,
  } = useBranchProfile(user)

  const [form, setForm] = useState({
    direccion: '',
    telefono: '',
    indicacionesRecogida: '',
    latitud: '',
    longitud: '',
  })

  const [originalForm, setOriginalForm] = useState({
    direccion: '',
    telefono: '',
    indicacionesRecogida: '',
    latitud: '',
    longitud: '',
  })

  const [errors, setErrors] = useState({})

  const addressRef = useRef(null)
  const phoneRef = useRef(null)
  const latRef = useRef(null)
  const lngRef = useRef(null)

  useEffect(() => {
    if (profile) {
      const cityKey = String(profile.ciudad || '').trim().toLowerCase()
      const fallbackCoord = CITY_COORDINATES[cityKey] || { lat: 4.6558, lng: -74.0573 }
      const latVal = profile.latitud != null && String(profile.latitud).trim() !== ''
        ? String(profile.latitud)
        : String(fallbackCoord.lat)
      const lngVal = profile.longitud != null && String(profile.longitud).trim() !== ''
        ? String(profile.longitud)
        : String(fallbackCoord.lng)

      const initial = {
        direccion: profile.direccion || '',
        telefono: profile.telefono || '',
        indicacionesRecogida: profile.indicacionesRecogida || '',
        latitud: latVal,
        longitud: lngVal,
      }
      setForm(initial)
      setOriginalForm(initial)
      setErrors({})
    }
  }, [profile])

  const hasUnsavedChanges = useMemo(() => {
    return (
      form.direccion !== originalForm.direccion ||
      form.telefono !== originalForm.telefono ||
      form.indicacionesRecogida !== originalForm.indicacionesRecogida ||
      form.latitud !== originalForm.latitud ||
      form.longitud !== originalForm.longitud
    )
  }, [form, originalForm])

  const validateForm = () => {
    const errs = {}

    if (!form.direccion.trim()) {
      errs.direccion = t('branchProfile.errors.addressRequired', 'La dirección es obligatoria.')
    }

    if (form.telefono.trim()) {
      const digitsOnly = form.telefono.replace(/[^\d]/g, '')
      const validChars = /^[0-9\s+-]+$/.test(form.telefono)
      if (!validChars || digitsOnly.length < 7 || digitsOnly.length > 13) {
        errs.telefono = t(
          'branchProfile.errors.phoneInvalid',
          t('hc2.el_telefono_debe_contener_entre_7_y_13', 'El teléfono debe contener entre 7 y 13 dígitos.')
        )
      }
    }

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
            t('hc2.la_latitud_debe_estar_entre_90_y_90', 'La latitud debe estar entre -90 y 90.')
          )
        }
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
          errs.longitud = t(
            'branchProfile.errors.lngInvalid',
            t('hc2.la_longitud_debe_estar_entre_180_y_180', 'La longitud debe estar entre -180 y 180.')
          )
        }
      }
    }

    setErrors(errs)

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

  const handleCancel = () => {
    setForm({ ...originalForm })
    setErrors({})
  }

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
            t('hc2.los_datos_de_la_sucursal_han_sido_actu', 'Los datos de la sucursal han sido actualizados con éxito.')
          ),
          confirmButtonText: t('common.accept', 'Aceptar'),
        })
      })
      .catch((err) => {
        console.error('Error guardando sucursal:', err)
      })
  }

  const isValidMapCoord =
    !isNaN(parseFloat(form.latitud)) &&
    !isNaN(parseFloat(form.longitud)) &&
    parseFloat(form.latitud) >= -90 &&
    parseFloat(form.latitud) <= 90 &&
    parseFloat(form.longitud) >= -180 &&
    parseFloat(form.longitud) <= 180

  const cityKeyForMap = String(profile?.ciudad || '').trim().toLowerCase()
  const fallbackCoordForMap = CITY_COORDINATES[cityKeyForMap] || { lat: 4.6558, lng: -74.0573 }

  const curLat = isValidMapCoord ? parseFloat(form.latitud) : fallbackCoordForMap.lat
  const curLng = isValidMapCoord ? parseFloat(form.longitud) : fallbackCoordForMap.lng

  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(curLng - 0.008).toFixed(5)}%2C${(curLat - 0.008).toFixed(5)}%2C${(curLng + 0.008).toFixed(5)}%2C${(curLat + 0.008).toFixed(5)}&layer=mapnik&marker=${curLat}%2C${curLng}`

  const googleMapsExternalUrl = `https://www.google.com/maps?q=${curLat},${curLng}`

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

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={true} />

      <main className="management-main branch-profile-main">
        <div className="branch-topbar">
          <div className="branch-topbar-brand-title">
            <span className="branch-topbar-badge">{t('branchProfile.managementBadge', 'Gestión de Sucursal')}</span>
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
              title={t('hc.guardar_informacion_editada', 'Guardar información editada')}
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
                  {user?.nombre || 'Andrés Felipe Castro'}
                </strong>
                <span className="branch-user-role">
                  {user?.rol || 'encargado_sucursal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="branch-profile-form-container">
          <div className="branch-profile-row-grid">
            <article className="branch-profile-card branch-profile-card--equal">
              <div className="branch-profile-card-header">
                <div className="branch-profile-card-title-wrap">
                  <span className="branch-profile-card-title">
                    <FaBuilding className="branch-profile-card-icon" aria-hidden="true" />
                    {t('branchProfile.general.title', 'Información general')}
                  </span>
                  <span className="branch-profile-card-desc">
                    {t('branchProfile.general.desc', 'Datos visibles para los clientes en el catálogo público')}
                  </span>
                </div>
              </div>

              <div className="branch-profile-card-body branch-profile-card-body--stretched">
                <div className="branch-profile-fields-row">
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
                      placeholder={t('hc.ej_av_el_dorado_103_09_fontibon', 'Ej. Av. El Dorado # 103-09, Fontibón')}
                      required
                    />
                    {errors.direccion && (
                      <span className="branch-profile-error-msg" role="alert">
                        {errors.direccion}
                      </span>
                    )}
                  </div>

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
                      placeholder="Ej. +57 601 742 8900"
                    />
                    {errors.telefono && (
                      <span className="branch-profile-error-msg" role="alert">
                        {errors.telefono}
                      </span>
                    )}
                  </div>
                </div>

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
                      t('hc2.frente_a_la_salida_3_del_aeropuerto_ha', 'Frente a la salida 3 del aeropuerto - hall de entregas.')
                    )}
                    value={form.indicacionesRecogida}
                    onChange={(e) =>
                      setForm({ ...form, indicacionesRecogida: e.target.value })
                    }
                  />
                </div>
              </div>
            </article>

            <BranchLocationMapCard
              mapIframeUrl={mapIframeUrl}
              googleMapsExternalUrl={googleMapsExternalUrl}
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
              latRef={latRef}
              lngRef={lngRef}
            />
          </div>

          <BranchPaymentAndHoursCard branchName={profile.nombre} />
        </form>
      </main>
    </div>
  )
}
