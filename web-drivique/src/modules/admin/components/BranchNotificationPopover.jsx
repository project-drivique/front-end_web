import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBell,
  FaTimes,
  FaCheckDouble,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa'
import './BranchNotificationPopover.css'

/**
 * Componente Presentacional: BranchNotificationPopover
 * 
 * @description
 * Minipantalla / Popover flotante ultralimpio y minimalista para notificaciones operativas.
 * Diseñado bajo estándares SaaS modernos (Linear / Stripe style):
 * - Fondo neutro y tipografía sobria sin saturación de colores.
 * - Indicadores sutiles de lectura (puntos circulares elegantes).
 * - Acciones rápidas en cabecera y enlace minimalista al Centro de Notificaciones.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad del popover flotante
 * @param {Function} props.onClose - Callback invocado al cerrar el popover
 * @param {Array<Object>} [props.notifications=[]] - Lista completa de notificaciones operativas
 * @param {number} [props.unreadCount=0] - Número de notificaciones no leídas
 * @param {Function} [props.onMarkRead] - Callback para marcar una notificación como leída
 * @param {Function} [props.onMarkAllRead] - Callback para marcar todas las notificaciones como leídas
 * @param {Function} [props.onSelectNotification] - Callback ejecutado al hacer clic sobre una notificación
 * @param {string} [props.branchName='Sucursal'] - Nombre de la sucursal actual
 * @param {string} [props.centerRoute='/encargado/notifications'] - Ruta hacia el Centro de Notificaciones
 * @returns {JSX.Element|null}
 */
export default function BranchNotificationPopover({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
  branchName = 'Sucursal',
  centerRoute = '/encargado/notifications',
}) {
  const { t } = useTranslation()
  const popoverRef = useRef(null)
  const navigate = useNavigate()

  // Manejo de cierre al presionar tecla Escape o hacer clic fuera del contenedor
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (!e.target.closest('.branch-notification-btn')) {
          onClose?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Limitamos la vista a las 4 alertas más prioritarias para mantener la estética minimalista
  const previewList = notifications.slice(0, 4)

  const handleGoToCenter = () => {
    onClose?.()
    navigate(centerRoute)
  }

  return (
    <div
      ref={popoverRef}
      className="bnp-popover"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bnpTitle"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Flecha indicadora superior minimalista */}
      <div className="bnp-arrow" />

      {/* Encabezado limpio y sobrio */}
      <header className="bnp-header">
        <div className="bnp-header-left">
          <h4 id="bnpTitle" className="bnp-title">
            {t('branchDashboard.notificationsPopover.title', 'Notificaciones')}
          </h4>
          {unreadCount > 0 && (
            <span className="bnp-unread-pill">
              {t('branchDashboard.notificationsPopover.newBadge', '{{count}} nuevas', { count: unreadCount })}
            </span>
          )}
        </div>

        <div className="bnp-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="bnp-action-btn"
              onClick={onMarkAllRead}
              title={t('branchDashboard.notificationsPopover.markAllAsRead', 'Marcar todas como leídas')}
            >
              <FaCheckDouble aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="bnp-close-btn"
            onClick={onClose}
            aria-label={t('branchDashboard.notificationsPopover.close', 'Cerrar ventana')}
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Listado de alertas minimalistas */}
      <div className="bnp-body">
        {notifications.length === 0 ? (
          <div className="bnp-empty">
            <div className="bnp-empty-icon-box">
              <FaCheckCircle className="bnp-empty-icon" />
            </div>
            <strong className="bnp-empty-title">
              {t('branchDashboard.notificationsPopover.allClearTitle', 'Todo al día')}
            </strong>
            <p className="bnp-empty-desc">
              {t('branchDashboard.notificationsPopover.allClearDesc', 'No hay alertas ni validaciones pendientes en esta sede.')}
            </p>
          </div>
        ) : (
          <div className="bnp-list">
            {previewList.map((notif) => (
              <div
                key={notif.id}
                className={`bnp-item ${!notif.isRead ? 'bnp-item--unread' : ''}`}
                onClick={() => onSelectNotification?.(notif)}
                role="button"
                tabIndex={0}
              >
                {/* Punto sutil de no leído */}
                <div className="bnp-item-bullet">
                  {!notif.isRead && <span className="bnp-dot" />}
                </div>

                <div className="bnp-item-content">
                  <div className="bnp-item-header-row">
                    <span className="bnp-item-title">{notif.text}</span>
                    <span className="bnp-item-time">{notif.time}</span>
                  </div>

                  {notif.detail && (
                    <p className="bnp-item-detail">{notif.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie del Popover con enlace minimalista y elegante */}
      <footer className="bnp-footer">
        <button
          type="button"
          className="bnp-view-all-link"
          onClick={handleGoToCenter}
        >
          <span>{t('branchDashboard.notificationsPopover.goToCenter', 'Ver todas las notificaciones')}</span>
          <FaArrowRight aria-hidden="true" className="bnp-link-arrow" />
        </button>
      </footer>
    </div>
  )
}
