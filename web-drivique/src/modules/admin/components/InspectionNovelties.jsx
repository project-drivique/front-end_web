import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaClipboardCheck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { api } from '../../../services/httpClient'
import { inspectionService } from '../../../services/inspectionService'

const LOCALES = { es: 'es-CO', en: 'en-US', pt: 'pt-PT', br: 'pt-BR', fr: 'fr-FR' }

const fecha = (iso, language) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(LOCALES[language] || 'es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function Evidence({ contractId, answer }) {
  const { t } = useTranslation()
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (!answer.evidencePhotoUrl) return undefined
    let url = ''
    let active = true
    api.get(`/contracts/${contractId}/inspections/evidence/${answer.id}`, { responseType: 'blob' })
      .then(({ data }) => {
        if (!active) return
        url = URL.createObjectURL(new Blob([data], { type: data.type || 'image/jpeg' }))
        setSrc(url)
      })
      .catch(() => { if (active) setSrc('') })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [contractId, answer.id, answer.evidencePhotoUrl])

  if (!answer.evidencePhotoUrl) return null
  if (!src) return <div style={{ fontSize: 12, color: 'var(--city-muted, #64748b)' }}>{t('admin.inspection.loadingPhoto', 'Cargando fotografía…')}</div>
  return (
    <a href={src} target="_blank" rel="noreferrer" title={t('admin.inspection.openPhoto', 'Abrir fotografía')}>
      <img src={src} alt={t('admin.inspection.evidenceOf', { defaultValue: 'Evidencia: {{item}}', item: answer.checklistItemName })} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--borde, #e2e8f0)' }} />
    </a>
  )
}

/** Novedades registradas por el encargado en la entrega y la devolución de una reserva (datos del servidor). */
export default function InspectionNovelties({ reserva, formatMoney }) {
  const { t, i18n } = useTranslation()
  const TYPE_LABEL = { CHECK_IN: t('admin.inspection.checkIn', 'Entrega del vehículo'), CHECK_OUT: t('admin.inspection.checkOut', 'Devolución del vehículo') }
  const [state, setState] = useState({ loading: true, contractId: null, inspections: [], error: '' })

  useEffect(() => {
    let active = true
    const reservationId = reserva?.id
    if (!reservationId) { setState({ loading: false, contractId: null, inspections: [], error: '' }); return undefined }
    setState({ loading: true, contractId: null, inspections: [], error: '' })
    ;(async () => {
      try {
        let contract = null
        try {
          contract = (await api.get(`/contracts/reservation/${reservationId}`)).data
        } catch (err) {
          if (err?.response?.status !== 404) throw err
        }
        const inspections = contract?.id ? await inspectionService.list(contract.id) : []
        if (active) setState({ loading: false, contractId: contract?.id || null, inspections: Array.isArray(inspections) ? inspections : [], error: '' })
      } catch {
        if (active) setState({ loading: false, contractId: null, inspections: [], error: 'LOAD_ERROR' })
      }
    })()
    return () => { active = false }
  }, [reserva?.id])

  const ordered = [...state.inspections].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))

  return (
    <div id="novedades-inspeccion" className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)', marginTop: 16 }}>
      <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaClipboardCheck /> {t('admin.inspection.sectionTitle', 'Novedades de entrega y devolución')}
      </h4>

      {state.loading && <p style={{ margin: 0, fontSize: 13, color: 'var(--city-muted, #64748b)' }}>{t('admin.inspection.loading', 'Cargando…')}</p>}
      {!state.loading && state.error && <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>{state.error === 'LOAD_ERROR' ? t('admin.inspection.loadError', 'No se pudieron cargar las novedades.') : state.error}</p>}
      {!state.loading && !state.error && ordered.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--city-muted, #64748b)' }}>{t('admin.inspection.notDelivered', 'Aún no se ha registrado la entrega del vehículo.')}</p>
      )}

      {ordered.map((inspection) => {
        const novelties = (inspection.answers || []).filter((a) => !a.compliant)
        return (
          <div key={inspection.id} style={{ border: '1px solid var(--borde, #e2e8f0)', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              <strong style={{ fontSize: 13.5 }}>{TYPE_LABEL[inspection.inspectionType] || inspection.inspectionType}</strong>
              <span style={{ fontSize: 12, color: 'var(--city-muted, #64748b)' }}>
                {fecha(inspection.createdAt, i18n.language)} · {inspection.mileage} km · {t('admin.inspection.fuelShort', 'combustible')} {Number(inspection.fuelLevelPercent)}%
              </span>
            </div>

            {novelties.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCheckCircle /> {t('admin.inspection.none', 'Sin novedades: todos los ítems conformes.')}
              </p>
            ) : (
              novelties.map((answer) => (
                <div key={answer.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderTop: '1px dashed var(--borde, #e2e8f0)' }}>
                  <FaExclamationTriangle style={{ color: '#dc2626', marginTop: 3, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 13 }}>{answer.checklistItemName}</strong>
                    <p style={{ margin: '2px 0 8px', fontSize: 13, color: 'var(--city-text, var(--texto-primary))' }}>{answer.observation}</p>
                    <Evidence contractId={state.contractId} answer={answer} />
                  </div>
                </div>
              ))
            )}

            {inspection.observations && (
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--city-muted, #64748b)' }}>
                <strong>{t('admin.inspection.generalObsShort', 'Observaciones generales:')}</strong> {inspection.observations}
              </p>
            )}
            {Number(inspection.totalCharge) > 0 && (
              <p style={{ margin: '6px 0 0', fontSize: 12.5, fontWeight: 700 }}>{t('admin.inspection.extraCharges', 'Cargos adicionales:')} {formatMoney ? formatMoney(Number(inspection.totalCharge)) : Number(inspection.totalCharge).toLocaleString('es-CO')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
