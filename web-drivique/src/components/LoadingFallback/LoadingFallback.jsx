import './LoadingFallback.css'

/**
 * Componente Presentacional de Carga para React.Suspense
 */
export default function LoadingFallback() {
  return (
    <div className="rlf-container" role="status" aria-label="Cargando módulo">
      <div className="rlf-spinner" />
      <span className="rlf-text">Cargando...</span>
    </div>
  )
}
