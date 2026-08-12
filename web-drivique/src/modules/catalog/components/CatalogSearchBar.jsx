import { useTranslation } from 'react-i18next'
import { FaSearch } from 'react-icons/fa'

export default function CatalogSearchBar({
  c,
  textoLibre,
  setTextoLibre,
  sinCoincidenciasTexto,
  containerClassName = 'catalogo-header-search',
}) {
  const { t } = useTranslation()

  return (
    <div
      className={containerClassName}
      style={{
        background: c.heroCardBg,
        border: `1px solid ${sinCoincidenciasTexto ? c.dangerBorder : c.heroCardBorder}`,
      }}
    >
      <FaSearch size={15} color={c.accentText} style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={textoLibre}
        onChange={e => setTextoLibre(e.target.value)}
        placeholder={t('catalogo.freeSearchPlaceholder')}
        className="catalogo-header-search-input"
        style={{ color: c.inputText }}
      />
    </div>
  )
}