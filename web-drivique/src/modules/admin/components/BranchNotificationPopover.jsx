import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBell,
  FaTimes,
  FaCheckDouble,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaBellSlash,
  FaArrowRight,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import './BranchNotificationPopover.css'

/**
 * Presentational Component: BranchNotificationPopover
 * 
 * @description
 * Minipantalla / Popover flotante anclada debajo de la campana de notificaciones.
 * Muestra un resumen rápido de las alertas más recientes y un acceso directo al Centro de Notificaciones.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad del popover
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

  // Cerrar al presionar Escape o hacer clic fuera
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        // Verificar si el clic fue en el botón de la campana (que tiene su propio handler)
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

  // Mostrar solo las 4 alertas más prioritarias en el popover para evitar saturación
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
      {/* Flecha indicadora superior */}
      <div className="bnp-arrow" />

      {/* Encabezado del Popover */}
      <header className="bnp-header">
        <div className="bnp-header-left">
          <div className="bnp-icon-badge">
            <FaBell aria-hidden="true" />
          </div>
          <div>
            <div className="bnp-title-row">
              <h4 id="bnpTitle" className="bnp-title">
                {t('branchDashboard.notificationsPopover.title', 'Notificaciones')}
              </h4>
              {unreadCount > 0 && (
                <span className="bnp-unread-pill">
                  {t('branchDashboard.notificationsPopover.newBadge', '{{count}} nuevas', { count: unreadCount })}
                </span>
              )}
            </div>
            <span className="bnp-branch-name">{branchName}</span>
          </div>
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

      {/* Lista de alertas compacta */}
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
            {previewList.map((notif) => {
              const IconComp = notif.icon || FaBell
              return (
                <div
                  key={notif.id}
                  className={`bnp-item ${!notif.isRead ? 'bnp-item--unread' : ''}`}
                  onClick={() => onSelectNotification?.(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="bnp-item-icon"
                    style={{ background: notif.iconBg, color: notif.iconColor }}
                  >
                    <IconComp aria-hidden="true" />
                  </div>

                  <div className="bnp-item-content">
                    <div className="bnp-item-top">
                      <span
                        className="bnp-item-cat"
                        style={{ color: notif.badgeColor || 'var(--brand-primary, #2563eb)' }}
                      >
                        {notif.categoryLabel || 'Operación'}
                      </span>
                      <span className="bnp-item-time">
                        <FaClock aria-hidden="true" /> {notif.time}
                      </span>
                    </div>

                    <p className="bnp-item-text">{notif.text}</p>
                    {notif.detail && (
                      <span className="bnp-item-detail">{notif.detail}</span>
                    )}
                  </div>

                  <div className="bnp-item-chevron">
                    <FaChevronRight aria-hidden="true" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pie del Popover con botón principal hacia el Centro de Notificaciones */}
      <footer className="bnp-footer">
        <button
          type="button"
          className="bnp-view-all-btn"
          onClick={handleGoToCenter}
        >
          <span>{t('branchDashboard.notificationsPopover.goToCenter', 'Ir al Centro de Notificaciones')}</span>
          <FaArrowRight aria-hidden="true" />
        </button>
      </footer>
    </div>
  )
}
