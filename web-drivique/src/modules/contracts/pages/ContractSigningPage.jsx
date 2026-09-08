import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft, FaFileSignature, FaShieldAlt, FaCar } from 'react-icons/fa'
import { useAuthStore } from '@/store/authStore'
import { useLanding } from '@/modules/landing/LandingContext'
import { contractService } from '@/services/contractService'
import { reservationService } from '@/services/reservationService'
import { reservationsService } from '@/services/reservationsService'
import { catalogService } from '@/services/catalogService'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import ContractSignature from '../components/ContractSignature'
import { showAlert } from '@/utils/swalConfig'
import MenuConfiguracion from '@/components/MenuConfiguracion'
import logo from '@/assets/logo.png'
import { useBrand } from '@/contexts/BrandContext'

export default function ContractSigningPage() {
  const { id } = useParams()
  const { brand } = useBrand()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = useAuthStore(state => state.usuario)
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const [cargando, setCargando] = useState(true)
  const [reserva, setReserva] = useState(() => location.state?.reserva || null)
  const [vehiculo, setVehiculo] = useState(() => location.state?.vehiculo || location.state?.reserva?.vehiculo || null)

  useEffect(() => {
    let activo = true
    const cargarDatos = async () => {
      // Si ya vino la reserva completa en state, no mostramos spinner innecesario
      if (location.state?.reserva) {
        setCargando(false)
        return
      }

      setCargando(true)
      try {
        // 1. Buscar en contractService o reservationService
        const contratoFirmado = contractService.obtenerPorReserva(id)
        let resData = contratoFirmado?.contratoOriginal?.reserva || reservationService.obtenerPorReferencia(id)

        if (!resData) {
          const list = await reservationsService.getReservas()
          resData = (list || []).find(r => String(r.id) === String(id) || r.codigo === id || r.referencia === id)
        }

        let vehData = contratoFirmado?.contratoOriginal?.vehiculo || resData?.vehiculo

        if (!vehData && resData?.vehiculoId) {
          vehData = await catalogService.getVehiculoById(resData.vehiculoId).catch(() => null)
        }

        if (!vehData && resData?.vehiculoId) {
          vehData = VEHICULOS_MOCK.find(v => String(v.id) === String(resData.vehiculoId))
        }

        if (activo) {
          setReserva(resData || null)
          setVehiculo(vehData || VEHICULOS_MOCK[0] || null)
        }
      } catch (err) {
        console.error('Error cargando reserva para firmar contrato:', err)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarDatos()
    return () => { activo = false }
  }, [id, location.state])

  // Adaptar datos de reserva para el contrato
  const reservaParaContrato = useMemo(() => {
    if (!reserva) return null
    const df = reserva.datosForm || {}
    const rd = reserva.reservaDetalles || {}

    const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || reserva.clienteNombre || usuario?.nombre || 'Cliente Drivique'
    const correoCliente = df.correo || reserva.clienteCorreo || usuario?.correo || usuario?.email || 'cliente@drivique.com'
    const telCliente = df.celular || df.telefono || reserva.clienteTelefono || usuario?.telefono || '+57 300 000 0000'
    const docCliente = df.numDoc || df.documento || reserva.clienteDocumento || usuario?.cedula || '1020304050'
    const tipoDocCliente = df.tipoDoc || 'CC'
    const ref = reserva.referencia || reserva.codigo || reserva.id || id

    return {
      ...reserva,
      referencia: ref,
      total: reserva.total || reserva.totalCOP || 0,
      seguroIdx: reserva.seguroIdx ?? 0,
      serviciosSeleccionados: reserva.serviciosSeleccionados || [],
      datosForm: {
        ...df,
        nombre: nombreCliente,
        correo: correoCliente,
        celular: telCliente,
        telefono: telCliente,
        tipoDoc: tipoDocCliente,
        numDoc: docCliente,
        licenciaPdf: df.licenciaPdf || null
      },
      reservaDetalles: {
        ...rd,
        fechaInicio: rd.fechaInicio || reserva.fechaInicio,
        fechaFin: rd.fechaFin || reserva.fechaFin,
        horaInicio: rd.horaInicio || '08:00',
        horaFin: rd.horaFin || '18:00',
        sucursalRetiro: rd.sucursalRetiro || reserva.sucursal || vehiculo?.sucursal || 'Alquiler Neiva - Centro',
        sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursal || vehiculo?.sucursal || 'Alquiler Neiva - Centro',
        metodoPago: rd.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
        sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursal || vehiculo?.sucursal || 'Alquiler Neiva - Centro'
      }
    }
  }, [reserva, vehiculo, usuario, id])

  const vehiculoParaContrato = useMemo(() => {
    const base = vehiculo || reserva?.vehiculo || {}
    return {
      ...base,
      nombre: base.nombre || (base.marca ? `${base.marca} ${base.modelo || ''}` : 'Vehículo Drivique'),
      placa: base.placa || 'Asignación al entregar',
      color: base.color || 'Plata',
      año: base.año || base.anio || 2024,
      sucursal: base.sucursal || reserva?.sucursal || 'Alquiler Neiva - Centro',
      servicios: base.servicios || [],
      seguros: base.seguros || [{ nombre: 'Protección Básica Estándar' }]
    }
  }, [vehiculo, reserva])

  const handleFirmado = async (contrato) => {
    await showAlert({
      icon: 'success',
      title: '¡Contrato Firmado con Éxito!',
      text: 'Tu contrato de alquiler ha sido firmado digitalmente y asegurado en tu cuenta. Ya puedes ver o descargar tu copia protegida en Mis Reservas.',
      confirmButtonText: 'Ir a Mis Reservas',
    })
    navigate(`/reservas?detalle=${encodeURIComponent(id)}&desbloquear=true`, {
      state: { detalleId: id, autoDesbloquear: true }
    })
  }

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: esModoOscuro ? '#0f172a' : '#f8fafc', color: esModoOscuro ? '#fff' : '#0f172a' }}>
        <p style={{ fontSize: 16, fontWeight: 700 }}>Cargando contrato de reserva...</p>
      </div>
    )
  }

  if (!reservaParaContrato || !vehiculoParaContrato) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: esModoOscuro ? '#0f172a' : '#f8fafc' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: esModoOscuro ? '#f8fafc' : '#0f172a' }}>
          No se encontró la reserva especificada
        </h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          No pudimos localizar la reserva con referencia {id}.
        </p>
        <Link
          to="/reservas"
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'var(--brand-primary, #2563eb)',
            color: 'var(--brand-on-primary, #fff)',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 12px var(--brand-shadow, rgba(37,99,235,0.25))'
          }}
        >
          Volver a Mis Reservas
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: esModoOscuro ? '#0f172a' : '#f1f5f9', position: 'relative' }}>
      {/* Barra superior de navegación */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: esModoOscuro ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: esModoOscuro ? '1px solid #1e293b' : '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          height: 80
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              type="button"
              onClick={() => navigate(`/reservas?detalle=${encodeURIComponent(id)}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: '10px',
                border: esModoOscuro ? '1px solid #334155' : '1px solid #cbd5e1',
                background: esModoOscuro ? '#1e293b' : '#ffffff',
                color: esModoOscuro ? '#f8fafc' : '#334155',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FaArrowLeft size={12} /> Volver a Mis Reservas
            </button>
            <Link to={usuario ? "/home" : "/"}>
              <img src={brand.logoDataUrl || logo} alt={brand.name || 'Drivique'} style={{ height: 42, objectFit: 'contain' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MenuConfiguracion />
          </div>
        </div>
      </nav>

      {/* Contenedor Principal */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Cabecera explicativa */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'var(--brand-soft-light, #EFF6FF)',
              border: '1px solid var(--brand-border-light, #BFDBFE)',
              color: 'var(--brand-primary, #2563eb)',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12
            }}
          >
            <FaShieldAlt size={13} />
            <span>Firma Digital Oficial</span>
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: esModoOscuro ? '#f8fafc' : '#0f172a',
              margin: '0 0 10px',
              letterSpacing: '-0.02em'
            }}
          >
            Lectura y Firma de Contrato de Alquiler
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: '#64748b',
              margin: 0,
              maxWidth: 620,
              marginInline: 'auto',
              lineHeight: 1.55
            }}
          >
            Tu reserva <strong style={{ color: 'var(--brand-primary, #2563eb)' }}>{id}</strong> ya fue confirmada. Lee detenidamente los términos y condiciones de alquiler y dibuja tu firma digital en el recuadro inferior para completar el proceso.
          </p>
        </div>

        {/* Visor de Contrato y Canvas de Firma */}
        <ContractSignature
          vehiculo={vehiculoParaContrato}
          reservaGuardada={reservaParaContrato}
          onFirmado={handleFirmado}
        />
      </main>
    </div>
  )
}
