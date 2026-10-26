import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaImage, FaPalette, FaSave, FaUndo } from 'react-icons/fa'
import { useBrand } from '../../../contexts/BrandContext'
import { useLanding } from '../../landing/LandingContext'
import { showAlert } from '../../../utils/swalConfig'
import { brandService } from '../../../services/brandService'
import { createBrandTokens, applyBrand, normalizeHex } from '../../../utils/brandThemeUtils'
import ManagementSidebar from '../components/ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import defaultLogo from '../../../assets/logocatalog.png'
import './BrandManagementPage.css'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
// Paletas listas para usar: siempre colores hexadecimales reales (nunca variables CSS)
const PALETTE_PRESETS = [
  { id: 'ocean', colors: { primary: '#2563EB', secondary: '#1E3A8A', accent: '#60A5FA' } },
  { id: 'forest', colors: { primary: '#059669', secondary: '#064E3B', accent: '#34D399' } },
  { id: 'sunset', colors: { primary: '#EA580C', secondary: '#9A3412', accent: '#FDBA74' } },
  { id: 'navy', colors: { primary: '#1E40AF', secondary: '#1E3A8A', accent: '#93C5FD' } },
  { id: 'rose', colors: { primary: '#E11D48', secondary: '#881337', accent: '#FDA4AF' } },
  { id: 'graphite', colors: { primary: '#334155', secondary: '#0F172A', accent: '#94A3B8' } },
]
const SAVE_DELAY_MS = 800

// Acepta "#abc", "abc" o "#aabbcc" y devuelve "#AABBCC"; si no es un color completo devuelve null
function parseColor(value) {
  let text = String(value || '').trim()
  if (!text) return null
  if (!text.startsWith('#')) text = `#${text}`
  if (/^#[0-9a-f]{3}$/i.test(text)) text = `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`
  return normalizeHex(text)
}

// Garantiza que los tres colores del borrador sean hexadecimales válidos
function safeColors(colors, fallback) {
  return {
    primary: normalizeHex(colors?.primary) || normalizeHex(fallback?.primary) || '#2563EB',
    secondary: normalizeHex(colors?.secondary) || normalizeHex(fallback?.secondary) || '#1E3A8A',
    accent: normalizeHex(colors?.accent) || normalizeHex(fallback?.accent) || '#60A5FA',
  }
}

export default function BrandManagementPage() {
  const { t } = useTranslation()
  const { brand } = useBrand()
  const { tema } = useLanding()
  const [draft, setDraft] = useState(() => ({ ...brand, colors: safeColors(brand?.colors) }))
  const [typedColors, setTypedColors] = useState({})
  const saveTimer = useRef(null)
  useEffect(() => () => clearTimeout(saveTimer.current), [])
  const previewTokens = useMemo(() => createBrandTokens(draft.colors), [draft.colors])

  // Resultado de cada acción en una alerta centrada, igual que el resto del panel
  const showError = (caught) => {
    const key = `admin.brand.errors.${caught?.message}`
    const text = t(key)
    return showAlert({ icon: 'error', title: text === key ? t('admin.brand.errors.saveFailed') : text, confirmButtonText: t('common.accept', 'Aceptar') })
  }
  const showSuccess = (text) => showAlert({ icon: 'success', title: text, timer: 2200, showConfirmButton: false })

  // Al mover el selector de color la vista previa cambia al instante, pero se guarda una sola vez cuando se deja de elegir
  const scheduleSave = (updated) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      brandService.save(updated)
        .then(() => showSuccess(t('admin.brand.messages.colorSaved')))
        .catch(showError)
    }, SAVE_DELAY_MS)
  }

  const updateColor = (key, value) => {
    const color = parseColor(value)
    // Mientras se escribe un código incompleto solo se muestra lo escrito; no se guarda ni se aplica
    setTypedColors((current) => (color
      ? Object.fromEntries(Object.entries(current).filter(([typedKey]) => typedKey !== key))
      : { ...current, [key]: String(value) }))
    if (!color) return
    const updated = { ...draft, colors: { ...draft.colors, [key]: color } }
    setDraft(updated)
    applyBrand(updated)
    scheduleSave(updated)
  }

  const selectPalette = (colors) => {
    clearTimeout(saveTimer.current)
    const updated = { ...draft, colors: { ...colors } }
    setDraft(updated)
    setTypedColors({})
    applyBrand(updated)
    brandService.save(updated)
      .then(() => showSuccess(t('admin.brand.messages.colorSaved')))
      .catch(showError)
  }

  const loadLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_TYPES.has(file.type)) return showError({ message: 'logoType' })
    if (file.size > 1024 * 1024) return showError({ message: 'logoSize' })
    const reader = new FileReader()
    reader.onload = () => { setDraft((current) => ({ ...current, logoDataUrl: String(reader.result || '') })) }
    reader.onerror = () => showError({ message: 'logoRead' })
    reader.readAsDataURL(file)
  }

  const run = async (action, successKey) => {
    try {
      const updated = await action()
      setDraft({ ...updated, colors: safeColors(updated?.colors, draft.colors) })
      setTypedColors({})
      applyBrand(updated)
      showSuccess(t(successKey))
    } catch (caught) {
      showError(caught)
    }
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main brand-page">
        <header className="brand-page__header">
          <div><p>{t('admin.brand.eyebrow')}</p><h1>{t('admin.brand.title')}</h1><span>{t('admin.brand.subtitle')}</span></div>
          <MenuConfiguracion />
        </header>


        <div className="brand-layout">
          <section className="brand-editor">
            <div className="brand-section-title"><FaImage /><div><h2>{t('admin.brand.identity')}</h2><p>{t('admin.brand.identityHint')}</p></div></div>
            <label className="brand-field"><span>{t('admin.brand.name')}</span><input value={draft.name} maxLength={40} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="brand-upload"><img src={draft.logoDataUrl || defaultLogo} alt="" /><span><strong>{t('admin.brand.logo')}</strong><small>{t('admin.brand.logoHint')}</small></span><input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={loadLogo} /></label>

            <div className="brand-section-title brand-section-title--palette"><FaPalette /><div><h2>{t('admin.brand.palette')}</h2><p>{t('admin.brandPalette.hint')}</p></div></div>
            <div className="brand-presets" role="radiogroup" aria-label={t('admin.brandPalette.label')}>
              {PALETTE_PRESETS.map((preset) => {
                const selected = Object.keys(preset.colors).every((key) => draft.colors[key].toUpperCase() === preset.colors[key])
                return (
                  <button key={preset.id} type="button" role="radio" aria-checked={selected} className={`brand-preset${selected ? ' brand-preset--selected' : ''}`} onClick={() => selectPalette(preset.colors)}>
                    <span className="brand-preset__swatches" aria-hidden="true">{Object.values(preset.colors).map((color) => <i key={color} style={{ background: color }} />)}</span>
                    <span>{t(`admin.brandPalette.${preset.id}`)}</span>
                    {selected && <FaCheck aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
            <p className="brand-custom-hint">{t('admin.brandPalette.customHint')}</p>
            <div className="brand-colors">
              {['primary', 'secondary', 'accent'].map((key) => <label key={key}><span>{t(`admin.brand.colors.${key}`)}</span><div><input type="color" value={draft.colors[key]} onChange={(event) => updateColor(key, event.target.value)} /><input value={typedColors[key] ?? draft.colors[key]} maxLength={7} spellCheck={false} aria-invalid={typedColors[key] !== undefined && !parseColor(typedColors[key])} onChange={(event) => updateColor(key, event.target.value)} onBlur={() => setTypedColors((current) => Object.fromEntries(Object.entries(current).filter(([typedKey]) => typedKey !== key)))} /></div></label>)}
            </div>

            <div className="brand-actions">
              <button type="button" className="brand-secondary" onClick={() => run(() => brandService.restorePrevious(), 'admin.brand.messages.previous')}><FaUndo /> {t('admin.brand.restorePrevious')}</button>
              <button type="button" className="brand-secondary" onClick={() => run(() => brandService.restoreDefault(), 'admin.brand.messages.original')}><FaUndo /> {t('admin.brand.restoreOriginal')}</button>
              <button type="button" className="brand-primary" onClick={() => run(() => brandService.save(draft), 'admin.brand.messages.saved')}><FaSave /> {t('admin.brand.apply')}</button>
            </div>
          </section>

          <aside className="brand-preview" style={{ '--preview-primary': previewTokens.primary, '--preview-secondary': previewTokens.secondary, '--preview-accent': previewTokens.accent, '--preview-on-primary': previewTokens.onPrimary, '--preview-on-secondary': previewTokens.onSecondary }}>
            <div className="brand-preview__label">{t('admin.brand.preview')}</div>
            <div className="brand-preview__nav"><img src={draft.logoDataUrl || defaultLogo} alt="" /><strong>{draft.name || t('admin.brand.nameFallback')}</strong><span /></div>
            <div className="brand-preview__body"><small>{t('admin.brand.previewEyebrow')}</small><h2>{t('admin.brand.previewTitle')}</h2><p>{t('admin.brand.previewText')}</p><div className="brand-preview__swatches"><i /><i /><i /></div><button type="button">{t('admin.brand.previewButton')}</button></div>
          </aside>
        </div>
      </main>
    </div>
  )
}
