import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FaCamera, FaClipboardCheck, FaTimes, FaTrashAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const S = {
  overlay: { position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' },
  card: { position: 'relative', width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 16, background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', boxShadow: '0 12px 30px rgba(0,0,0,0.35)', boxSizing: 'border-box', overflow: 'hidden' },
  header: { padding: '20px 22px 12px', display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-text, var(--texto-acento))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--texto-primary)' },
  subtitle: { margin: '2px 0 0', fontSize: 12.5, color: 'var(--texto-second)' },
  close: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--texto-second)', display: 'flex' },
  body: { padding: '4px 22px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--texto-second)', marginBottom: 5 },
  input: { width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', borderRadius: 10, border: '1.5px solid var(--borde)', background: 'var(--bg-tarjeta)', color: 'var(--texto-primary)', fontSize: 14, outline: 'none' },
  textarea: { width: '100%', boxSizing: 'border-box', minHeight: 64, padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--borde)', background: 'var(--bg-tarjeta)', color: 'var(--texto-primary)', fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  section: { fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--texto-second)', margin: '4px 0 0' },
  item: { border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 },
  itemTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  itemName: { fontSize: 13.5, fontWeight: 600, color: 'var(--texto-primary)' },
  toggle: { display: 'inline-flex', borderRadius: 999, border: '1.5px solid var(--borde)', overflow: 'hidden', flexShrink: 0 },
  error: { margin: 0, fontSize: 12.5, fontWeight: 600, color: '#dc2626' },
  photoBox: { display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, border: '1.5px dashed var(--borde)', background: 'var(--brand-soft)' },
  photoThumb: { width: 54, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--borde)' },
  photoPlaceholder: { width: 54, height: 54, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tarjeta)', color: 'var(--brand-text, var(--texto-acento))', border: '1px solid var(--borde)' },
  photoName: { fontSize: 13, fontWeight: 600, color: 'var(--texto-primary)', wordBreak: 'break-all' },
  photoHint: { fontSize: 12, color: 'var(--texto-second)' },
  photoBtn: { height: 34, padding: '0 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: 'var(--brand-gradient)', color: 'var(--brand-on-primary, #fff)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' },
  photoRemove: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#dc2626', display: 'flex' },
  footer: { padding: '14px 22px 20px', display: 'flex', gap: 10 },
  btn: { flex: 1, height: 42, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' },
}

const toggleBtn = (active, danger) => ({
  border: 'none', cursor: 'pointer', padding: '6px 16px', fontSize: 12.5, fontWeight: 700,
  background: active ? (danger ? '#dc2626' : 'var(--brand-gradient)') : 'transparent',
  color: active ? 'var(--brand-on-primary, #fff)' : 'var(--texto-second)',
})

function PhotoPicker({ file, onChange }) {
  const { t } = useTranslation()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!file) { setPreview(''); return undefined }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div style={S.photoBox}>
      {preview ? <img src={preview} alt={t('admin.inspection.evidence', 'Fotografía de evidencia')} style={S.photoThumb} /> : <div style={S.photoPlaceholder}><FaCamera size={20} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.photoName}>{file ? file.name : t('admin.inspection.noPhoto', 'Aún no hay fotografía')}</div>
        <div style={S.photoHint}>{file ? `${(file.size / 1024).toFixed(0)} KB` : t('admin.inspection.photoHint', 'Formato JPG o PNG')}</div>
      </div>
      <button type="button" style={S.photoBtn} onClick={() => inputRef.current?.click()}>
        <FaCamera size={13} /> {file ? t('admin.inspection.changePhoto', 'Cambiar') : t('admin.inspection.addPhoto', 'Adjuntar foto')}
      </button>
      {file && (
        <button type="button" style={S.photoRemove} onClick={() => onChange(null)} aria-label={t('admin.inspection.removePhoto', 'Quitar fotografía')}><FaTrashAlt size={14} /></button>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => { onChange(e.target.files?.[0] || null); e.target.value = '' }} />
    </div>
  )
}

function InspectionForm({ title, subtitle, defaultMileage, items, onSubmit, onCancel }) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [mileage, setMileage] = useState(String(defaultMileage ?? 0))
  const [fuel, setFuel] = useState('100')
  const [observations, setObservations] = useState('')
  const [answers, setAnswers] = useState(() => Object.fromEntries(items.map((i) => [i.id, { compliant: true, observation: '', photo: null }])))
  const [error, setError] = useState('')

  const setAnswer = (id, patch) => setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const submit = async () => {
    if (busy) return
    const mileageNumber = Number(mileage)
    const fuelNumber = Number(fuel)
    if (mileage === '' || !Number.isFinite(mileageNumber) || mileageNumber < 0 || fuel === '' || !Number.isFinite(fuelNumber) || fuelNumber < 0 || fuelNumber > 100) {
      setError(t('admin.inspection.errInvalid', 'Kilometraje o combustible inválido.'))
      return
    }
    const photos = []
    const result = []
    for (const item of items) {
      const a = answers[item.id]
      let observation = null
      let evidencePhotoIndex = null
      if (!a.compliant) {
        observation = a.observation.trim()
        if (!observation) { setError(t('admin.inspection.errDescribe', { defaultValue: 'Describe la novedad en "{{item}}".', item: item.name })); return }
        if (!a.photo) { setError(t('admin.inspection.errPhoto', { defaultValue: 'Adjunta una fotografía de la novedad en "{{item}}".', item: item.name })); return }
        evidencePhotoIndex = photos.length
        photos.push(a.photo)
      }
      result.push({ checklistItemId: item.id, compliant: a.compliant, observation, evidencePhotoIndex })
    }
    setError('')
    setBusy(true)
    try {
      await onSubmit({ mileage: mileageNumber, fuelLevelPercent: fuelNumber, observations: observations.trim() || null, answers: result, photos })
    } catch (err) {
      const data = err?.response?.data
      setError(data?.detail || data?.message || err?.message || t('admin.inspection.errGeneric', 'No fue posible registrar la inspección.'))
      setBusy(false)
    }
  }

  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={S.close} onClick={onCancel} aria-label={t('common.close', 'Cerrar')}><FaTimes size={14} /></button>
        <div style={S.header}>
          <div style={S.iconWrap}><FaClipboardCheck size={20} /></div>
          <div>
            <h3 style={S.title}>{title}</h3>
            {subtitle && <p style={S.subtitle}>{subtitle}</p>}
          </div>
        </div>

        <div style={S.body}>
          <div style={S.row}>
            <div>
              <label style={S.label} htmlFor="insp-km">{t('admin.inspection.mileage', 'Kilometraje actual')}</label>
              <input id="insp-km" style={S.input} type="number" min="0" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} autoFocus />
            </div>
            <div>
              <label style={S.label} htmlFor="insp-fuel">{t('admin.inspection.fuel', 'Combustible (0 a 100 %)')}</label>
              <input id="insp-fuel" style={S.input} type="number" min="0" max="100" inputMode="numeric" value={fuel} onChange={(e) => setFuel(e.target.value)} />
            </div>
          </div>

          {items.length > 0 && <p style={S.section}>{t('admin.inspection.reviewTitle', 'Revisión del vehículo')}</p>}
          {items.map((item) => {
            const a = answers[item.id]
            return (
              <div key={item.id} style={S.item}>
                <div style={S.itemTop}>
                  <span style={S.itemName}>{item.name}</span>
                  <div style={S.toggle} role="group" aria-label={t('admin.inspection.compliantOf', { defaultValue: '{{item}}: conforme', item: item.name })}>
                    <button type="button" style={toggleBtn(a.compliant, false)} onClick={() => setAnswer(item.id, { compliant: true })}>{t('admin.inspection.compliant', 'Conforme')}</button>
                    <button type="button" style={toggleBtn(!a.compliant, true)} onClick={() => setAnswer(item.id, { compliant: false })}>{t('admin.inspection.novelty', 'Novedad')}</button>
                  </div>
                </div>
                {!a.compliant && (
                  <>
                    <textarea style={S.textarea} placeholder={t('admin.inspection.describePlaceholder', { defaultValue: 'Describe el daño o novedad en {{item}}', item: item.name })} value={a.observation} onChange={(e) => setAnswer(item.id, { observation: e.target.value })} />
                    <div>
                      <label style={S.label}>{t('admin.inspection.evidence', 'Fotografía de evidencia')}</label>
                      <PhotoPicker file={a.photo} onChange={(photo) => setAnswer(item.id, { photo })} />
                    </div>
                  </>
                )}
              </div>
            )
          })}

          <div>
            <label style={S.label} htmlFor="insp-obs">{t('admin.inspection.generalObservations', 'Observaciones generales (opcional)')}</label>
            <textarea id="insp-obs" style={S.textarea} value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>

          {error && <p style={S.error} role="alert">{error}</p>}
        </div>

        <div style={S.footer}>
          <button type="button" onClick={onCancel} style={{ ...S.btn, background: 'transparent', border: '1.5px solid var(--texto-acento)', color: 'var(--texto-acento)' }}>{t('common.cancel', 'Cancelar')}</button>
          <button type="button" onClick={submit} disabled={busy} style={{ ...S.btn, background: 'var(--brand-gradient)', border: 'none', color: 'var(--brand-on-primary, #fff)', boxShadow: '0 4px 14px rgba(var(--brand-secondary-rgb),0.25)', opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}>{busy ? t('admin.inspection.registering', 'Registrando…') : t('admin.inspection.register', 'Registrar')}</button>
        </div>
      </div>
    </div>
  )
}

/**
 * Pide los datos de la inspección en un único formulario con el estilo de la app.
 * Al confirmar ejecuta `submit(datos)`; si falla, el error se muestra en el mismo formulario y este sigue abierto.
 * Resuelve con el resultado de `submit` o con null si se cancela.
 */
export function askInspection({ title, subtitle, defaultMileage, items, submit }) {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const close = (value) => {
      root.unmount()
      host.remove()
      resolve(value)
    }
    root.render(
      <InspectionForm
        title={title}
        subtitle={subtitle}
        defaultMileage={defaultMileage}
        items={items}
        onSubmit={async (data) => { close(await submit(data)) }}
        onCancel={() => close(null)}
      />
    )
  })
}
