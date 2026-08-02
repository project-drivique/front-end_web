import { useTranslation } from 'react-i18next'

export default function PaginacionCatalogo({ pagina, setPagina, totalPaginas, c }) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '40px', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: pagina === 1 ? c.paginationDisabledBg : c.accentText, color: pagina === 1 ? c.paginationDisabledText : '#fff', fontWeight: 700, fontSize: '13px' }}>
        ← {t('catalogo.previous')}
      </button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
        <button key={num} type="button" onClick={() => setPagina(num)} style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', background: pagina === num ? c.accentText : c.paginationIdleBg, color: pagina === num ? '#fff' : c.paginationIdleText, fontWeight: 700, fontSize: '14px' }}>
          {num}
        </button>
      ))}

      <button type="button" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} style={{ height: '38px', padding: '0 16px', borderRadius: '8px', border: 'none', background: pagina === totalPaginas ? c.paginationDisabledBg : c.accentText, color: pagina === totalPaginas ? c.paginationDisabledText : '#fff', fontWeight: 700, fontSize: '13px' }}>
        {t('catalogo.next')} →
      </button>
    </div>
  )
}
