import React from 'react'
import { createRoot } from 'react-dom/client'
import AlertModal from '../modules/catalog/components/AlertModal'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa'

export const showAlert = (options) => {
  return new Promise((resolve) => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const root = createRoot(div)

    const cleanup = () => {
      root.unmount()
      if (div.parentNode) {
        div.parentNode.removeChild(div)
      }
    }

    const handlePrimary = () => {
      cleanup()
      resolve({ isConfirmed: true, isDismissed: false })
    }

    const handleSecondary = () => {
      cleanup()
      resolve({ isConfirmed: false, isDismissed: true })
    }
    
    const handleClose = () => {
      cleanup()
      resolve({ isConfirmed: false, isDismissed: true })
    }

    const esModoOscuro = typeof document !== 'undefined' && (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('drivique_tema') === 'oscuro' ||
      localStorage.getItem('tema') === 'oscuro'
    )

    const iconType = options.icon || 'info'
    let IconComponent = <FaInfoCircle size={22} color={esModoOscuro ? '#60a5fa' : '#1e3a8a'} />
    if (iconType === 'success') IconComponent = <FaCheckCircle size={22} color={esModoOscuro ? '#4ade80' : '#16a34a'} />
    else if (iconType === 'error' || iconType === 'warning') IconComponent = <FaExclamationTriangle size={22} color={esModoOscuro ? '#93c5fd' : '#1e3a8a'} />
    else if (iconType === 'question') IconComponent = <FaQuestionCircle size={22} color={esModoOscuro ? '#93c5fd' : '#1e3a8a'} />

    const mensajeContent = options.html 
      ? <span dangerouslySetInnerHTML={{ __html: options.html }} /> 
      : options.text

    root.render(
      <AlertModal
        icon={IconComponent}
        titulo={options.title || ''}
        mensaje={mensajeContent || ''}
        primaryText={options.confirmButtonText || 'Aceptar'}
        secondaryText={options.showCancelButton ? (options.cancelButtonText || 'Cancelar') : undefined}
        onPrimary={handlePrimary}
        onSecondary={handleSecondary}
        onCerrar={handleClose}
        showCloseButton={true}
        usePortal={false}
      />
    )
  })
}
