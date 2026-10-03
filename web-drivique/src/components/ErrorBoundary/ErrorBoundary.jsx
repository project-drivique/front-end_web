import React from 'react'
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa'
import './ErrorBoundary.css'

/**
 * Patrón Error Boundary: Capturador global de errores en tiempo de ejecución de React.
 * Evita pantallas blancas y ofrece una interfaz amigable para reintentar o volver al inicio.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Error no controlado capturado:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb-container" role="alert">
          <div className="eb-card">
            <div className="eb-icon-wrapper">
              <FaExclamationTriangle className="eb-icon" />
            </div>
            <h2 className="eb-title">Algo salió mal</h2>
            <p className="eb-description">
              Ocurrió un error inesperado al renderizar este componente. Tus datos están seguros.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="eb-details">
                <summary>Detalles técnicos (modo desarrollo)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div className="eb-actions">
              <button
                type="button"
                className="eb-btn eb-btn--primary"
                onClick={this.handleReload}
              >
                <FaRedo />
                <span>Recargar página</span>
              </button>
              <button
                type="button"
                className="eb-btn eb-btn--secondary"
                onClick={this.handleGoHome}
              >
                <FaHome />
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
