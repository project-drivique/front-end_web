import { useTranslation } from 'react-i18next'

export default function PaginacionCatalogo({ pagina, setPagina, totalPaginas, c }) {
  const { t } = useTranslation()

  return (
    <div
      className="catalogo-pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '28px',
        paddingBottom: '6px',
        flexWrap: 'wrap',
      }}
    >

      <button
        type="button"
        onClick={() => setPagina(p => Math.max(1, p - 1))}
        disabled={pagina === 1}
        style={{
          height: '38px',
          padding: '0 15px',
          borderRadius: '9px',
          border: `1px solid ${pagina === 1 ? c.panelBorderStrong : c.accentText}`,
          background: pagina === 1 ? c.paginationDisabledBg : '#ffffff',
          color: pagina === 1 ? c.paginationDisabledText : c.accentText,
          fontWeight: 700,
          fontSize: '13px',
          cursor: pagina === 1 ? 'not-allowed' : 'pointer',
        }}
      >
         {t('catalogo.previous')}
      </button>

      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
        <button
          key={num}
          type="button"
          onClick={() => setPagina(num)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            border: `1px solid ${pagina === num ? c.accentText : c.panelBorderStrong}`,
            background: pagina === num ? c.accentText : c.paginationIdleBg,
            color: pagina === num ? '#ffffff' : c.paginationIdleText,
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {num}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
        disabled={pagina === totalPaginas}
        style={{
          height: '38px',
          padding: '0 16px',
          borderRadius: '9px',
          border: 'none',
          background: pagina === totalPaginas ? c.paginationDisabledBg : c.accentText,
          color: pagina === totalPaginas ? c.paginationDisabledText : '#ffffff',
          fontWeight: 800,
          fontSize: '13px',
          cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
          boxShadow: pagina === totalPaginas ? 'none' : '0 4px 12px rgba(37,99,235,0.18)',
        }}
      >
        {t('catalogo.next')} 
      </button>
    </div>
  )
}