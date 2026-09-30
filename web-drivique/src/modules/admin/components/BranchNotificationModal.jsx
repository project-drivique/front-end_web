import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBell,
  FaTimes,
  FaCheckDouble,
  FaSearch,
  FaCar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaCheck,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import './BranchNotificationModal.css'

/**
 * Componente: BranchNotificationModal
 * 
 * @description
 * Modal centrado, elegante y de alta fidelidad para la gestión y visualización de
 * notificaciones operativas de la sucursal.
 * 
 * Características:
 * - Organización por pestañas (Todas, No leídas, Operaciones, Alertas).
 * - Buscador en tiempo real por cliente, placa, código de reserva o detalle.
 * - Tarjetas estructuradas con información completa (sin textos truncados).
 * - Acciones directas por cada alerta ("Marcar leída" e "Ir al módulo / Ver detalle").
 * - Soporte nativo para modo oscuro, temas dinámicos de marca y 5 idiomas (i18n).
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad del modal
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {Array<Object>} [props.notifications=[]] - Lista completa de notificaciones
 * @param {number} [props.unreadCount=0] - Cantidad de notificaciones pendientes
 * @param {Function} [props.onMarkRead] - Callback para marcar una notificación individual como leída
 * @param {Function} [props.onMarkAllRead] - Callback para marcar todas las notificaciones como leídas
 * @param {Function} [props.onSelectNotification] - Callback al interactuar con una notificación
 * @param {string} [props.branchName='Alamo Bogotá - Aeropuerto'] - Nombre de la sucursal activa
 * @returns {JSX.Element|null}
 */
export default function BranchNotificationModal({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
  branchName = 'Alamo Bogotá - Aeropuerto',
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all') // 'all', 'unread', 'operations', 'attention'

  // Manejo de teclado (tecla Escape para cerrar) y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Filtrado reactivo por pestaña y término de búsqueda
  const filteredList = useMemo(() => {
    let list = notifications

    if (selectedTab === 'unread') {
      list = list.filter((n) => !n.isRead)
    } else if (selectedTab === 'operations') {
      list = list.filter((n) => n.category === 'operations')
    } else if (selectedTab === 'attention') {
      list = list.filter((n) => n.category === 'attention')
    }

    if (!searchTerm.trim()) return list
    const q = searchTerm.toLowerCase().trim()
    return list.filter(
      (n) =>
        (n.text || '').toLowerCase().includes(q) ||
        (n.detail || '').toLowerCase().includes(q) ||
        (n.categoryLabel || '').toLowerCase().includes(q)
    )
  }, [notifications, selectedTab, searchTerm])

  if (!isOpen) return null

  const handleActionClick = (notif) => {
    onMarkRead?.(notif.id)
    onClose?.()
    if (onSelectNotification) {
      onSelectNotification(notif)
    } else if (notif.route) {
      navigate(notif.route, { state: notif.navigationState })
    }
  }

  const operationsCount = notifications.filter((n) => n.category === 'operations').length
  const attentionCount = notifications.filter((n) => n.category === 'attention').length

  return (
    <div
      className="bnm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bnmModalTitle"
      onClick={onClose}
    >
      <div
        className="bnm-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO DEL MODAL */}
        <header className="bnm-header">
          <div className="bnm-header-left">
            <div className="bnm-icon-box">
              <FaBell aria-hidden="true" />
            </div>
            <div>
              <div className="bnm-title-row">
                <h2 id="bnmModalTitle" className="bnm-title">
                  {t('branchDashboard.notificationsCenter.title', 'Centro de Notificaciones')}
                </h2>
                {unreadCount > 0 && (
                  <span className="bnm-unread-badge">
                    {unreadCount} {t('branchDashboard.notificationsCenter.filterUnread', 'No leídas')}
                  </span>
                )}
              </div>
              <p className="bnm-subtitle">
                {branchName} · {t('branchDashboard.notificationsCenter.subtitle', 'Monitoreo y trazabilidad de alertas operativas')}
              </p>
            </div>
          </div>

          <div className="bnm-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="bnm-btn-mark-all"
                onClick={onMarkAllRead}
              >
                <FaCheckDouble aria-hidden="true" />
                <span>{t('branchDashboard.notificationsCenter.markAllRead', 'Marcar todas como leídas')}</span>
              </button>
            )}
            <button
              type="button"
              className="bnm-close-btn"
              onClick={onClose}
              aria-label={t('common.close', 'Cerrar')}
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* BARRA DE HERRAMIENTAS: BÚSQUEDA Y PESTAÑAS */}
        <div className="bnm-toolbar">
          <div className="bnm-search-box">
            <FaSearch className="bnm-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="bnm-search-input"
              placeholder={t('branchDashboard.notificationsCenter.searchPlaceholder', 'Buscar por cliente, placa o código de reserva...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="bnm-clear-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="bnm-tabs-group">
            <button
              type="button"
              className={`bnm-tab ${selectedTab === 'all' ? 'bnm-tab--active' : ''}`}
              onClick={() => setSelectedTab('all')}
            >
              <span>{t('branchDashboard.notificationsCenter.filterAll', 'Todas')}</span>
              <span className="bnm-tab-count">{notifications.length}</span>
            </button>
            <button
              type="button"
              className={`bnm-tab ${selectedTab === 'unread' ? 'bnm-tab--active' : ''}`}
              onClick={() => setSelectedTab('unread')}
            >
              <span>{t('branchDashboard.notificationsCenter.filterUnread', 'No leídas')}</span>
              <span className="bnm-tab-count">{unreadCount}</span>
            </button>
            <button
              type="button"
              className={`bnm-tab ${selectedTab === 'operations' ? 'bnm-tab--active' : ''}`}
              onClick={() => setSelectedTab('operations')}
            >
              <FaCar aria-hidden="true" />
              <span>{t('branchDashboard.notificationsCenter.filterOperations', 'Operaciones')}</span>
              <span className="bnm-tab-count">{operationsCount}</span>
            </button>
            <button
              type="button"
              className={`bnm-tab ${selectedTab === 'attention' ? 'bnm-tab--active' : ''}`}
              onClick={() => setSelectedTab('attention')}
            >
              <FaExclamationTriangle aria-hidden="true" />
              <span>{t('branchDashboard.notificationsCenter.filterAttention', 'Alertas')}</span>
              <span className="bnm-tab-count">{attentionCount}</span>
            </button>
          </div>
        </div>

        {/* CUERPO DEL MODAL CON LISTADO DE TARJETAS */}
        <div className="bnm-body">
          {filteredList.length === 0 ? (
            <div className="bnm-empty-state">
              <div className="bnm-empty-icon-circle">
                <FaCheckCircle className="bnm-empty-icon" />
              </div>
              <h3 className="bnm-empty-title">
                {t('branchDashboard.notificationsCenter.emptyTitle', 'No hay notificaciones')}
              </h3>
              <p className="bnm-empty-desc">
                {searchTerm
                  ? t('branchDashboard.notificationsCenter.emptyDescSearch', 'No se encontraron alertas que coincidan con la búsqueda.')
                  : t('branchDashboard.notificationsCenter.emptyDescAll', 'Todas las operaciones, entregas y validaciones de la sucursal están al día.')}
              </p>
            </div>
          ) : (
            <div className="bnm-list">
              {filteredList.map((notif) => {
                const IconComp = notif.icon || FaBell
                return (
                  <article
                    key={notif.id}
                    className={`bnm-card ${!notif.isRead ? 'bnm-card--unread' : ''}`}
                  >
                    {/* Icono de la tarjeta */}
                    <div
                      className="bnm-card-icon"
                      style={{
                        background: notif.iconBg || 'var(--brand-soft, rgba(37, 99, 235, 0.08))',
                        color: notif.iconColor || 'var(--brand-primary, #2563eb)',
                      }}
                    >
                      <IconComp aria-hidden="true" />
                    </div>

                    {/* Contenido principal */}
                    <div className="bnm-card-main">
                      <div className="bnm-card-meta">
                        <span
                          className="bnm-card-badge"
                          style={{
                            background: notif.badgeBg || 'var(--brand-soft, rgba(37, 99, 235, 0.08))',
                            color: notif.badgeColor || 'var(--brand-primary, #2563eb)',
                          }}
                        >
                          {notif.categoryLabel || 'Operación'}
                        </span>
                        <span className="bnm-card-time">
                          <FaClock aria-hidden="true" /> {notif.time}
                        </span>
                        {!notif.isRead && (
                          <span className="bnm-card-unread-dot" title="No leída" />
                        )}
                      </div>

                      <h4 className="bnm-card-title">{notif.text}</h4>
                      {notif.detail && (
                        <p className="bnm-card-detail">{notif.detail}</p>
                      )}
                    </div>

                    {/* Acciones de la tarjeta */}
                    <div className="bnm-card-actions">
                      {!notif.isRead && (
                        <button
                          type="button"
                          className="bnm-btn-read"
                          onClick={() => onMarkRead?.(notif.id)}
                          title="Marcar como leída"
                        >
                          <FaCheck aria-hidden="true" />
                          <span>{t('branchDashboard.notificationsCenter.markRead', 'Marcar leída')}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="bnm-btn-action"
                        onClick={() => handleActionClick(notif)}
                      >
                        <span>{notif.actionLabel || t('branchDashboard.notificationsCenter.goToModule', 'Ir al módulo')}</span>
                        <FaChevronRight aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL */}
        <footer className="bnm-footer">
          <span className="bnm-footer-counter">
            {t('common.showing', 'Mostrando')} {filteredList.length} de {notifications.length} {t('admin.nav.notifications', 'Notificaciones')}
          </span>

          <button
            type="button"
            className="bnm-btn-close-modal"
            onClick={onClose}
          >
            {t('common.close', 'Cerrar')}
          </button>
        </footer>
      </div>
    </div>
  )
}
