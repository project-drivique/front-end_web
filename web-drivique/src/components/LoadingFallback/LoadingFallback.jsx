import './LoadingFallback.css'
import i18n from '@/i18n'

/**
 * Componente Presentacional de Carga para React.Suspense
 */
export default function LoadingFallback() {
  return (
    <div className="rlf-container" role="status" aria-label={i18n.t('hc.cargando_modulo', 'Cargando módulo')}>
      <div className="rlf-spinner" />
      <span className="rlf-text">Cargando...</span>
    </div>
  )
}
