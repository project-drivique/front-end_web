import { FaTimes, FaClock, FaShieldAlt, FaFileSignature, FaLock, FaEyeSlash, FaEye, FaStar } from 'react-icons/fa'
import ModalReservaInfoCard from './ModalReservaInfoCard'
import EsDomicilio from './EsDomicilio'
import EsPendienteEfectivo from './EsPendienteEfectivo'
import EsPendienteWompi from './EsPendienteWompi'
import EsDocumentosRechazados from './EsDocumentosRechazados'
import EstaEnCursoModal from './EstaEnCursoModal'
import EsFinalizadaModal from './EsFinalizadaModal'
import PuedeCancelarModal from './PuedeCancelarModal'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect, useMemo } from 'react'
import { contractService } from '@/services/contractService'
import { useNavigate } from 'react-router-dom'

function Contrato({ reserva }) {
  const { t } = useTranslation()
  const usuario = useAuthStore(state => state.usuario)
  const contratoFirmado = useContratoReal(reserva.id)
  const reservaAlmacenada = null

  // REGLA: Si no se ha firmado el contrato, la reserva NO pasa a confirmada

  const reservaParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.reserva || reservaAlmacenada || reserva || {}
    const df = base.datosForm || {}
    const rd = base.reservaDetalles || {}
    const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || base.clienteNombre || usuario?.nombre || t('hc2.cliente_drivique', 'Cliente Drivique')
    const correoCliente = df.correo || base.clienteCorreo || usuario?.correo || usuario?.email || ''
    const telCliente = df.celular || df.telefono || base.clienteTelefono || usuario?.telefono || ''
    const docCliente = df.numDoc || df.documento || base.clienteDocumento || usuario?.cedula || ''
    const ref = base.referencia || base.codigo || base.id || reserva.id

    const licName = df.licenciaPdf?.name || (typeof df.licenciaPdf === 'string' && df.licenciaPdf) 
    const cedName = df.cedulaPdf?.name || (typeof df.cedulaPdf === 'string' && df.cedulaPdf) 

    return {
      ...base,
      referencia: ref,
      codigo: ref,
      id: ref,
      total: base.total || base.totalCOP || reserva.total || 0,
      seguroIdx: base.seguroIdx ?? reserva.seguroIdx ?? 0,
      serviciosSeleccionados: base.serviciosSeleccionados || reserva.serviciosSeleccionados || [],
      datosForm: {
        ...df,
        nombre: nombreCliente,
        correo: correoCliente,
        celular: telCliente,
        telefono: telCliente,
        tipoDoc: df.tipoDoc || usuario?.tipoDocumento || 'CC',
        numDoc: docCliente,
        cedulaPdf: cedName,
        licenciaPdf: licName,
        direccion: df.direccion || usuario?.direccion || ''
      },
      reservaDetalles: {
        ...rd,
        fechaInicio: rd.fechaInicio || reserva.fechaInicio,
        fechaFin: rd.fechaFin || reserva.fechaFin,
        horaInicio: rd.horaInicio || '08:00',
        horaFin: rd.horaFin || '18:00',
        sucursalRetiro: rd.sucursalRetiro || reserva.sucursalRetiro || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursalDevolucion || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        metodoPago: rd.metodoPago || reserva.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
        sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || reserva.sucursal || reserva.vehiculo?.sucursal || ''
      }
    }
  }, [reserva, contratoFirmado, reservaAlmacenada, usuario])

  const vehiculoParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.vehiculo || reservaAlmacenada?.vehiculo || reserva.vehiculo || {}
    return {
      ...base,
      nombre: base.nombre || (base.marca ? `${base.marca} ${base.modelo || ''}` : t('hc2.vehiculo_drivique', 'Vehículo Drivique')),
      placa: base.placa || 'ABC-123',
      color: base.color || 'Plata',
      año: base.año || base.anio || 2024,
      sucursal: base.sucursal || reserva.sucursal || '',
      servicios: base.servicios || [],
      seguros: base.seguros || [{ nombre: t('hc2.proteccion_basica_estandar', 'Protección Básica Estándar') }]
    }
  }, [reserva, contratoFirmado, reservaAlmacenada])

  const identificacion = useMemo(() => {
    return reservaParaContrato?.datosForm?.numDoc || reserva.clienteDocumento || usuario?.cedula || ''
  }, [reservaParaContrato, reserva, usuario])

  return (
    <ContratoVerCard
      reserva={reserva}
      contratoFirmado={contratoFirmado}
      reservaParaContrato={reservaParaContrato}
      vehiculoParaContrato={vehiculoParaContrato}
      identificacion={identificacion}
    />
  )
}
function useContratoReal(reservationId) {
  const [contract, setContract] = useState(null)
  useEffect(() => {
    if (!reservationId) return
    contractService.obtenerPorReserva(reservationId).then(setContract).catch(() => setContract(null))
  }, [reservationId])
  return contract
}
function ContratoVerCard({ reserva, contratoFirmado, reservaParaContrato, vehiculoParaContrato, identificacion }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const tieneContratoFirmado = Boolean(
    contratoFirmado?.signatureUrl ||
    contratoFirmado?.signedAt ||
    contratoFirmado?.statusCode === 'ACTIVE' ||
    contratoFirmado?.firmaUsuarioDataUrl
  )
  const [error, setError] = useState('')
  const usuario = useAuthStore(state => state.usuario)
  const targetId = reserva.referencia || reserva.codigo || reserva.id

  const irAContrato = (soloLectura = false) => {
    navigate(`/contrato/${encodeURIComponent(targetId)}`, {
      state: {
        reserva: reservaParaContrato || reserva,
        vehiculo: vehiculoParaContrato || reserva.vehiculo,
        soloLectura
      }
    })
  }

  // Si el contrato aún NO ha sido firmado, mostrar directamente la acción para firmarlo
  if (!tieneContratoFirmado) {
    return (
      <div className="contrato-card desbloqueada" style={{ border: '1.5px solid var(--brand-primary)', background: 'linear-gradient(180deg, var(--brand-soft) 0%, #ffffff 100%)', borderRadius: '16px', padding: '18px 20px', marginTop: '16px' }}>
        <div className="contrato-subcard" style={{ textAlign: 'center' }}>
          <div className="contrato-icon-wrap" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-soft-strong)', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FaFileSignature size={22} />
          </div>

          <h3 className="contrato-card-titulo" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-text)', margin: '0 0 6px' }}>
            {t('reservas.readyToSign', { defaultValue: 'Firma de Contrato Digital Pendiente' })}
          </h3>

          <p className="contrato-card-desc" style={{ fontSize: '13px', color: '#334155', margin: '0 0 16px', lineHeight: 1.5 }}>
            {t('reservas.readyToSignDesc', { defaultValue: 'Tu pago ha sido confirmado con éxito. Procede a firmar digitalmente tu contrato para completar la reserva y acceder al documento protegido.' })}
          </p>

          <button
            type="button"
            onClick={() => irAContrato(false)}
            className="contrato-action-btn activo"
            style={{ width: '100%', padding: '12px 20px', background: 'linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%)', color: '#ffffff', borderRadius: '10px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb),0.25)' }}
          >
            <FaFileSignature size={15} />
            <span>{t('reservas.signContractNow', { defaultValue: 'Proceder a Firmar Contrato' })}</span>
          </button>
        </div>
      </div>
    )
  }

  const validar = () => {
    if (!clave || !clave.trim()) {
      setError(t('reservas.noIdentification', { defaultValue: 'Por favor ingresa tu número de identificación o clave.' }))
      return
    }

    // Solo se abre con la cédula o identificación registrada en la reserva; ninguna otra clave sirve
    const normalizar = (v) => String(v || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const c = normalizar(clave)
    const registradas = [
      identificacion,
      reservaParaContrato?.datosForm?.numDoc,
      reserva.clienteDocumento,
      contratoFirmado?.contratoOriginal?.reserva?.datosForm?.numDoc,
      usuario?.cedula,
    ].map(normalizar).filter(Boolean)

    if (c && registradas.includes(c)) {
      setError('')
      irAContrato(true)
    } else {
      setError(t('reservas.wrongIdentification', { defaultValue: 'La clave ingresada no coincide.' }))
    }
  }

  return (
    <div className="contrato-card desbloqueada">
      <div className="contrato-subcard">
        <div className="contrato-icon-wrap">
          <FaLock size={22} />
        </div>

        <h3 className="contrato-card-titulo">
          {t('reservas.contractProtected', { defaultValue: 'Contrato firmado y protegido' })}
        </h3>

        <p className="contrato-card-desc">
          {t('reservas.enterIdToViewContract', { defaultValue: 'Ingresa tu número de documento o clave para ver y descargar tu contrato oficial.' })}
        </p>

        <div className="contrato-card-form">
          <div className="contrato-input-box">
            <input
              id="input-clave-contrato"
              type={mostrarClave ? 'text' : 'password'}
              value={clave}
              onChange={(e) => { setClave(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && validar()}
              placeholder={t('reservas.enterPasswordPlaceholder', { defaultValue: 'Ingrese su clave o documento' })}
              aria-label={t('reservas.enterPasswordPlaceholder', { defaultValue: 'Ingrese su clave o documento' })}
              className="contrato-card-input"
            />
            <button
              type="button"
              onClick={() => setMostrarClave(v => !v)}
              aria-label={mostrarClave ? t('reservas.hidePassword', { defaultValue: 'Ocultar clave' }) : t('reservas.showPassword', { defaultValue: 'Mostrar clave' })}
              className="contrato-eye-btn"
            >
              {mostrarClave ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="contrato-error-msg">{error}</p>}

          <button
            type="button"
            onClick={validar}
            className="contrato-action-btn activo"
          >
            <span>{t('reservas.viewContract', { defaultValue: 'Ver y Descargar Contrato' })}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
function MiResena({ eligibility }) {
  const { t } = useTranslation()
  const items = [
    { clave: 'vehiculo', titulo: t('reservas.myVehicleReview', { defaultValue: 'Tu reseña del vehículo' }), resena: eligibility?.vehicleReview },
    { clave: 'sucursal', titulo: t('reservas.myBranchReview', { defaultValue: 'Tu reseña de la sucursal' }), resena: eligibility?.branchReview },
  ].filter((i) => i.resena)
  if (items.length === 0) return null
  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(({ clave, titulo, resena }) => (
        <div key={clave} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 13, color: '#92400e' }}>{titulo}</strong>
            <span aria-label={`${resena.rating} de 5 estrellas`} style={{ display: 'inline-flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} size={15} color={n <= Number(resena.rating) ? '#f59e0b' : '#e2e8f0'} />)}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: resena.comment ? '#78350f' : '#a16207', fontStyle: resena.comment ? 'normal' : 'italic' }}>
            {resena.comment || t('reservas.noCommentLeft', { defaultValue: 'Calificaste sin dejar un comentario.' })}
          </p>
        </div>
      ))}
    </div>
  )
}
const resenaPendiente = (r) => (!r.valoracion && (!r.eligibility || r.eligibility.canReviewVehicle)) || Boolean(r.eligibility?.canReviewBranch)

export default function DetalleModal({ autoDesbloquear, brand, cancelando, ciudadPago, direccionPago, domicilioConductor, domicilioDevolucion, domicilioEstado, domicilioPin, domicilioRetiro, domicilioTelefonoConductor, esConfirmadaModal, esDocumentosRechazados, esDomicilio, esDomicilioDevolucion, esDomicilioRetiro, esFinalizadaModal, esPendienteEfectivo, esPendienteHorario, esPendienteValidacion, esPendienteWompi, estaEnCursoModal, estado, formatHoraAmPm, handleCancelarReserva, handlePagarWompi, i18n, imagenAuto, lugarDevolucion, lugarRetiro, medioPagoTexto, moneda, navigate, nombreAuto, onCancelar, onClose, onReportar, onValorar, pagandoWompi, proteccion, puedeCancelarModal, requiereFirmaModal, reserva, reservaOriginal, revelarPin, setRevelarPin, setVerMasDomicilio, sucursalPago, t, totalCalculado, verMasDomicilio, wompiCardRef }) {
  return (
    <section
          className="detalle-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalle-reserva-titulo"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="detalle-modal-acento" />
          
          <button
            className="modal-cerrar"
            onClick={onClose}
            aria-label={t('reservas.closeDetail', { defaultValue: 'Cerrar' })}
          >
            <FaTimes size={14} />
          </button>
  
          {/* Encabezado */}
          <div className="detalle-modal-head-custom">
            <h2 id="detalle-reserva-titulo" className="detalle-modal-titulo">
              {esPendienteEfectivo
                ? t('reservas.pendingCashPayment', { defaultValue: 'Pendiente de pago en efectivo' })
                : (esPendienteWompi ? t('reservas.pendingDigitalPayment', { defaultValue: 'Pago Digital Pendiente' }) : t('reservas.reservationWithStatus', { status: estado.texto.toLowerCase(), defaultValue: `Reserva ${estado.texto.toLowerCase()}` }))}
            </h2>
            <p className="detalle-modal-subtitulo">
              {nombreAuto}
            </p>
          </div>
  
          {/* Tarjeta Padre: Contenedor de Galería y Datos */}
          <ModalReservaInfoCard estado={estado} formatHoraAmPm={formatHoraAmPm} i18n={i18n} imagenAuto={imagenAuto} lugarDevolucion={lugarDevolucion} lugarRetiro={lugarRetiro} medioPagoTexto={medioPagoTexto} moneda={moneda} nombreAuto={nombreAuto} proteccion={proteccion} reserva={reserva} t={t} totalCalculado={totalCalculado} />
  
          {/* Tarjeta de Domicilio (Logo, Código Nequi sin vencimiento, Campos Completos + Hora) */}
          {esDomicilio && (
            <EsDomicilio brand={brand} ciudadPago={ciudadPago} domicilioConductor={domicilioConductor} domicilioDevolucion={domicilioDevolucion} domicilioEstado={domicilioEstado} domicilioPin={domicilioPin} domicilioRetiro={domicilioRetiro} domicilioTelefonoConductor={domicilioTelefonoConductor} esDomicilioDevolucion={esDomicilioDevolucion} esDomicilioRetiro={esDomicilioRetiro} formatHoraAmPm={formatHoraAmPm} reserva={reserva} reservaOriginal={reservaOriginal} revelarPin={revelarPin} setRevelarPin={setRevelarPin} setVerMasDomicilio={setVerMasDomicilio} t={t} verMasDomicilio={verMasDomicilio} />
          )}
  
          {/* Tarjeta de Pago en Efectivo por Sucursal */}
          {esPendienteEfectivo && (
            <EsPendienteEfectivo brand={brand} ciudadPago={ciudadPago} direccionPago={direccionPago} moneda={moneda} reserva={reserva} sucursalPago={sucursalPago} t={t} totalCalculado={totalCalculado} />
          )}
  
          {/* Tarjeta de Pago Digital Pendiente Wompi (si aplica) */}
          {esPendienteWompi && (
            <EsPendienteWompi handlePagarWompi={handlePagarWompi} moneda={moneda} pagandoWompi={pagandoWompi} reserva={reserva} t={t} totalCalculado={totalCalculado} wompiCardRef={wompiCardRef} />
          )}
  
          {/* Tarjeta de Reserva en Espera de Horario de Atención */}
          {esPendienteHorario && (
            <div className="modal-wompi-card" style={{ borderColor: 'rgba(var(--brand-primary-rgb), 0.4)', background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.7) 0%, rgba(255, 255, 255, 1) 100%)' }}>
              <div className="modal-wompi-subcard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaClock style={{ fontSize: '24px', color: 'var(--brand-text)' }} />
                  <h3 className="modal-wompi-titulo" style={{ margin: 0, color: 'var(--brand-text)' }}>
                    En Espera de Apertura de Sucursal
                  </h3>
                </div>
                <p className="modal-wompi-desc" style={{ color: 'var(--brand-text)' }}>
                  Tu reserva fue registrada fuera del horario de atención de la sucursal <strong>{reserva.sucursal || sucursalPago}</strong>. En cuanto la sede inicie su jornada de atención, recibirás una notificación automática por correo, web y push para proceder con el pago y confirmación de tu reserva.
                </p>
                <div style={{ padding: '10px 14px', background: 'var(--brand-soft-strong)', borderRadius: '10px', fontSize: '13px', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <FaClock /> Estado: Esperando apertura de sucursal
                </div>
              </div>
            </div>
          )}
  
          {/* Tarjeta de Documentación en Proceso de Validación */}
          {esPendienteValidacion && (
            <div className="modal-wompi-card" style={{ borderColor: 'rgba(var(--brand-primary-rgb), 0.4)', background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.7) 0%, rgba(255, 255, 255, 1) 100%)' }}>
              <div className="modal-wompi-subcard">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaShieldAlt style={{ fontSize: '24px', color: 'var(--brand-text)' }} />
                  <h3 className="modal-wompi-titulo" style={{ margin: 0, color: 'var(--brand-text)' }}>
                    Documentación en Proceso de Validación
                  </h3>
                </div>
                <p className="modal-wompi-desc" style={{ color: 'var(--brand-text)' }}>
                  Tus documentos de identidad y licencia de conducción están siendo revisados por el encargado de la sucursal <strong>{reserva.sucursal || sucursalPago}</strong>. En cuanto los documentos sean aprobados, tu reserva se confirmará automáticamente y se habilitará la firma digital del contrato.
                </p>
                <div style={{ padding: '10px 14px', background: 'var(--brand-soft-strong)', borderRadius: '10px', fontSize: '13px', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <FaClock /> Estado: En revisión por encargado de sucursal
                </div>
              </div>
            </div>
          )}
  
          {/* Tarjeta de Documentación Rechazada */}
          {esDocumentosRechazados && (
            <EsDocumentosRechazados navigate={navigate} reserva={reserva} sucursalPago={sucursalPago} t={t} />
          )}
  
          {(esConfirmadaModal || requiereFirmaModal) && <Contrato reserva={reserva} autoDesbloquear={autoDesbloquear} />}
  
          {estaEnCursoModal && onReportar && (
            <EstaEnCursoModal onReportar={onReportar} reserva={reserva} t={t} />
          )}
  
          {esFinalizadaModal && <MiResena eligibility={reserva.eligibility} />}
  
          {esFinalizadaModal && onValorar && resenaPendiente(reserva) && (
            <EsFinalizadaModal onValorar={onValorar} reserva={reserva} t={t} />
          )}
  
          {puedeCancelarModal && onCancelar && (
            <PuedeCancelarModal cancelando={cancelando} handleCancelarReserva={handleCancelarReserva} t={t} />
          )}
  
        </section>
  )
}
