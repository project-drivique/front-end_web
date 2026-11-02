import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { showAlert } from '@/utils/swalConfig'
import { FaTimes, FaStar, FaCar, FaMapMarkerAlt } from 'react-icons/fa'
import Estrellas from './Estrellas'

export default function ModalValoracion({ reserva, onClose, onSave, onSaveSucursal }) {
  const { t } = useTranslation()
  const [estrellas, setEstrellas] = useState(reserva.valoracion?.estrellas || 0)
  const [comentario, setComentario] = useState(reserva.valoracion?.comentario || '')
  const [guardando, setGuardando] = useState(false)
  const [estrellasSucursal, setEstrellasSucursal] = useState(0)
  const [comentarioSucursal, setComentarioSucursal] = useState('')
  const [vehiculoGuardado, setVehiculoGuardado] = useState(false)

  const vehiculoNombre = reserva.vehiculo?.nombre || reserva.vehiculoNombre || t('hc2.este_vehiculo', 'este vehículo')
  const mostrarVehiculo = !vehiculoGuardado && !reserva.valoracion && (!reserva.eligibility || reserva.eligibility.canReviewVehicle)
  const sucursalId = reserva.eligibility?.canReviewBranch ? reserva.eligibility.branchId : null
  const sucursalNombre = reserva.eligibility?.branchName || ''
  const hayAlgoQueEnviar = (mostrarVehiculo && estrellas > 0) || (sucursalId && estrellasSucursal > 0)

  const guardar = async () => {
    if (!hayAlgoQueEnviar) return
    setGuardando(true)
    try {
      if (mostrarVehiculo && estrellas > 0) {
        await onSave(reserva.id, {
          estrellas,
          comentario: comentario.trim()
        })
        setVehiculoGuardado(true)
      }
      if (sucursalId && estrellasSucursal > 0) {
        await onSaveSucursal(reserva.id, sucursalId, {
          estrellas: estrellasSucursal,
          comentario: comentarioSucursal.trim()
        })
      }
      await showAlert({
        icon: 'success',
        title: t('reservas.reviewThanksTitle', '¡Gracias por tu reseña!'),
        text: t('reservas.reviewThanksText', 'Tu opinión quedó registrada con éxito y nos ayuda a mejorar.'),
        confirmButtonText: t('common.accept', 'Aceptar')
      })
      onClose()
    } catch (error) {
      showAlert({
        icon: 'error',
        title: t('common.error', 'Error'),
        text: error?.response?.data?.detail || error?.response?.data?.message || t('reservas.reviewSaveError', 'No fue posible publicar la reseña.')
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-backdrop minimal-modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel minimal-modal-panel valo-panel" role="dialog" aria-modal="true" aria-labelledby="titulo-valoracion" style={{ maxHeight: '92vh', overflowY: 'auto' }} onMouseDown={e => e.stopPropagation()}>
        <button className="minimal-close-btn" onClick={onClose} aria-label={t('reservas.close', { defaultValue: 'Cerrar' })}>
          <FaTimes />
        </button>

        <div className="valo-hero">
          <span className="valo-hero-icon"><FaStar /></span>
          <h2 id="titulo-valoracion" className="minimal-title">
            {t('reservas.howWasTrip', { defaultValue: '¿Cómo estuvo tu viaje?' })}
          </h2>
          <p className="minimal-subtitle">
            {t('reservas.rateExperience', { defaultValue: `Califica tu experiencia con ${vehiculoNombre}.`, vehicle: vehiculoNombre })}
          </p>
        </div>

        <div className="valo-body">
          {mostrarVehiculo && (
            <div className="valo-card">
              <div className="valo-card-head">
                <span className="valo-card-icon"><FaCar /></span>
                <div>
                  <strong>{t('reservas.vehicleReviewTitle', { defaultValue: 'Tu experiencia con el vehículo' })}</strong>
                  <small>{vehiculoNombre}</small>
                </div>
              </div>

              <Estrellas value={estrellas} onChange={setEstrellas} />

              {/* Sección de Comentario Libre */}
              <div className="minimal-textarea-group">
                <div className="minimal-group-head">
                  <label className="minimal-label" htmlFor="comentario">
                    {t('reservas.tellMore', { defaultValue: 'Comentario' })} <span>({t('reservas.optional', { defaultValue: 'opcional' })})</span>
                  </label>
                  <span className="minimal-counter">{comentario.length}/400</span>
                </div>
                <textarea
                  id="comentario"
                  maxLength={400}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  placeholder={t('reservas.commentPlaceholder', { defaultValue: '¿Qué tal estuvo el estado del vehículo, la limpieza o el servicio?' })}
                  className="minimal-textarea"
                />
              </div>
            </div>
          )}

          {sucursalId && (
            <div className="valo-card">
              <div className="valo-card-head">
                <span className="valo-card-icon"><FaMapMarkerAlt /></span>
                <div>
                  <strong>{t('reservas.branchReviewTitle', { defaultValue: 'Cuéntanos tu experiencia en la sucursal' })}</strong>
                  <small>{sucursalNombre}</small>
                </div>
              </div>

              <Estrellas value={estrellasSucursal} onChange={setEstrellasSucursal} />

              <div className="minimal-textarea-group">
                <div className="minimal-group-head">
                  <label className="minimal-label" htmlFor="comentario-sucursal">
                    {t('reservas.branchTellMore', { defaultValue: 'Tu reseña' })} <span>({t('reservas.optional', { defaultValue: 'opcional' })})</span>
                  </label>
                  <span className="minimal-counter">{comentarioSucursal.length}/400</span>
                </div>
                <textarea
                  id="comentario-sucursal"
                  maxLength={400}
                  value={comentarioSucursal}
                  onChange={e => setComentarioSucursal(e.target.value)}
                  placeholder={t('reservas.branchCommentPlaceholder', { defaultValue: '¿Cómo fue la atención, la entrega y la devolución del vehículo?' })}
                  className="minimal-textarea"
                />
              </div>
            </div>
          )}

          <button className="minimal-submit-btn" disabled={!hayAlgoQueEnviar || guardando} onClick={guardar}>
            {guardando
              ? t('reservas.saving', { defaultValue: 'Guardando...' })
              : t('reservas.publishRating', { defaultValue: 'Publicar valoración' })}
          </button>
        </div>
      </section>
    </div>
  )
}
