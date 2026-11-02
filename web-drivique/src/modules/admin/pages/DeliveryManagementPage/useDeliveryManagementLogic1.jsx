import { useLanding } from '../../../landing/LandingContext'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect, useMemo } from 'react'
import { deliveryService } from '@/services/deliveryService'
import { reservationManagementService } from '@/services/reservationManagementService'
import { showAlert } from '@/utils/swalConfig'
import { FaTimesCircle, FaCheckCircle, FaCalendarAlt, FaRoute, FaExclamationCircle } from 'react-icons/fa'

const INITIAL_CONDUCTOR = {
  nombre: '',
  email: '',
  tipoDoc: 'CC',
  numDoc: '',
  licencia: '',
  categoriaLic: 'B1',
  vencimientoLic: '',
  telefono: '',
  estado: 'disponible'
}

export default function useDeliveryManagementLogic1() {
  const { tema } = useLanding()
    const { t } = useTranslation()
    const user = useAuthStore((state) => state.usuario)
    const esEncargado =
      user?.rol === 'encargado' ||
      user?.rol === 'encargado_sucursal' ||
      user?.rol === 'branch_manager'
  
    const [reservations, setReservations] = useState([])
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('pendientes')
    const [modalConductor, setModalConductor] = useState(false)
    const [editingConductor, setEditingConductor] = useState(null)
    const [modalVerificar, setModalVerificar] = useState(null)
    const [pinIngresado, setPinIngresado] = useState('')
    const [assigningPointId, setAssigningPointId] = useState(null)
    const [revealedPins, setRevealedPins] = useState({})
  
    const [conductores, setConductores] = useState(() => deliveryService.list())
  
    const [nuevoConductor, setNuevoConductor] = useState(INITIAL_CONDUCTOR)
  
    const ESTADO_DOMICILIO = { PENDING: 'PENDIENTE', ASSIGNED: 'ASIGNADO', COMPLETED: 'COMPLETADO' }
  
    const loadReservations = () => {
      const all = reservationManagementService.list(user)
      const filas = []
      all.forEach((r) => {
        const puntoRecogida = (r.domicilioPuntos || []).find((p) => p.tipo === 'PICKUP')
        const puntoDevolucion = (r.domicilioPuntos || []).find((p) => p.tipo === 'RETURN')
  
        ;(r.domicilioPuntos || []).forEach((p) => {
          const esEntrega = p.tipo === 'PICKUP'
          filas.push({
            ...r,
            rowId: `${r.id}:${p.tipo}`,
            puntoTipo: p.tipo,
            tipoServicio: esEntrega
              ? t('admin.delivery.serviceTypes.delivery', 'Entrega a Domicilio')
              : t('admin.delivery.serviceTypes.return', 'Devolucion a Domicilio'),
            direccionInfo: p.direccion || 'No registrada',
            fechaEvento: esEntrega ? r.fechaInicio : r.fechaFin,
            // Campos separados para Recogida
            direccionRecogida: puntoRecogida ? (puntoRecogida.direccion || 'No registrada') : 'No aplica',
            fechaRecogida: puntoRecogida ? (r.fechaInicio || '—') : 'No aplica',
            horaRecogida: puntoRecogida ? (r.horaInicio || '—') : 'No aplica',
            // Campos separados para Devolución
            direccionDevolucion: puntoDevolucion ? (puntoDevolucion.direccion || 'No registrada') : 'No aplica',
            fechaDevolucion: puntoDevolucion ? (r.fechaFin || '—') : 'No aplica',
            horaDevolucion: puntoDevolucion ? (r.horaFin || '—') : 'No aplica',
  
            domicilioCodigo: p.deliveryPin || '—',
            domicilioPin: p.deliveryPin || '—',
            domicilioConductor: p.conductor,
            domicilioConductorId: p.conductorId,
            estadoDomicilio: ESTADO_DOMICILIO[p.estado] || 'PENDIENTE',
          })
        })
      })
      setReservations(filas)
    }
  
    const cargarConductores = () => deliveryService.refresh().then(setConductores).catch(() => setConductores([]))
  
    useEffect(() => {
      let mounted = true
      const refreshData = () => {
        reservationManagementService.refresh().then(() => {
          if (mounted) loadReservations()
        }).catch(() => {})
      }
  
      refreshData()
      cargarConductores()
  
      // Auto-polling cada 12 segundos para actualizar en tiempo real si el conductor confirma o reporta desde el correo
      const intervalId = setInterval(refreshData, 12000)
  
      // Sincronizar inmediatamente cuando la ventana vuelve a primer plano
      const onFocus = () => refreshData()
      window.addEventListener('focus', onFocus)
  
      return () => {
        mounted = false
        clearInterval(intervalId)
        window.removeEventListener('focus', onFocus)
      }
    }, [user])
  
    const handleCrearConductor = async (e) => {
      e.preventDefault()
      if (!nuevoConductor.nombre) return showAlert({ icon: 'warning', title: t('admin.delivery.modal.nameRequired', 'El nombre es obligatorio') })
  
      try {
        if (editingConductor) {
          setConductores(await deliveryService.update(editingConductor.id, nuevoConductor))
          showAlert({ icon: 'success', title: t('admin.delivery.modal.updateSuccess', 'Conductor actualizado exitosamente.') })
        } else {
          setConductores(await deliveryService.create(nuevoConductor))
          showAlert({ icon: 'success', title: t('admin.delivery.modal.createSuccess', 'Conductor creado exitosamente.') })
        }
      } catch (err) {
        return showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
      }
  
      setNuevoConductor(INITIAL_CONDUCTOR)
      setEditingConductor(null)
      setModalConductor(false)
    }
  
    const handleEditarConductor = (cond) => {
      setEditingConductor(cond)
      setNuevoConductor({
        nombre: cond.nombre || '',
        email: cond.email || '',
        tipoDoc: cond.tipoDoc || 'CC',
        numDoc: cond.numDoc || '',
        licencia: cond.licencia || '',
        categoriaLic: cond.categoriaLic || 'B1',
        vencimientoLic: cond.vencimientoLic || '',
        telefono: cond.telefono || '',
        estado: cond.estado || 'disponible'
      })
      setModalConductor(true)
    }
  
    const handleEliminarConductor = async (id) => {
      const result = await showAlert({
        title: t('admin.delivery.deleteConfirmTitle', '¿Eliminar conductor?'),
        text: t('admin.delivery.deleteConfirmText', 'Esta acción eliminará el registro del conductor del sistema.'),
        confirmButtonText: t('common.delete', 'Sí, eliminar'),
        showCancelButton: true,
        cancelButtonText: t('common.cancel', 'Cancelar'),
        icon: 'warning'
      })
      if (result?.isConfirmed) {
        try {
          setConductores(await deliveryService.remove(id))
          showAlert({ icon: 'success', title: t('admin.delivery.deleteSuccess', 'Conductor eliminado') })
        } catch (err) {
          showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
        }
      }
    }
  
    const handleDirectSelectConductor = async (reserva, nombreConductor) => {
      if (!nombreConductor) return
      const rowKey = reserva.rowId || reserva.id
      if (assigningPointId === rowKey) return
      setAssigningPointId(rowKey)
      try {
        const conductorObj = conductores.find(c => c.nombre === nombreConductor)
        if (!conductorObj) return
        await deliveryService.assign(reserva.id, reserva.puntoTipo, conductorObj.id)
        await reservationManagementService.refresh()
        showAlert({
          icon: 'success',
          title: t('admin.delivery.modal.assignSuccess', 'Conductor asignado'),
          text: t('hc3.driver_assigned_msg', { defaultValue: 'Conductor: {{conductor}}. El cliente y el conductor reciben el código de confirmación por correo; el conductor confirma o rechaza desde su correo.', conductor: nombreConductor })
        })
        loadReservations()
      } catch (err) {
        showAlert({ icon: 'error', title: t('hc4.error', 'Error'), text: err.message })
      } finally {
        setAssigningPointId(null)
      }
    }
  
    const hoy = useMemo(() => new Date().toISOString().slice(0, 10), [])
  
    const totalPendientes = useMemo(
      () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE').length,
      [reservations]
    )
    const totalAsignados = useMemo(
      () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO').length,
      [reservations]
    )
    const totalEnCaminoHoy = useMemo(
      () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && r.fechaEvento <= hoy).length,
      [reservations, hoy]
    )
    const totalProgramados = useMemo(
      () => reservations.filter((r) => r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO' && r.fechaEvento > hoy).length,
      [reservations, hoy]
    )
    const totalCompletados = useMemo(
      () => reservations.filter((r) => r.estadoDomicilio === 'COMPLETADO' || r.estado === 'finalizada').length,
      [reservations]
    )
  
    const filtrados = useMemo(() => reservations.filter(r => {
      if (activeTab === 'pendientes') {
        return r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'PENDIENTE'
      }
      if (activeTab === 'asignados') {
        return r.estado !== 'cancelada' && r.estado !== 'finalizada' && r.estadoDomicilio === 'ASIGNADO'
      }
      if (activeTab === 'completados') {
        return r.estadoDomicilio === 'COMPLETADO' || r.estado === 'finalizada'
      }
      if (search && activeTab !== 'conductores') {
        const lower = search.toLowerCase()
        return r.codigo?.toLowerCase().includes(lower) || r.domicilioCodigo?.toLowerCase().includes(lower) || r.vehiculoNombre?.toLowerCase().includes(lower) || r.vehiculoPlaca?.toLowerCase().includes(lower) || r.clienteNombre?.toLowerCase().includes(lower) || r.domicilioConductor?.toLowerCase().includes(lower)
      }
      return true
    }).sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento)), [reservations, search, activeTab])
  
    const conductoresFiltrados = useMemo(() => {
      if (!search) return conductores
      const lower = search.toLowerCase()
      return conductores.filter(c => 
        c.nombre?.toLowerCase().includes(lower) ||
        c.numDoc?.toLowerCase().includes(lower) ||
        c.licencia?.toLowerCase().includes(lower) ||
        c.telefono?.toLowerCase().includes(lower) ||
        c.vehiculo?.toLowerCase().includes(lower)
      )
    }, [conductores, search])
  
  
    const handleVerificar = async (e) => {
      e.preventDefault()
      if (!pinIngresado) return
      try {
        await deliveryService.complete(modalVerificar.id, modalVerificar.puntoTipo, pinIngresado)
        await reservationManagementService.refresh()
        showAlert({ icon: 'success', title: t('admin.delivery.modal.pinSuccess', 'PIN verificado correctamente.') })
        setModalVerificar(null); setPinIngresado(''); loadReservations()
      } catch (err) {
        showAlert({ icon: 'error', title: t('admin.delivery.modal.pinError', 'PIN incorrecto.'), text: err.message })
      }
    }
  
    const getBadge = (estado, reservaEstado, fechaEvento) => {
      if (reservaEstado === 'cancelada' || estado === 'CANCELADO') {
        return (
          <span className="doc-status-badge rechazada" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
            <FaTimesCircle style={{ fontSize: 11 }} />
            {t('admin.delivery.status.cancelada', 'Cancelada')}
          </span>
        )
      }
      if (reservaEstado === 'finalizada' || estado === 'COMPLETADO') {
        return (
          <span className="doc-status-badge aprobado">
            <FaCheckCircle style={{ fontSize: 11 }} />
            {t('admin.delivery.status.completado', 'Completado')}
          </span>
        )
      }
      if (estado === 'ASIGNADO') {
        const esFuturo = fechaEvento && fechaEvento > hoy
        if (esFuturo) {
          return (
            <span className="doc-status-badge" style={{ background: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }}>
              <FaCalendarAlt style={{ fontSize: 11, color: '#2563eb' }} />
              {t('admin.delivery.status.programado', 'Programado')}
            </span>
          )
        }
        return (
          <span className="doc-status-badge pendiente" style={{ background: 'var(--brand-soft)', color: 'var(--brand-text)', borderColor: 'var(--brand-border)' }}>
            <FaRoute style={{ fontSize: 11 }} />
            {t('admin.delivery.status.asignado', 'En Camino')}
          </span>
        )
      }
      return (
        <span className="doc-status-badge pendiente">
          <FaExclamationCircle style={{ fontSize: 11 }} />
          {t('admin.delivery.status.pendiente', 'Pendiente')}
        </span>
      )
    }
  
    const getConductorBadge = (estado) => {
      const norm = String(estado || 'disponible').toLowerCase()
      if (norm === 'disponible') {
        return (
          <span className="doc-status-badge aprobado" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
            {t('admin.delivery.driverStatus.disponible', 'Disponible')}
          </span>
        )
      }
      if (norm === 'en_servicio') {
        return (
          <span className="doc-status-badge pendiente" style={{ background: 'var(--brand-soft)', color: 'var(--brand-text)', borderColor: 'var(--brand-border)' }}>
            {t('admin.delivery.driverStatus.enServicio', 'En Ruta')}
          </span>
        )
      }
      return (
        <span className="doc-status-badge rechazada" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}>
          {t('admin.delivery.driverStatus.inactivo', 'Inactivo')}
        </span>
      )
    }
  
    const closeBtnStyle = { background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--city-muted)', lineHeight: 1, padding: 0 }
    const modalHeadStyle = { padding: '20px 24px', borderBottom: '1px solid var(--city-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
    const backdropStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.65)', padding: 16 }
  
    const exportData = useMemo(() => {
      if (activeTab === 'conductores') {
        return {
          title: 'Conductores Registrados en Sucursal — Drivique',
          headers: [
            'ID',
            'NOMBRE CONDUCTOR',
            'CORREO ELECTRÓNICO',
            'TIPO DOC',
            'NÚMERO DOC',
            'NÚMERO LICENCIA',
            'CATEGORÍA LICENCIA',
            'VENCIMIENTO LICENCIA',
            'TELÉFONO',
            'VEHÍCULO ASIGNADO',
            'ESTADO',
          ],
          rows: conductoresFiltrados.map((c, i) => [
            i + 1,
            c.nombre,
            c.email || '-',
            c.tipoDoc || 'CC',
            c.numDoc || '-',
            c.licencia || '-',
            c.categoriaLic || '-',
            c.vencimientoLic || '-',
            c.telefono || '-',
            c.vehiculo || t('hc2.sin_asignar', 'Sin asignar'),
            c.estado || 'disponible',
          ]),
          filename: `conductores-sucursal-${new Date().toISOString().slice(0, 10)}`,
        }
      }
      return {
        title: 'Domicilios y Entregas de Reserva — Drivique',
        headers: [
          'ID',
          'CÓDIGO RESERVA',
          'CÓDIGO DOMICILIO (PIN)',
          'NOMBRE CLIENTE',
          'VEHÍCULO',
          'TIPO SERVICIO',
          'DIRECCIÓN RECOGIDA',
          'FECHA RECOGIDA',
          'HORA RECOGIDA',
          'DIRECCIÓN DEVOLUCIÓN',
          'FECHA DEVOLUCIÓN',
          'HORA DEVOLUCIÓN',
          'CONDUCTOR ASIGNADO',
          'ESTADO',
        ],
        rows: filtrados.map((r, i) => [
          i + 1,
          r.codigo,
          r.domicilioCodigo,
          r.clienteNombre,
          r.vehiculoNombre || r.vehiculo?.nombre || '-',
          r.tipoServicio,
          r.direccionRecogida,
          r.fechaRecogida,
          r.horaRecogida,
          r.direccionDevolucion,
          r.fechaDevolucion,
          r.horaDevolucion,
          r.domicilioConductor || t('admin.delivery.noDriver', 'Sin asignar'),
          r.estadoDomicilio || 'PENDIENTE',
        ]),
        filename: `domicilios-reserva-${new Date().toISOString().slice(0, 10)}`,
      }
    }, [filtrados, conductoresFiltrados, activeTab, t])

  return { tema, t, user, esEncargado, reservations, search, setSearch, activeTab, setActiveTab, modalConductor, setModalConductor, editingConductor, setEditingConductor, modalVerificar, setModalVerificar, pinIngresado, setPinIngresado, assigningPointId, revealedPins, setRevealedPins, conductores, nuevoConductor, setNuevoConductor, handleCrearConductor, handleEditarConductor, handleEliminarConductor, handleDirectSelectConductor, hoy, totalPendientes, totalAsignados, totalEnCaminoHoy, totalProgramados, totalCompletados, filtrados, conductoresFiltrados, handleVerificar, getBadge, getConductorBadge, closeBtnStyle, modalHeadStyle, backdropStyle, exportData }
}
