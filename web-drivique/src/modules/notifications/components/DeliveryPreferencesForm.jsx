import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEnvelope, FaBell, FaLaptop, FaBullhorn, FaSave, FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaSpinner } from 'react-icons/fa'
import { userService } from '@/services/userService'
import './DeliveryPreferencesForm.css'

export default function DeliveryPreferencesForm({ onGuardadoExitoso }) {
  const { t } = useTranslation()

  const [preferencias, setPreferencias] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    marketingNotifications: false,
  })

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [error, setError] = useState(null)
  const [cambiosPendientes, setCambiosPendientes] = useState(false)

  // Cargar preferencias iniciales del backend
  useEffect(() => {
    let montado = true
    const cargar = async () => {
      setCargando(true)
      setError(null)
      try {
        const data = await userService.getPreferences()
        if (montado && data) {
          setPreferencias({
            emailNotifications: Boolean(data.emailNotifications),
            smsNotifications: Boolean(data.smsNotifications),
            pushNotifications: Boolean(data.pushNotifications),
            inAppNotifications: Boolean(data.inAppNotifications),
            marketingNotifications: Boolean(data.marketingNotifications),
          })
        }
      } catch (err) {
        console.warn('Error al cargar preferencias del usuario:', err)
        if (montado) {
          setError(
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            t('notificaciones.prefErrorCarga', 'No se pudieron cargar tus preferencias de entrega.')
          )
        }
      } finally {
        if (montado) setCargando(false)
      }
    }

    cargar()
    return () => {
      montado = false
    }
  }, [t])

  const togglePreferencia = (campo) => {
    setPreferencias((prev) => {
      const nuevo = { ...prev, [campo]: !prev[campo] }
      setCambiosPendientes(true)
      setMensajeExito('')
      return nuevo
    })
  }

  const handleGuardar = async (e) => {
    if (e) e.preventDefault()
    setGuardando(true)
    setError(null)
    setMensajeExito('')

    try {
      const res = await userService.updatePreferences(preferencias)
      setCambiosPendientes(false)
      setMensajeExito(
        t('notificaciones.prefGuardadoExito', 'Tus preferencias de notificación se guardaron con éxito.')
      )
      if (onGuardadoExitoso) onGuardadoExitoso(res || preferencias)
    } catch (err) {
      console.error('Error al guardar preferencias de notificación:', err)
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        t('notificaciones.prefErrorGuardar', 'Ocurrió un error al guardar tus preferencias.')
      )
    } finally {
      setGuardando(false)
    }
  }

  const canales = [
    {
      id: 'emailNotifications',
      titulo: t('notificaciones.canales.emailTitulo', 'Correo electrónico'),
      descripcion: t(
        'notificaciones.canales.emailDesc',
        t('hc2.recibe_confirmaciones_de_reservas_cont', 'Recibe confirmaciones de reservas, contratos digitales, facturas y alertas críticas en tu buzón.')
      ),
      icono: <FaEnvelope />,
      colorIcono: 'var(--brand-primary)',
      bgIcono: 'rgba(var(--brand-primary-rgb), 0.1)',
    },
    {
      id: 'pushNotifications',
      titulo: t('notificaciones.canales.pushTitulo', 'Notificaciones Push Móviles'),
      descripcion: t(
        'notificaciones.canales.pushDesc',
        t('hc2.alertas_instantaneas_en_tu_dispositivo', 'Alertas instantáneas en tu dispositivo móvil sobre el estado de tu alquiler en tiempo real.')
      ),
      icono: <FaBell />,
      colorIcono: '#8b5cf6',
      bgIcono: 'rgba(139, 92, 246, 0.1)',
    },
    {
      id: 'inAppNotifications',
      titulo: t('notificaciones.canales.inAppTitulo', 'Notificaciones en Plataforma Web'),
      descripcion: t(
        'notificaciones.canales.inAppDesc',
        t('hc2.muestra_alertas_en_la_bandeja_de_entra', 'Muestra alertas en la bandeja de entrada y el badge del contador de la barra de navegación.')
      ),
      icono: <FaLaptop />,
      colorIcono: 'var(--brand-primary)',
      bgIcono: 'rgba(2, 132, 199, 0.1)',
    },
    {
      id: 'marketingNotifications',
      titulo: t('notificaciones.canales.marketingTitulo', 'Promociones y Ofertas Comerciales'),
      descripcion: t(
        'notificaciones.canales.marketingDesc',
        t('hc2.consentimiento_para_recibir_cupones_de', 'Consentimiento para recibir cupones de descuento, promociones exclusivas y lanzamientos de flota.')
      ),
      icono: <FaBullhorn />,
      colorIcono: '#f59e0b',
      bgIcono: 'rgba(245, 158, 11, 0.1)',
      esConsentimiento: true,
    },
  ]

  if (cargando) {
    return (
      <div className="pref-loading-box">
        <FaSpinner className="pref-spinner" />
        <p>{t('notificaciones.cargandoPreferencias', 'Cargando preferencias de entrega...')}</p>
      </div>
    )
  }

  return (
    <div className="pref-container-card">
      <div className="pref-header-info">
        <div className="pref-header-title-row">
          <FaShieldAlt className="pref-shield-icon" />
          <div>
            <h3>{t('notificaciones.prefTitulo', 'Preferencias de Entrega y Canales')}</h3>
            <p>
              {t(
                'notificaciones.prefSubtitulo',
                t('hc2.elige_por_que_canales_deseas_recibir_n', 'Elige por qué canales deseas recibir notificaciones. Las alertas de alta criticidad (seguridad y pagos) se envían siempre.')
              )}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="pref-alert error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {mensajeExito && (
        <div className="pref-alert success">
          <FaCheckCircle />
          <span>{mensajeExito}</span>
        </div>
      )}

      <div className="pref-canales-list">
        {canales.map((canal) => {
          const activo = Boolean(preferencias[canal.id])
          return (
            <div
              key={canal.id}
              className={`pref-canal-row ${activo ? 'activo' : ''} ${canal.esConsentimiento ? 'consentimiento' : ''}`}
              onClick={() => togglePreferencia(canal.id)}
            >
              <div
                className="pref-canal-icon-wrap"
                style={{ color: canal.colorIcono, background: canal.bgIcono }}
              >
                {canal.icono}
              </div>

              <div className="pref-canal-text">
                <div className="pref-canal-nombre-row">
                  <h4>{canal.titulo}</h4>
                  {canal.esConsentimiento && (
                    <span className="pref-tag-consentimiento">{t('hc4.consentimiento', 'Consentimiento')}</span>
                  )}
                </div>
                <p>{canal.descripcion}</p>
              </div>

              <div className="pref-switch-wrap" onClick={(e) => e.stopPropagation()}>
                <label className="pref-switch">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => togglePreferencia(canal.id)}
                  />
                  <span className="pref-slider" />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pref-footer-actions">
        <span className="pref-cambios-indicator">
          {cambiosPendientes
            ? t('notificaciones.cambiosPendientes', 'Tienes cambios pendientes sin guardar.')
            : t('notificaciones.todoAlDia', 'Tus preferencias están sincronizadas con el servidor.')}
        </span>

        <button
          type="button"
          className="btn-guardar-preferencias"
          onClick={handleGuardar}
          disabled={guardando || !cambiosPendientes}
        >
          {guardando ? (
            <>
              <FaSpinner className="pref-spinner" />
              <span>{t('comun.guardando', 'Guardando...')}</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>{t('notificaciones.guardarPreferencias', 'Guardar preferencias')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
