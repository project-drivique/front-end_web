import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  FaBell,
  FaTimes,
  FaCheckDouble,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaBellSlash,
  FaCar,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import './BranchNotificationDrawer.css'

/**
 * Presentational Component: BranchNotificationDrawer
 * Patrón Container/Presentational: Responsabilidad única para renderizar el panel lateral deslizable.
 * Utiliza React Portal (document.body) para garantizar que nunca sea bloqueado por overflow o stacking contexts padres.
 */
export default function BranchNotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  filteredNotifications = [],
  unreadCount = 0,
  filter = 'all',
  onFilterChange,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
  branchName = 'Sucursal',
}) {
  const { t } = useTranslation()
  const drawerRef = useRef(null)

  // Cerrar con tecla Escape y capturar foco
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const drawerElement = (
    <div
      className="bnd-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bndDrawerTitle"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        className="bnd-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO DEL DRAWER */}
        <header className="bnd-header">
          <div className="bnd-title-group">
            <div className="bnd-icon-badge">
              <FaBell aria-hidden="true" />
            </div>
            <div>
              <div className="bnd-title-row">
                <h3 id="bndDrawerTitle" className="bnd-title">
                  {t('admin.notifications.drawerTitle', 'Notificaciones y Alertas')}
                </h3>
                {unreadCount > 0 && (
                  <span className="bnd-unread-badge">{unreadCount} {t('admin.notifications.new', 'nuevas')}</span>
                )}
              </div>
              <p className="bnd-subtitle">
                {branchName} · {t('admin.notifications.realTimeMonitoring', 'Monitoreo operativo en tiempo real')}
              </p>
            </div>
          </div>

          <div className="bnd-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="bnd-btn bnd-btn--secondary bnd-btn--sm"
                onClick={onMarkAllRead}
                title={t('admin.notifications.markAllReadTitle', 'Marcar todas las notificaciones como leídas')}
              >
                <FaCheckDouble aria-hidden="true" />
                <span>{t('admin.notifications.markRead', 'Marcar leídas')}</span>
              </button>
            )}
            <button
              type="button"
              className="bnd-close-btn"
              onClick={onClose}
              aria-label={t('admin.notifications.closePanel', 'Cerrar panel de notificaciones')}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* BARRA DE FILTROS POR PASTILLAS (PILLS) */}
        <nav className="bnd-filter-bar" aria-label={t('admin.notifications.filters', 'Filtros de notificaciones')}>
          <button
            type="button"
            className={`bnd-filter-pill ${filter === 'all' ? 'bnd-filter-pill--active' : ''}`}
            onClick={() => onFilterChange?.('all')}
          >
            {t('admin.notifications.filterAll', 'Todas')} ({notifications.length})
          </button>
          <button
            type="button"
            className={`bnd-filter-pill ${filter === 'unread' ? 'bnd-filter-pill--active' : ''}`}
            onClick={() => onFilterChange?.('unread')}
          >
            {t('admin.notifications.filterUnread', 'No leídas')} ({unreadCount})
          </button>
          <button
            type="button"
            className={`bnd-filter-pill ${filter === 'operations' ? 'bnd-filter-pill--active' : ''}`}
            onClick={() => onFilterChange?.('operations')}
          >
            <FaCar aria-hidden="true" />
            <span>{t('admin.notifications.filterOps', 'Operaciones')}</span>
          </button>
          <button
            type="button"
            className={`bnd-filter-pill ${filter === 'attention' ? 'bnd-filter-pill--active' : ''}`}
            onClick={() => onFilterChange?.('attention')}
          >
            <FaExclamationTriangle aria-hidden="true" />
            <span>{t('admin.notifications.filterAlerts', 'Alertas & Incidencias')}</span>
          </button>
        </nav>

        {/* CUERPO DEL DRAWER CON TARJETAS O ESTADO VACÍO INFORMATIVO */}
        <main className="bnd-body">
          {filteredNotifications.length === 0 ? (
            <div className="bnd-empty-state">
              <div className="bnd-empty-icon-box">
                <FaBellSlash className="bnd-empty-icon" aria-hidden="true" />
              </div>
              <h4 className="bnd-empty-title">{t('admin.notifications.emptyTitle', 'No hay notificaciones pendientes')}</h4>
              <p className="bnd-empty-desc">
                {t('admin.notifications.emptyDesc', 'Todas las entregas, devoluciones, validaciones de documentos y cobros de esta sede están al día.')}
              </p>
              <div className="bnd-empty-alert-card">
                <FaCheckCircle className="bnd-empty-alert-icon" aria-hidden="true" />
                <div className="bnd-empty-alert-text">
                  <strong>{t('admin.notifications.normalOps', 'Operatividad 100% normal')}</strong>
                  <span>{t('admin.notifications.normalDesc', 'El sistema te alertará automáticamente ante nuevas reservas, retrasos de entrega o novedades mecánicas.')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bnd-list">
              {filteredNotifications.map((notif) => {
                const IconComp = notif.icon || FaBell
                return (
                  <article
                    key={notif.id}
                    className={`bnd-card ${!notif.isRead ? 'bnd-card--unread' : ''}`}
                    style={{ borderLeftColor: notif.accentBorder || '#2563eb' }}
                  >
                    <div
                      className="bnd-card-icon"
                      style={{ background: notif.iconBg, color: notif.iconColor }}
                    >
                      <IconComp aria-hidden="true" />
                    </div>

                    <div className="bnd-card-main">
                      <div className="bnd-card-top">
                        <span
                          className="bnd-category-badge"
                          style={{
                            background: notif.badgeBg || 'rgba(37, 99, 235, 0.08)',
                            color: notif.badgeColor || '#2563eb',
                          }}
                        >
                          {t(`admin.notifications.category.${notif.categoryLabel}`, notif.categoryLabel) || t('admin.notifications.defaultCategory', 'Notificación')}
                        </span>
                        <span className="bnd-time">
                          <FaClock aria-hidden="true" />
                          {notif.time}
                        </span>
                      </div>

                      <h4 className="bnd-card-title">{notif.text}</h4>
                      {notif.detail && (
                        <p className="bnd-card-detail">{notif.detail}</p>
                      )}

                      <div className="bnd-card-actions">
                        {!notif.isRead && (
                          <button
                            type="button"
                            className="bnd-mark-read-btn"
                            onClick={() => onMarkRead?.(notif.id)}
                            title={t('admin.notifications.markReadTitle', 'Marcar como leída')}
                          >
                            {t('admin.notifications.markRead', 'Marcar leída')}
                          </button>
                        )}
                        <button
                          type="button"
                          className="bnd-btn bnd-btn--primary bnd-btn--sm bnd-cta-btn"
                          onClick={() => onSelectNotification?.(notif)}
                        >
                          <span>{t(`admin.notifications.action.${notif.actionLabel}`, notif.actionLabel) || t('admin.notifications.defaultAction', 'Ir al módulo')}</span>
                          <FaChevronRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>

        {/* PIE DEL DRAWER */}
        <footer className="bnd-footer">
          <span className="bnd-footer-summary">
            {filteredNotifications.length} {t('admin.notifications.alertsOf', 'alerta(s) de')} {notifications.length}
          </span>
          <div className="bnd-footer-btns">
            {unreadCount > 0 && (
              <button
                type="button"
                className="bnd-btn bnd-btn--secondary bnd-btn--sm"
                onClick={onMarkAllRead}
              >
                <FaCheckDouble aria-hidden="true" />
                <span>{t('admin.notifications.clearPending', 'Limpiar pendientes')}</span>
              </button>
            )}
            <button
              type="button"
              className="bnd-btn bnd-btn--secondary bnd-btn--sm"
              onClick={onClose}
            >
              {t('admin.notifications.closePanelBtn', 'Cerrar panel')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(drawerElement, document.body)
  }

  return drawerElement
}

