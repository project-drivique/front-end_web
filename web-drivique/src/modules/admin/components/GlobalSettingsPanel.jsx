import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaSave, FaUndo } from 'react-icons/fa'
import { settingsService } from '../../../services/settingsService'
import { showAlert } from '../../../utils/swalConfig'

// Parámetros globales de seguridad: se validan en el servidor, quedan auditados y el último cambio se puede revertir
export default function GlobalSettingsPanel() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState(null)
  const [values, setValues] = useState({})
  const [reasons, setReasons] = useState({})
  const [busy, setBusy] = useState('')

  useEffect(() => {
    settingsService.list()
      .then((list) => {
        setSettings(list)
        setValues(Object.fromEntries(list.map((s) => [s.key, s.value])))
      })
      .catch(() => setSettings([]))
  }, [])

  const label = (s) => t(`admin.settings.keys.${s.key}`, s.description || s.key)

  const run = async (key, action, success) => {
    setBusy(key)
    try {
      const updated = await action()
      setSettings((current) => current.map((s) => (s.key === key ? updated : s)))
      setValues((current) => ({ ...current, [key]: updated.value }))
      setReasons((current) => ({ ...current, [key]: '' }))
      await showAlert({ icon: 'success', title: success, timer: 2200, showConfirmButton: false })
    } catch (error) {
      await showAlert({ icon: 'error', title: error.message, confirmButtonText: t('common.accept', 'Aceptar') })
    } finally {
      setBusy('')
    }
  }

  // Sin permiso (403) o sin parámetros: no se muestra nada
  if (!settings || settings.length === 0) return null

  return (
    <section className="brand-editor" style={{ marginTop: 24 }}>
      <div className="brand-section-title">
        <FaShieldAlt />
        <div>
          <h2>{t('admin.settings.title', 'Parámetros globales de seguridad')}</h2>
          <p>{t('admin.settings.subtitle', 'Cada cambio se valida, queda auditado y el último puede revertirse.')}</p>
        </div>
      </div>
      {settings.map((s) => (
        <div key={s.key} className="brand-field" style={{ borderTop: '1px solid var(--borde, #e2e8f0)', paddingTop: 12, marginTop: 12 }}>
          <span>{label(s)}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {s.type === 'BOOLEAN' ? (
              <select value={values[s.key] ?? s.value} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}>
                <option value="true">{t('admin.settings.enabled', 'Activado')}</option>
                <option value="false">{t('admin.settings.disabled', 'Desactivado')}</option>
              </select>
            ) : (
              <input
                type="number"
                min={s.min}
                max={s.max}
                value={values[s.key] ?? s.value}
                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                style={{ width: 110 }}
              />
            )}
            {s.type !== 'BOOLEAN' && <small>{s.min}–{s.max}</small>}
            <input
              placeholder={t('admin.settings.reason', 'Motivo del cambio (opcional)')}
              value={reasons[s.key] || ''}
              maxLength={300}
              onChange={(e) => setReasons({ ...reasons, [s.key]: e.target.value })}
              style={{ flex: 1, minWidth: 180 }}
            />
            <button
              type="button"
              className="brand-primary"
              disabled={busy === s.key || String(values[s.key]) === String(s.value)}
              onClick={() => run(s.key, () => settingsService.update(s.key, values[s.key], reasons[s.key]), t('admin.settings.saved', 'Parámetro actualizado correctamente.'))}
            >
              <FaSave /> {t('admin.settings.save', 'Guardar')}
            </button>
            {s.canRevert && (
              <button
                type="button"
                className="brand-secondary"
                disabled={busy === s.key}
                onClick={() => run(s.key, () => settingsService.revert(s.key), t('admin.settings.reverted', 'Se revirtió el último cambio.'))}
              >
                <FaUndo /> {t('admin.settings.revert', { value: s.previousValue, defaultValue: 'Revertir a {{value}}' })}
              </button>
            )}
          </div>
          {s.lastChangedBy && <small style={{ opacity: 0.7 }}>{t('admin.settings.lastChange', { name: s.lastChangedBy, defaultValue: 'Último cambio: {{name}}' })}</small>}
        </div>
      ))}
    </section>
  )
}
