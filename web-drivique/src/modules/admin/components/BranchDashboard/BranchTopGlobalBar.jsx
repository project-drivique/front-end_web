import { FaBell } from 'react-icons/fa'
import BranchNotificationModal from '../BranchNotificationModal'
import MenuConfiguracion from '../../../../components/MenuConfiguracion'

export default function BranchTopGlobalBar({ dashboardData, handleMarkAllNotificationsRead, handleMarkNotificationRead, handleNotificationClick, isNotificationsOpen, notifBtnRef, notifications, setIsNotificationsOpen, t, unreadNotifCount, usuario }) {
  return (
    <div className="branch-top-global-bar">
            <div className="branch-top-breadcrumb">
              <span className="branch-breadcrumb-subtitle">{t('dashboard.subtitle', 'Panel operativo')}</span>
              <h1 className="branch-breadcrumb-title">{t('dashboard.title', 'Dashboard')}</h1>
            </div>
  
            <div className="branch-top-right-tools">
              <div className="branch-notification-wrapper" style={{ position: 'relative' }}>
                <button
                  ref={notifBtnRef}
                  type="button"
                  className={`branch-icon-btn branch-notification-btn ${
                    isNotificationsOpen ? 'branch-icon-btn--active' : ''
                  }`}
                  title={t('hc.notificaciones_y_alertas', 'Notificaciones y Alertas')}
                  aria-label={t('hc.notificaciones_y_alertas', 'Notificaciones y Alertas')}
                  aria-expanded={isNotificationsOpen}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsNotificationsOpen((prev) => !prev)
                  }}
                >
                  <FaBell aria-hidden="true" />
                  {unreadNotifCount > 0 && (
                    <span className="branch-notification-badge">{unreadNotifCount}</span>
                  )}
                </button>
  
                <BranchNotificationModal
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  notifications={notifications}
                  unreadCount={unreadNotifCount}
                  onMarkRead={handleMarkNotificationRead}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onSelectNotification={handleNotificationClick}
                  branchName={dashboardData?.branchName}
                />
              </div>
  
              <div className="branch-divider-v" />
  
              <MenuConfiguracion />
  
              <div className="branch-user-profile-chip">
                <div className="branch-user-avatar">
                  {(usuario?.nombre || usuario?.correo || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="branch-user-info-text">
                  <strong className="branch-user-name">
                    {usuario?.nombre || usuario?.correo}
                  </strong>
                  <span className="branch-user-role">
                    {usuario?.rol || 'encargado_sucursal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
  )
}
