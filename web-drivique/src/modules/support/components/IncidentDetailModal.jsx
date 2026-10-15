import { useCallback, useEffect, useRef, useState } from 'react'
import { FaTimes, FaPaperclip, FaPaperPlane, FaClock, FaUserCog } from 'react-icons/fa'
import { incidentService } from '@/services/incidentService'
import { useAuthStore } from '@/store/authStore'
import {
  PRIORITY, STATUS, TRANSITION_LABEL, categoryLabel, formatDateTime, formatSize, validateFiles,
} from '../lib/incidentLabels'

const pill = (palette) => ({
  display: 'inline-block', background: palette.bg, color: palette.color, padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 800,
})

const box = { background: 'var(--bg-item, #f8fafc)', border: '1px solid var(--borde, #e2e8f0)', borderRadius: 14, padding: 14 }

function AttachmentList({ incidentId, items }) {
  const [error, setError] = useState('')
  if (!items?.length) return null
  const open = async (item) => {
    try {
      setError('')
      const url = await incidentService.attachmentUrl(incidentId, item.id)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => open(item)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--borde, #e2e8f0)', background: 'var(--bg-tarjeta, #fff)', borderRadius: 10, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--texto-primary, #0f172a)' }}>
          <FaPaperclip /> {item.originalName} <span style={{ opacity: 0.6 }}>({formatSize(item.sizeBytes)})</span>
        </button>
      ))}
      {error && <span style={{ color: '#b91c1c', fontSize: 12 }}>{error}</span>}
    </div>
  )
}

/**
 * Detalle de una incidencia con historial completo, adjuntos privados, respuestas y cambios de estado.
 * mode: 'customer' (propietario) o 'staff' (personal de la sede).
 */
export default function IncidentDetailModal({ incidentId, mode = 'customer', onClose, onChanged }) {
  const usuario = useAuthStore((state) => state.usuario)
  const [incident, setIncident] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  const load = useCallback(async () => {
    try {
      setIncident(await incidentService.detail(incidentId))
    } catch (e) {
      setError(e.message)
    }
  }, [incidentId])

  useEffect(() => { if (incidentId) load() }, [incidentId, load])

  if (!incidentId) return null

  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      const updated = await action()
      setIncident(updated)
      onChanged?.(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const send = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    run(async () => {
      const updated = await incidentService.respond(incidentId, message.trim(), files)
      setMessage('')
      setFiles([])
      return updated
    })
  }

  const pickFiles = (event) => {
    const result = validateFiles(files, [...event.target.files])
    event.target.value = ''
    if (result.error) setError(result.error)
    else { setError(''); setFiles(result.files) }
  }

  const transitions = incident?.allowedTransitions || []
  const labels = mode === 'staff' ? TRANSITION_LABEL.staff : TRANSITION_LABEL.customer
  const canAssignToMe = mode === 'staff' && incident && incident.status !== 'CLOSED' && incident.assignedToId !== usuario?.id

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-tarjeta, #fff)', color: 'var(--texto-primary, #0f172a)', borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7 }}>{incident?.code}</div>
            <h2 style={{ margin: '2px 0 8px', fontSize: 20 }}>{incident?.subject || 'Cargando...'}</h2>
            {incident && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={pill(STATUS[incident.status])}>{STATUS[incident.status]?.label}</span>
                <span style={pill(PRIORITY[incident.priority])}>Prioridad {PRIORITY[incident.priority]?.label}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>{categoryLabel(incident.category)}</span>
                {incident.slaDueAt && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
                  <span style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, color: incident.slaBreached ? '#b91c1c' : 'inherit' }}>
                    <FaClock /> {incident.slaBreached ? 'Atención vencida desde' : 'Atención estimada antes de'} {formatDateTime(incident.slaDueAt)}
                  </span>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: 'inherit' }}><FaTimes /></button>
        </div>

        {error && <p style={{ background: '#fef2f2', color: '#991b1b', borderRadius: 10, padding: '8px 12px', fontSize: 13, marginTop: 12 }}>{error}</p>}

        {incident && (
          <>
            <div style={{ ...box, marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
              {mode === 'staff' && <div><strong>Cliente:</strong> {incident.reporterName}<br />{incident.reporterEmail}</div>}
              {incident.reservationCode && <div><strong>Reserva:</strong> {incident.reservationCode}</div>}
              {incident.vehiclePlate && <div><strong>Vehículo:</strong> {incident.vehicleModel} ({incident.vehiclePlate})</div>}
              {incident.branchName && <div><strong>Sede:</strong> {incident.branchName}</div>}
              <div><strong>Atiende:</strong> {incident.assignedToName || 'Sin asignar'}</div>
              <div><strong>Creada:</strong> {formatDateTime(incident.createdAt)}</div>
            </div>

            <div style={{ ...box, marginTop: 12 }}>
              <strong style={{ fontSize: 13 }}>Descripción</strong>
              <p style={{ margin: '6px 0 0', fontSize: 14, whiteSpace: 'pre-wrap' }}>{incident.description}</p>
              <AttachmentList incidentId={incident.id} items={incident.attachments} />
            </div>

            <h3 style={{ fontSize: 15, margin: '18px 0 8px' }}>Historial</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {incident.timeline.map((entry, index) => {
                const customer = entry.authorRole === 'CUSTOMER'
                if (entry.type === 'MESSAGE') {
                  return (
                    <div key={index} style={{ alignSelf: customer ? 'flex-start' : 'flex-end', maxWidth: '88%', ...box, background: customer ? 'var(--bg-item, #f8fafc)' : 'var(--brand-soft, #eff6ff)' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7 }}>{entry.authorName} · {customer ? 'Cliente' : 'Equipo Drivique'} · {formatDateTime(entry.createdAt)}</div>
                      <p style={{ margin: '4px 0 0', fontSize: 14, whiteSpace: 'pre-wrap' }}>{entry.message}</p>
                      <AttachmentList incidentId={incident.id} items={entry.attachments} />
                    </div>
                  )
                }
                const text = entry.type === 'ASSIGNMENT'
                  ? entry.message
                  : `Estado: ${STATUS[entry.fromStatus]?.label ? `${STATUS[entry.fromStatus].label} → ` : ''}${STATUS[entry.toStatus]?.label || entry.toStatus}${entry.message ? ` — ${entry.message}` : ''}`
                return (
                  <div key={index} style={{ textAlign: 'center', fontSize: 12, opacity: 0.75 }}>
                    {text} · {entry.authorName} · {formatDateTime(entry.createdAt)}
                  </div>
                )
              })}
            </div>

            {(transitions.length > 0 || canAssignToMe) && (
              <div style={{ ...box, marginTop: 16 }}>
                {mode === 'staff' && transitions.length > 0 && (
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota para el cliente (opcional)" maxLength={2000}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--borde, #e2e8f0)', marginBottom: 10, background: 'var(--bg-tarjeta, #fff)', color: 'inherit' }} />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {canAssignToMe && (
                    <button type="button" disabled={busy} onClick={() => run(() => incidentService.assign(incident.id))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--borde, #cbd5e1)', background: 'var(--bg-tarjeta, #fff)', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}>
                      <FaUserCog /> Asignarme
                    </button>
                  )}
                  {transitions.map((target) => (
                    <button key={target} type="button" disabled={busy}
                      onClick={() => run(async () => { const updated = await incidentService.changeStatus(incident.id, target, note); setNote(''); return updated })}
                      style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'var(--brand-primary, #2563eb)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                      {labels[`${incident.status}>${target}`] || STATUS[target]?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {incident.status !== 'CLOSED' && (
              <form onSubmit={send} style={{ marginTop: 16 }}>
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe un mensaje..."
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)', background: 'var(--bg-tarjeta, #fff)', color: 'inherit', resize: 'vertical' }} />
                {files.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, fontSize: 12 }}>
                    {files.map((f, i) => (
                      <span key={i} style={{ border: '1px solid var(--borde, #e2e8f0)', borderRadius: 8, padding: '3px 8px' }}>
                        {f.name} <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c' }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <button type="button" onClick={() => fileInput.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px dashed var(--borde, #cbd5e1)', background: 'transparent', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'inherit' }}>
                    <FaPaperclip /> Adjuntar (JPG, PNG o PDF, máx. 5 MB)
                  </button>
                  <input ref={fileInput} type="file" accept="image/jpeg,image/png,application/pdf" multiple hidden onChange={pickFiles} />
                  <button type="submit" disabled={busy || !message.trim()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'var(--brand-primary, #2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: busy || !message.trim() ? 0.6 : 1 }}>
                    <FaPaperPlane /> Enviar
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
