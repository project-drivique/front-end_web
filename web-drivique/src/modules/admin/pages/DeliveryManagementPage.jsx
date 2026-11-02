

import { FaMapMarkerAlt, FaUserTie, FaCheckCircle, FaRoute, FaExclamationCircle } from 'react-icons/fa'


import ManagementSidebar from '../components/ManagementSidebar'





import './CityManagementPage.css'
import './CashCollectionPage.css'
import './DocumentVerificationPage.css'
import ModalVerificar from './DeliveryManagementPage/ModalVerificar'
import ModalConductor from './DeliveryManagementPage/ModalConductor'
import DocMobileCards from './DeliveryManagementPage/DocMobileCards'
import CitiesTableWrap from './DeliveryManagementPage/CitiesTableWrap'
import Length from './DeliveryManagementPage/Length'
import CitiesToolbar from './DeliveryManagementPage/CitiesToolbar'
import FleetAttachedTabs from './DeliveryManagementPage/FleetAttachedTabs'
import CitiesTopbar from './DeliveryManagementPage/CitiesTopbar'
import useDeliveryManagementLogic1 from './DeliveryManagementPage/useDeliveryManagementLogic1'



export default function DeliveryManagementPage() {
  const { tema, t, user, esEncargado, reservations, search, setSearch, activeTab, setActiveTab, modalConductor, setModalConductor, editingConductor, setEditingConductor, modalVerificar, setModalVerificar, pinIngresado, setPinIngresado, assigningPointId, revealedPins, setRevealedPins, conductores, nuevoConductor, setNuevoConductor, handleCrearConductor, handleEditarConductor, handleEliminarConductor, handleDirectSelectConductor, hoy, totalPendientes, totalAsignados, totalEnCaminoHoy, totalProgramados, totalCompletados, filtrados, conductoresFiltrados, handleVerificar, getBadge, getConductorBadge, closeBtnStyle, modalHeadStyle, backdropStyle, exportData } = useDeliveryManagementLogic1()

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`} data-theme={tema}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main doc-verification-main">
        <div className="cities-container" style={{ maxWidth: '100%' }}>

          <CitiesTopbar t={t} user={user} />

          {/* KPI CARDS */}
          <div className="cash-kpi-bar">
            {[
              { icon: FaExclamationCircle, color: '#f59e0b', label: t('admin.delivery.kpi.pending', 'Pendientes de Asignar'), value: totalPendientes, desc: t('admin.delivery.kpi.pendingDesc', 'Sin conductor asignado') },
              { icon: FaRoute, color: 'var(--brand-text)', label: t('admin.delivery.kpi.assigned', 'En Camino / Programados'), value: totalAsignados, desc: `${totalEnCaminoHoy} en camino hoy · ${totalProgramados} programados` },
              { icon: FaCheckCircle, color: '#10b981', label: t('admin.delivery.kpi.completed', 'Entregados'), value: totalCompletados, desc: t('admin.delivery.kpi.completedDesc', 'Servicios finalizados') },
              { icon: FaUserTie, color: '#8b5cf6', label: t('admin.delivery.kpi.drivers', 'Conductores Registrados'), value: conductores.length, desc: t('admin.delivery.kpi.driversDesc', 'Personal disponible en sucursal') },
            ].map(({ icon: Icon, color, label, value, desc }) => (
              <div key={label} className="cash-kpi-item-light">
                <div className="cash-kpi-header-light" style={{ color }}>
                  <Icon /><span>{label}</span>
                </div>
                <strong className="cash-kpi-val-light">{value}</strong>
                <div className="cash-kpi-progress-bg">
                  <div className="cash-kpi-progress-fill" style={{ width: value > 0 ? '100%' : '0%', background: color }} />
                </div>
                <span className="cash-kpi-subtitle-light">{desc}</span>
              </div>
            ))}
          </div>

          {/* PESTAÑAS ADHERIDAS CON BOTON AZUL "+ CREAR CONDUCTOR" A LA DERECHA */}
          <FleetAttachedTabs activeTab={activeTab} conductores={conductores} reservations={reservations} setActiveTab={setActiveTab} setEditingConductor={setEditingConductor} setModalConductor={setModalConductor} setNuevoConductor={setNuevoConductor} t={t} totalAsignados={totalAsignados} totalCompletados={totalCompletados} totalPendientes={totalPendientes} />

          {/* TARJETA PRINCIPAL ADHERIDA A PESTAÑAS */}
          <section className="cities-card attached-to-tabs">
            {/* TOOLBAR CON BUSCADOR, SUCURSAL Y EXPORT PILLS */}
            <CitiesToolbar activeTab={activeTab} exportData={exportData} search={search} setSearch={setSearch} t={t} user={user} />

            {/* SI PESTAÑA CONDUCTORES ESTÁ ACTIVA */}
            {activeTab === 'conductores' ? (
              <>
                <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                  <span>{conductoresFiltrados.length}</span>{' '}
                  {t('admin.delivery.driversFoundCount', 'CONDUCTORES REGISTRADOS EN SUCURSAL').toUpperCase()}
                </div>

                {conductoresFiltrados.length === 0 ? (
                  <div className="cities-empty">
                    <FaUserTie style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                    <h2>{t('admin.delivery.emptyDriversTitle', 'No se encontraron conductores')}</h2>
                    <p>{t('admin.delivery.emptyDriversDesc', 'Haz clic en "+ Crear Conductor" para registrar el primer conductor.')}</p>
                  </div>
                ) : (
                  <Length conductoresFiltrados={conductoresFiltrados} getConductorBadge={getConductorBadge} handleEditarConductor={handleEditarConductor} handleEliminarConductor={handleEliminarConductor} t={t} />
                )}
              </>
            ) : (
              /* SI PESTAÑAS DE RESERVAS ESTÁN ACTIVAS */
              <>
                {/* CONTADOR SUMARIO */}
                <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                  <span>{filtrados.length}</span>{' '}
                  {t('admin.delivery.foundCount', 'DOMICILIOS RESERVA EN EL LISTADO').toUpperCase()}
                </div>

                {filtrados.length === 0 ? (
                  <div className="cities-empty">
                    <FaMapMarkerAlt style={{ fontSize: 44, color: '#94a3b8', marginBottom: 12 }} />
                    <h2>{t('admin.delivery.emptyTitle', 'No se encontraron domicilios')}</h2>
                    <p>{t('admin.delivery.emptyDesc', 'No hay entregas o devoluciones a domicilio que coincidan con los filtros seleccionados.')}</p>
                  </div>
                ) : (
                  <>
                    {/* 1. Vista de Tabla Completa para Escritorio & Tablets */}
                    <CitiesTableWrap assigningPointId={assigningPointId} conductores={conductores} filtrados={filtrados} getBadge={getBadge} handleDirectSelectConductor={handleDirectSelectConductor} hoy={hoy} revealedPins={revealedPins} setModalVerificar={setModalVerificar} setRevealedPins={setRevealedPins} t={t} />

                    {/* 2. Vista de Tarjetas Adaptativas para Pantallas Móviles */}
                    <DocMobileCards assigningPointId={assigningPointId} conductores={conductores} filtrados={filtrados} getBadge={getBadge} handleDirectSelectConductor={handleDirectSelectConductor} hoy={hoy} revealedPins={revealedPins} setModalVerificar={setModalVerificar} setRevealedPins={setRevealedPins} t={t} />
                  </>
                )}
              </>
            )}
          </section>
        </div>

        {/* MODAL CREAR / EDITAR CONDUCTOR CON DISEÑO ELEGANTE Y ESTRUCTURADO */}
        {modalConductor && (
          <ModalConductor backdropStyle={backdropStyle} closeBtnStyle={closeBtnStyle} editingConductor={editingConductor} handleCrearConductor={handleCrearConductor} nuevoConductor={nuevoConductor} setEditingConductor={setEditingConductor} setModalConductor={setModalConductor} setNuevoConductor={setNuevoConductor} />
        )}

        {/* MODAL VERIFICAR PIN */}
        {modalVerificar && (
          <ModalVerificar backdropStyle={backdropStyle} closeBtnStyle={closeBtnStyle} handleVerificar={handleVerificar} modalHeadStyle={modalHeadStyle} modalVerificar={modalVerificar} pinIngresado={pinIngresado} setModalVerificar={setModalVerificar} setPinIngresado={setPinIngresado} t={t} />
        )}
      </main>
    </div>
  )
}
