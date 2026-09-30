import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBell,
  FaSearch,
  FaCheckDouble,
  FaClock,
  FaChevronRight,
  FaFilter,
  FaCar,
  FaExclamationTriangle,
  FaClipboardList,
  FaUndo,
  FaIdCard,
  FaCashRegister,
  FaArrowLeft,
  FaCheckCircle,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBranchDashboard } from '../../../hooks/useBranchDashboard'
import { useBranchNotifications } from '../../../hooks/useBranchNotifications'
import ManagementSidebar from '../components/ManagementSidebar'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import './BranchNotificationCenterPage.css'

/**
 * Componente de Página: BranchNotificationCenterPage
 * 
 * @description
 * Pantalla completa dedicada al "Centro de Notificaciones y Alertas Operativas" para
 * administradores y encargados de sucursal. Ofrece:
 * - Tarjetas de métricas y estadísticas operativas del turno.
 * - Buscador en tiempo real de notificaciones (por cliente, vehículo, código o descripción).
 * - Filtros por pestañas (Todas, No leídas, Operaciones, Alertas & Incidencias).
 * - Acciones rápidas de marcado masivo/individual y navegación directa a módulos de acción.
 * 
 * @param {Object} props
 * @param {boolean} [props.branchOnly=true] - Si es true, restringe la vista al contexto de la sucursal asignada.
 * @returns {JSX.Element}
 */
export default function BranchNotificationCenterPage({ branchOnly = true }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  // Consumo del Custom Hook de datos del Dashboard
  const { data: dashboardData, loading } = useBranchDashboard(usuario)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all') // 'all', 'unread', 'operations', 'attention'

  // Patrón Controller / Custom Hook: Centraliza la lógica y mutaciones de las notificaciones
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
  } = useBranchNotifications(usuario, dashboardData)

  const searchedList = useMemo(() => {
    let list = notifications

    if (selectedType === 'unread') {
      list = list.filter((n) => !n.isRead)
    } else if (selectedType === 'operations') {
      list = list.filter((n) => n.category === 'operations')
    } else if (selectedType === 'attention') {
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
  }, [notifications, selectedType, searchTerm])

  const handleActionClick = (notif) => {
    markAsRead(notif.id)
    if (notif.route) {
      navigate(notif.route)
    }
  }

  const branchTitle = dashboardData?.branchName || 'Alamo Bogotá - Aeropuerto'

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main bnc-main">
        {/* ENCABEZADO DE LA PÁGINA */}
        <header className="bnc-header">
          <div>
            <button
              type="button"
              className="bnc-back-btn"
              onClick={() => navigate(branchOnly ? '/encargado' : '/admin')}
            >
              <FaArrowLeft aria-hidden="true" />
              <span>{t('branchDashboard.notificationsCenter.backToDashboard', 'Volver al Dashboard')}</span>
            </button>

            <div className="bnc-title-group">
              <div className="bnc-title-icon-box">
                <FaBell aria-hidden="true" />
              </div>
              <div>
                <h1 className="bnc-title">{t('branchDashboard.notificationsCenter.title', 'Centro de Notificaciones')}</h1>
                <p className="bnc-subtitle">
                  {branchTitle} · {t('branchDashboard.notificationsCenter.subtitle', 'Monitoreo y trazabilidad de alertas operativas en tiempo real')}
                </p>
              </div>
            </div>
          </div>

          <div className="bnc-header-tools">
            <MenuConfiguracion />
            {unreadCount > 0 && (
              <button
                type="button"
                className="bnc-btn bnc-btn--secondary"
                onClick={markAllAsRead}
              >
                <FaCheckDouble aria-hidden="true" />
                <span>
                  {t('branchDashboard.notificationsCenter.markAllRead', 'Marcar todas como leídas')} ({unreadCount})
                </span>
              </button>
            )}
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS RÁPIDAS */}
        <section className="bnc-stats-grid">
          <div className="bnc-stat-card">
            <span className="bnc-stat-label">
              {t('branchDashboard.notificationsCenter.statTotal', 'Total Notificaciones')}
            </span>
            <strong className="bnc-stat-value">{notifications.length}</strong>
            <span className="bnc-stat-hint">
              {t('branchDashboard.notificationsCenter.statTotalHint', 'Registradas en el turno de hoy')}
            </span>
          </div>

          <div className="bnc-stat-card bnc-stat-card--danger">
            <span className="bnc-stat-label">
              {t('branchDashboard.notificationsCenter.statUnread', 'Pendientes / No Leídas')}
            </span>
            <strong className="bnc-stat-value">{unreadCount}</strong>
            <span className="bnc-stat-hint">
              {t('branchDashboard.notificationsCenter.statUnreadHint', 'Requieren tu atención o lectura')}
            </span>
          </div>

          <div className="bnc-stat-card bnc-stat-card--brand">
            <span className="bnc-stat-label">
              {t('branchDashboard.notificationsCenter.statOperations', 'Operaciones del Día')}
            </span>
            <strong className="bnc-stat-value">
              {notifications.filter((n) => n.category === 'operations').length}
            </strong>
            <span className="bnc-stat-hint">
              {t('branchDashboard.notificationsCenter.statOperationsHint', 'Entregas, recepciones y cobros')}
            </span>
          </div>

          <div className="bnc-stat-card bnc-stat-card--warning">
            <span className="bnc-stat-label">
              {t('branchDashboard.notificationsCenter.statAttention', 'Alertas & Documentos')}
            </span>
            <strong className="bnc-stat-value">
              {notifications.filter((n) => n.category === 'attention').length}
            </strong>
            <span className="bnc-stat-hint">
              {t('branchDashboard.notificationsCenter.statAttentionHint', 'Validaciones y novedades de flota')}
            </span>
          </div>
        </section>

        {/* CONTROLES DE FILTRO Y BÚSQUEDA */}
        <section className="bnc-controls-card">
          <div className="bnc-search-box">
            <FaSearch className="bnc-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="bnc-search-input"
              placeholder={t('branchDashboard.notificationsCenter.searchPlaceholder', 'Buscar notificación por cliente, placa o código de reserva...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bnc-pills-bar">
            <button
              type="button"
              className={`bnc-pill ${selectedType === 'all' ? 'bnc-pill--active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              {t('branchDashboard.notificationsCenter.filterAll', 'Todas')} ({notifications.length})
            </button>
            <button
              type="button"
              className={`bnc-pill ${selectedType === 'unread' ? 'bnc-pill--active' : ''}`}
              onClick={() => setSelectedType('unread')}
            >
              {t('branchDashboard.notificationsCenter.filterUnread', 'No leídas')} ({unreadCount})
            </button>
            <button
              type="button"
              className={`bnc-pill ${selectedType === 'operations' ? 'bnc-pill--active' : ''}`}
              onClick={() => setSelectedType('operations')}
            >
              <FaCar aria-hidden="true" />
              <span>
                {t('branchDashboard.notificationsCenter.filterOperations', 'Operaciones')} ({notifications.filter((n) => n.category === 'operations').length})
              </span>
            </button>
            <button
              type="button"
              className={`bnc-pill ${selectedType === 'attention' ? 'bnc-pill--active' : ''}`}
              onClick={() => setSelectedType('attention')}
            >
              <FaExclamationTriangle aria-hidden="true" />
              <span>
                {t('branchDashboard.notificationsCenter.filterAttention', 'Alertas & Incidencias')} ({notifications.filter((n) => n.category === 'attention').length})
              </span>
            </button>
          </div>
        </section>

        {/* LISTADO DE NOTIFICACIONES */}
        <section className="bnc-list-section">
          {searchedList.length === 0 ? (
            <div className="bnc-empty-state">
              <div className="bnc-empty-icon-box">
                <FaCheckCircle className="bnc-empty-icon" />
              </div>
              <h3 className="bnc-empty-title">
                {t('branchDashboard.notificationsCenter.emptyTitle', 'No hay notificaciones para mostrar')}
              </h3>
              <p className="bnc-empty-desc">
                {searchTerm
                  ? t('branchDashboard.notificationsCenter.emptyDescSearch', 'No se encontraron alertas que coincidan con tu término de búsqueda.')
                  : t('branchDashboard.notificationsCenter.emptyDescAll', 'Todas las tareas, entregas, devoluciones y validaciones de la sucursal están al día.')}
              </p>
            </div>
          ) : (
            <div className="bnc-cards-grid">
              {searchedList.map((notif) => {
                const IconComp = notif.icon || FaBell
                return (
                  <article
                    key={notif.id}
                    className={`bnc-card ${!notif.isRead ? 'bnc-card--unread' : ''}`}
                    style={{ borderLeftColor: notif.accentBorder || 'var(--brand-primary, #2563eb)' }}
                  >
                    <div
                      className="bnc-card-icon"
                      style={{ background: notif.iconBg, color: notif.iconColor }}
                    >
                      <IconComp aria-hidden="true" />
                    </div>

                    <div className="bnc-card-main">
                      <div className="bnc-card-top">
                        <span
                          className="bnc-category-badge"
                          style={{
                            background: notif.badgeBg || 'var(--brand-soft, rgba(37, 99, 235, 0.08))',
                            color: notif.badgeColor || 'var(--brand-primary, #2563eb)',
                          }}
                        >
                          {notif.categoryLabel || 'Notificación'}
                        </span>
                        <span className="bnc-card-time">
                          <FaClock aria-hidden="true" />
                          {notif.time}
                        </span>
                      </div>

                      <h3 className="bnc-card-title">{notif.text}</h3>
                      {notif.detail && (
                        <p className="bnc-card-detail">{notif.detail}</p>
                      )}

                      <div className="bnc-card-actions">
                        {!notif.isRead && (
                          <button
                            type="button"
                            className="bnc-mark-read-btn"
                            onClick={() => markAsRead(notif.id)}
                          >
                            {t('branchDashboard.notificationsCenter.markRead', 'Marcar leída')}
                          </button>
                        )}
                        <button
                          type="button"
                          className="bnc-btn bnc-btn--primary"
                          onClick={() => handleActionClick(notif)}
                        >
                          <span>{notif.actionLabel || t('branchDashboard.notificationsCenter.goToModule', 'Ir al módulo')}</span>
                          <FaChevronRight aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
