import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaImage, FaPalette, FaSave, FaUndo } from 'react-icons/fa'
import { useAuthStore } from '../../../store/authStore'
import { useBrand } from '../../../contexts/BrandContext'
import { useLanding } from '../../landing/LandingContext'
import { brandService } from '../../../services/brandService'
import { createBrandTokens } from '../../../utils/brandThemeUtils'
import ManagementSidebar from '../components/ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import defaultLogo from '../../../assets/logocatalog.png'
import './BrandManagementPage.css'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const PALETTE_PRESETS = [
  { id: 'ocean', colors: { primary: '#2563EB', secondary: '#1E3A8A', accent: '#60A5FA' } },
  { id: 'forest', colors: { primary: '#059669', secondary: '#064E3B', accent: '#34D399' } },
  { id: 'sunset', colors: { primary: '#EA580C', secondary: '#9A3412', accent: '#FDBA74' } },
  { id: 'violet', colors: { primary: '#7C3AED', secondary: '#4C1D95', accent: '#C4B5FD' } },
  { id: 'rose', colors: { primary: '#E11D48', secondary: '#881337', accent: '#FDA4AF' } },
  { id: 'graphite', colors: { primary: '#334155', secondary: '#0F172A', accent: '#94A3B8' } },
]

export default function BrandManagementPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const { tema } = useLanding()
  const [draft, setDraft] = useState(brand)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const previewTokens = useMemo(() => createBrandTokens(draft.colors), [draft.colors])

  const updateColor = (key, value) => setDraft((current) => ({ ...current, colors: { ...current.colors, [key]: value } }))
  const selectPalette = (colors) => {
    setDraft((current) => ({ ...current, colors: { ...colors } }))
    setError('')
  }

  const loadLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_TYPES.has(file.type)) return setError(t('admin.brand.errors.logoType'))
    if (file.size > 1024 * 1024) return setError(t('admin.brand.errors.logoSize'))
    const reader = new FileReader()
    reader.onload = () => { setDraft((current) => ({ ...current, logoDataUrl: String(reader.result || '') })); setError('') }
    reader.onerror = () => setError(t('admin.brand.errors.logoRead'))
    reader.readAsDataURL(file)
  }

  const run = (action, successKey) => {
    try {
      setError('')
      const updated = action()
      setDraft(updated)
      setNotice(t(successKey))
    } catch (caught) {
      setError(t(`admin.brand.errors.${caught.message}`))
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

        {notice && <div className="cities-notice" role="status"><span><FaCheck /> {notice}</span><button type="button" aria-label={t('common.close', 'Cerrar')} onClick={() => setNotice('')}>×</button></div>}
        {error && <div className="brand-error" role="alert">{error}</div>}

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
              {['primary', 'secondary', 'accent'].map((key) => <label key={key}><span>{t(`admin.brand.colors.${key}`)}</span><div><input type="color" value={draft.colors[key]} onChange={(event) => updateColor(key, event.target.value)} /><input value={draft.colors[key]} maxLength={7} onChange={(event) => updateColor(key, event.target.value)} /></div></label>)}
            </div>

            <div className="brand-actions">
              <button type="button" className="brand-secondary" onClick={() => run(() => brandService.restorePrevious(user), 'admin.brand.messages.previous')}><FaUndo /> {t('admin.brand.restorePrevious')}</button>
              <button type="button" className="brand-secondary" onClick={() => run(() => brandService.restoreDefault(user), 'admin.brand.messages.original')}><FaUndo /> {t('admin.brand.restoreOriginal')}</button>
              <button type="button" className="brand-primary" onClick={() => run(() => brandService.save(draft, user), 'admin.brand.messages.saved')}><FaSave /> {t('admin.brand.apply')}</button>
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
