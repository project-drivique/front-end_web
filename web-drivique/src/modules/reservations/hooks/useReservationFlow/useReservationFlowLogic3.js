import { showAlert, getErrorMessage } from '@/utils/swalConfig'
import { userService } from '@/services/userService'
import { diasDeAlquiler } from '../../utils/pricing'
import { generarReferenciaUnica, aCentavos } from '@/services/wompiService'
import { branchManagementService } from '../../../../services/branchManagementService'
import { reservationsService } from '@/services/reservationsService'
import { SUCURSALES } from '../../../catalog/constants'

const getItemPrice = (item) => Number(item?.precio ?? item?.dailyRate ?? item?.price ?? 0)

export default function useReservationFlowLogic3({ actualizarUsuario, appliedPromotion, branchObj, cotizacion, datosForm, docsVerificados, idUsuarioDocs, isSubmittingRef, navigate, procesandoReserva, reserva, sedesCatalog, seguroIdx, serviciosSeleccionados, setContratoFirmado, setDatosPago, setDocsVerificados, setErrores, setExito, setFechaLimitePago, setProcesandoReserva, setReservaCreada, storageKey, t, tarifaDiariaVehiculo, usuario, vehiculo }) {
  const handleReservar = async () => {
      if (isSubmittingRef.current || procesandoReserva) {
        console.warn('handleReservar already in progress, ignoring duplicate call.')
        return
      }
  
      if (!usuario) {
        showAlert({
          icon: 'info',
          title: t('catalogo.guestMode'),
          text: t('catalogo.guestModeText'),
          confirmButtonText: t('catalogo.goToRegister'),
          showCancelButton: true,
          cancelButtonText: t('common.cancel'),
        }).then((result) => { if (result.isConfirmed) navigate('/registro') })
        return
      }
  
      // ─── 1. Validación de Datos Personales y Documentación Obligatoria ─────────
      const e = {}
  
      if (!datosForm.nombre?.trim()) e.nombre = t('vehiculo.errors.nameRequired', 'El nombre es obligatorio.')
      if (!datosForm.nacionalidad?.trim()) e.nacionalidad = t('vehiculo.errors.nationalityRequired', 'Debes seleccionar tu nacionalidad.')
      if (!datosForm.tipoDoc?.trim()) e.tipoDoc = t('vehiculo.errors.docTypeRequired', 'Debes seleccionar el tipo de documento.')
      if (!datosForm.numDoc?.trim()) e.numDoc = t('vehiculo.errors.docRequired', 'El número de documento es obligatorio.')
      if (!datosForm.correo?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo)) e.correo = t('vehiculo.errors.emailInvalid', 'El correo electrónico no es válido.')
      if (!datosForm.celular?.trim() || datosForm.celular.trim().length < 10) e.celular = t('vehiculo.errors.phoneInvalid', 'El número celular debe tener al menos 10 dígitos.')
      if (!docsVerificados && !datosForm.cedulaPdf) e.cedulaPdf = t('vehiculo.errors.cedulaPdfRequired', 'Debes subir tu documento de identidad en formato PDF.')
      if (!docsVerificados && !datosForm.licenciaPdf) e.licenciaPdf = t('vehiculo.errors.licenciaPdfRequired', 'Debes subir tu licencia de conducción en formato PDF.')
      if (!datosForm.terminos) e.terminos = t('vehiculo.errors.termsRequired', 'Debes aceptar los términos y condiciones.')
  
      setErrores(e)
  
      if (Object.keys(e).length > 0) {
        showAlert({
          icon: 'warning',
          title: t('hc.informacion_incompleta', 'Información incompleta'),
          text: t('hc.por_favor_completa_todos_los_campos_ob', 'Por favor completa todos los campos obligatorios y adjunta los documentos requeridos para confirmar tu reserva.'),
          confirmButtonText: t('hc4.entendido', 'Entendido'),
          confirmButtonColor: 'var(--brand-primary)',
        })
        return
      }
  
      isSubmittingRef.current = true
      setProcesandoReserva(true)
  
      try {
        // ─── 2. Validación de Documentación KYC Rechazada / Observaciones ────────
      try {
        const documentos = await userService.getDocuments()
        const listaDocumentos = Array.isArray(documentos) ? documentos : (documentos?.documents || [])
        const hayDocumentosNuevos = datosForm.cedulaPdf instanceof File || datosForm.licenciaPdf instanceof File
        const rechazado = listaDocumentos.find((documento) => String(documento.statusCode || documento.status || documento.estado).toUpperCase() === 'REJECTED')
        if (!hayDocumentosNuevos && rechazado) {
          const confirmRechazado = await showAlert({
            icon: 'warning',
            title: t('hc.documentacion_con_observaciones', 'Documentación con observaciones'),
            text: rechazado?.reviewNotes || rechazado?.observaciones || t('hc2.uno_o_mas_de_tus_documentos_requiere_c', 'Uno o más de tus documentos requiere corrección. Te recomendamos subir la versión corregida.'),
            showCancelButton: true,
            confirmButtonText: t('hc2.continuar_de_todos_modos', 'Continuar de todos modos'),
            cancelButtonText: t('hc4.corregir_documentos', 'Corregir documentos'),
          })
          if (!confirmRechazado.isConfirmed) {
            return
          }
        }
      } catch {
        // Ignorar error al leer documentos para no bloquear el flujo
      }
  
      // ─── 3. Validación de Horario de Atención de la Sucursal ─────────────────
      const branchName = reserva.sucursalRetiro || vehiculo?.sucursal || vehiculo?.sucursalInfo?.nombre || ''
      const currentBranch = sedesCatalog.find(
        (s) => s.id === vehiculo?.sucursalId || s.name === branchName || s.nombre === branchName
      )
  
      let isOutsideSchedule = false
      let openingTimeStr = '08:00'
      let closingTimeStr = '18:00'
  
      if (currentBranch && currentBranch.openingTime && currentBranch.closingTime) {
        const openRaw = String(currentBranch.openingTime).slice(0, 5)
        const closeRaw = String(currentBranch.closingTime).slice(0, 5)
        openingTimeStr = openRaw
        closingTimeStr = closeRaw
  
        const is24Hours =
          (openRaw === '00:00' && (closeRaw === '23:59' || closeRaw === '24:00')) ||
          openRaw === closeRaw
  
        if (!is24Hours) {
          // Evaluar hora actual en zona horaria de Colombia (America/Bogota - UTC-5)
          const nowBogota = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'America/Bogota',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(new Date())
  
          if (openRaw < closeRaw) {
            isOutsideSchedule = nowBogota < openRaw || nowBogota > closeRaw
          } else {
            isOutsideSchedule = nowBogota < openRaw && nowBogota > closeRaw
          }
        }
      }
  
      let outsideScheduleAccepted = false
      if (isOutsideSchedule) {
        const branchDisplay = currentBranch?.name || currentBranch?.nombre || branchName || t('hc5.the_branch', 'la sucursal')
        const alertResult = await showAlert({
          icon: 'info',
          title: t('hc.sucursal_fuera_de_horario_de_atencion', 'Sucursal fuera de horario de atención'),
          html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.6; color: var(--texto-primary, #1e293b);">
              <p style="margin-bottom: 12px;">
                ${t('hc5.outside_p1', { defaultValue: 'La sucursal <strong>{{sucursal}}</strong> tiene un horario de atención de <strong>{{apertura}}</strong> a <strong>{{cierre}}</strong>.', sucursal: branchDisplay, apertura: openingTimeStr, cierre: closingTimeStr })}
              </p>
              <p style="margin-bottom: 12px; color: #b45309; background: #fef3c7; padding: 10px 14px; border-radius: 8px; border: 1px solid #fde68a;">
                ${t('hc5.outside_p2', '⏱️ En este momento se encuentra cerrada, pero puedes registrar tu reserva ahora y quedará en estado <strong>PENDIENTE</strong>.')}
              </p>
              <p style="margin: 0; color: var(--texto-second, #64748b); font-size: 13px;">
                ${t('hc5.outside_p3', { defaultValue: 'Mañana a las <strong>{{apertura}}</strong> te notificaremos por correo electrónico, notificación web y push para que puedas continuar con tu reserva.', apertura: openingTimeStr })}
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: t('hc2.registrar_como_pendiente', 'Registrar como pendiente'),
          cancelButtonText: t('hc4.regresar', 'Regresar'),
          confirmButtonColor: 'var(--brand-primary)',
          cancelButtonColor: '#64748b',
          width: 480,
        })
  
        if (!alertResult.isConfirmed) {
          return
        }
        outsideScheduleAccepted = true
      }
  
      const tarifas = vehiculo.tarifas || {}
      const precioKm = reserva.tipoKm === 'ilimitado'
        ? Number(tarifas.kmIlimitado?.precio || 0)
        : (reserva.tipoKm === 'limitado' ? Number(tarifas.kmLimitado?.precio || 0) : 0)
      const dias = diasDeAlquiler(reserva)
      const precioSeguro = seguroIdx !== null ? getItemPrice(vehiculo.seguros[seguroIdx]) : 0
      const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre))
      const precioServicios = serviciosElegidos.reduce((suma, s) => suma + getItemPrice(s), 0)
      const subtotal = (tarifaDiariaVehiculo + precioKm + precioSeguro + precioServicios) * dias
      const finalTotalCop = cotizacion ? Number(cotizacion.estimatedTotal) : subtotal
  
      const referencia = generarReferenciaUnica()
  
      if (usuario && actualizarUsuario) {
        const partesNombre = (datosForm.nombre || '').trim().split(' ')
        const primerNombre = partesNombre.length > 1 ? partesNombre.slice(0, -1).join(' ') : partesNombre[0] || ''
        const primerApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : ''
        const datosPerfil = {
          nombre: primerNombre || datosForm.nombre || usuario.nombre,
          apellido: primerApellido || datosForm.apellido || usuario.apellido || '',
          cedula: datosForm.numDoc || usuario.cedula,
          telefono: datosForm.celular || usuario.telefono,
          nacionalidad: datosForm.nacionalidad || usuario.nacionalidad,
          tipoDocumento: datosForm.tipoDoc || usuario.tipoDocumento,
        }
        try {
          await userService.actualizarPerfil(datosPerfil)
          actualizarUsuario(datosPerfil)
        } catch (errPerfil) {
          console.warn('Advertencia al sincronizar perfil en reserva:', errPerfil)
          const errorDetail = String(errPerfil?.response?.data?.detail || errPerfil?.response?.data?.message || errPerfil?.message || '').toLowerCase()
          const status = errPerfil?.response?.status
          if (status === 409 && (errorDetail.includes('document') || errorDetail.includes('cedula') || errorDetail.includes('cédula') || errorDetail.includes('duplicate') || errorDetail.includes('unique'))) {
            showAlert({
              icon: 'error',
              title: t('hc.documento_ya_registrado', 'Documento ya registrado'),
              text: t('hc.el_numero_de_documento_ya_esta_asociado', 'El número de documento ingresado ya se encuentra registrado con otra cuenta de usuario. Por favor verifica tus datos.')
            })
            return
          }
        }
      }
  
      let requiereValidacionDocs = false
      if (idUsuarioDocs && (datosForm.cedulaPdf || datosForm.licenciaPdf || !docsVerificados)) {
        if (datosForm.cedulaPdf instanceof File || datosForm.licenciaPdf instanceof File) {
          try {
            const { data: tipos } = await import('@/services/httpClient').then(({ api }) => api.get('/kyc/document-types'))
            const lista = Array.isArray(tipos) ? tipos : (tipos?.documentTypes || [])
            const codigoIdentidad = String(datosForm.tipoDoc || 'CC').trim().toUpperCase()
            const tipoCedula = lista.find((t) => String(t.code || '').toUpperCase() === codigoIdentidad)
            const tipoLicencia = lista.find((t) => String(t.code || '').toUpperCase() === 'DRIVER_LICENSE')
  
            const targetBranchId =
              vehiculo?.branchId ||
              vehiculo?.sucursalId ||
              vehiculo?.currentBranchId ||
              branchObj?.id ||
              currentBranch?.id ||
              (reserva?.sucursalRetiro ? sedesCatalog.find((s) => s.name === reserva.sucursalRetiro || s.nombre === reserva.sucursalRetiro)?.id : null) ||
              sedesCatalog[0]?.id
  
            const docNumber = datosForm.numDoc || datosForm.documento || datosForm.cedula || usuario?.cedula || ''
  
            if (datosForm.cedulaPdf instanceof File && tipoCedula?.id && targetBranchId) {
              await userService.uploadTypedDocument({
                documentTypeId: tipoCedula.id,
                documentNumber: docNumber,
                branchId: targetBranchId,
                frontFile: datosForm.cedulaPdf,
              })
            }
            if (datosForm.licenciaPdf instanceof File && tipoLicencia?.id && targetBranchId) {
              await userService.uploadTypedDocument({
                documentTypeId: tipoLicencia.id,
                documentNumber: docNumber,
                branchId: targetBranchId,
                frontFile: datosForm.licenciaPdf,
              })
            }
          } catch (docErr) {
            console.warn('Document upload warning:', docErr)
            const specificMsg = getErrorMessage(docErr, t('hc.error_subir_documentos_gen', 'Error al cargar los documentos de identidad o licencia.'))
            throw new Error(`${t('hc.error_subir_documentos', 'Error al cargar documentos')}: ${specificMsg}`, { cause: docErr })
          }
        }
        requiereValidacionDocs = true
        setDocsVerificados(false)
      }
  
      const clienteNombreFinal = datosForm.nombre || [datosForm.nombres, datosForm.apellidos].filter(Boolean).join(' ') || usuario?.nombre || t('hc2.cliente_drivique', 'Cliente Drivique')
      const clienteCorreoFinal = datosForm.correo || datosForm.email || usuario?.correo || usuario?.email || ''
      const clienteTelFinal = datosForm.celular || datosForm.telefono || usuario?.telefono || ''
      const clienteDocFinal = datosForm.numDoc || datosForm.documento || datosForm.cedula || usuario?.cedula || ''
  
      let dRetiro = new Date(`${reserva.fechaInicio}T${reserva.horaInicio || '10:00'}:00`)
        let dDevolucion = new Date(`${reserva.fechaFin}T${reserva.horaFin || '10:00'}:00`)
        const ahora = new Date().getTime()
        if (dRetiro.getTime() < ahora) {
          const hoyLocal = new Date()
          const fInicioStr = reserva.fechaInicio ? String(reserva.fechaInicio).split('T')[0] : ''
          const hoyStr = `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, '0')}-${String(hoyLocal.getDate()).padStart(2, '0')}`
          if (fInicioStr === hoyStr) {
            dRetiro = new Date(ahora + 2 * 60 * 1000)
            if (dDevolucion.getTime() <= dRetiro.getTime()) {
              dDevolucion = new Date(dRetiro.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
  
        const datosParaBackend = {
          vehicleId: vehiculo.id,
          pickupDate: dRetiro.toISOString(),
          returnDate: dDevolucion.toISOString(),
          insuranceCoverageId: vehiculo.seguros[seguroIdx]?.id || null,
          mileagePlanId: reserva.tipoKm === 'ilimitado' ? (tarifas.kmIlimitado?.id || null) : (tarifas.kmLimitado?.id || null),
          additionalServiceIds: (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre)).map(s => s.id).filter(Boolean),
          couponCode: appliedPromotion ? appliedPromotion.codigo : null,
          cashPaymentBranchId: reserva.metodoPago === 'efectivo'
            ? (branchManagementService.getCashAuthorized().find(b => b.nombre === reserva.sucursalPagoEfectivo)?.id || vehiculo.sucursalId || null)
            : null,
          outsideScheduleAccepted: Boolean(outsideScheduleAccepted),
          customerInfo: {
            name: clienteNombreFinal,
            email: clienteCorreoFinal,
            phone: clienteTelFinal,
            document: clienteDocFinal,
            tipoDoc: datosForm.tipoDoc || usuario?.tipoDocumento || 'CC'
          },
          metodoPago: reserva.metodoPago,
          total: finalTotalCop,
          sucursalRetiro: reserva.sucursalRetiro,
          sucursalDevolucion: reserva.sucursalDevolucion
        }
  
        // ─── 3. Creación en Backend (Sin fallback silencioso) ─────────────────
        const holdResult = await reservationsService.crearReserva(datosParaBackend)
        const totalServidor = Number(holdResult?.totalEstimated) || finalTotalCop
  
        // Entrega/devolución a domicilio: el servidor las guarda aparte (sin esto el encargado nunca ve el domicilio)
        if ((reserva.sucursalRetiro === 'domicilio' || reserva.sucursalDevolucion === 'domicilio') && holdResult?.id) {
          const sedeVehiculo = SUCURSALES.find((b) => b.nombre === vehiculo?.sucursal)
          const punto = (pointType, esDomicilio) => (esDomicilio
            ? { pointType, modality: 'HOME_DELIVERY', cityId: sedeVehiculo?.cityId, neighborhood: reserva.domicilioBarrio, address: reserva.domicilioDireccion, referenceDetails: reserva.domicilioReferencias || undefined }
            : { pointType, modality: 'BRANCH', branchId: sedeVehiculo?.id || vehiculo?.sucursalId })
          try {
            await reservationsService.configurarPuntosEntrega(holdResult.id, [
              punto('PICKUP', reserva.sucursalRetiro === 'domicilio'),
              punto('RETURN', reserva.sucursalDevolucion === 'domicilio'),
            ])
          } catch (errorPuntos) {
            console.error('No se pudo guardar el domicilio de la reserva', errorPuntos)
            showAlert({
              icon: 'warning',
              title: t('hc6.home_not_saved_title', 'No se pudo guardar el domicilio'),
              text: errorPuntos?.response?.data?.detail || errorPuntos?.response?.data?.message || t('hc6.home_not_saved', 'La reserva se creó, pero la dirección de entrega no se guardó. Contacta a la sucursal.'),
            })
          }
        }
        
        const refFinal = holdResult?.code || holdResult?.id || holdResult?.holdId || referencia
        if (holdResult?.cashPaymentExpiresAt) {
          setFechaLimitePago(holdResult.cashPaymentExpiresAt)
        } else if (holdResult?.fechaLimitePago) {
          setFechaLimitePago(holdResult.fechaLimitePago)
        }
        
        const estadoInicial = holdResult?.status || (outsideScheduleAccepted
          ? 'PENDING_SCHEDULE'
          : (requiereValidacionDocs ? 'PENDING_DOCUMENT_REVIEW' : (reserva.metodoPago === 'efectivo' ? 'PENDIENTE_EFECTIVO' : 'pendiente')))
  
        sessionStorage.setItem('current_wompi_reference', refFinal)
        setReservaCreada({
          ...holdResult,
          id: holdResult?.id || refFinal,
          referencia: refFinal,
          codigo: refFinal,
          horasLimitePago: 8,
          total: totalServidor,
          estado: estadoInicial,
          status: estadoInicial
        })
        setDatosPago({ referencia: refFinal, amountInCents: aCentavos(totalServidor) })
        setExito(true)
  
        sessionStorage.removeItem(storageKey)
      } catch (error) {
        console.error('Error creating reservation hold:', error)
        const errorMsg = getErrorMessage(error, t('hc2.no_se_pudo_crear_la_reserva_en_el_serv', 'No se pudo crear la reserva en el servidor. Por favor intenta de nuevo.'))
        const errorMsgLower = String(errorMsg || '').toLowerCase()
  
        if (
          error?.response?.status === 409 &&
          (errorMsgLower.includes('debido a otra reserva') ||
            errorMsgLower.includes('no se encuentra disponible en las fechas') ||
            errorMsgLower.includes('overlapping') ||
            errorMsgLower.includes('overlap'))
        ) {
          showAlert({
            icon: 'warning',
            title: t('hc.vehiculo_no_disponible', 'Vehículo no disponible'),
            text: t('hc.vehiculo_apartado_desc', 'Otro cliente acaba de apartar este vehículo para estas fechas mientras completabas el formulario. Si no completa su pago dentro del plazo, volverá a estar libre. También puedes explorar otros vehículos disponibles en el catálogo.'),
            confirmButtonText: t('hc.ver_otros_vehiculos', 'Ver otros vehículos'),
            showCancelButton: true,
            cancelButtonText: t('common.close', 'Cerrar'),
          }).then((result) => {
            if (result.isConfirmed) navigate('/catalogo')
          })
        } else {
          showAlert({
            icon: 'error',
            title: t('hc.error_al_registrar_reserva', 'Error al registrar reserva'),
            text: errorMsg
          })
        }
      } finally {
        isSubmittingRef.current = false
        setProcesandoReserva(false)
      }
    }
  
    const handleContratoFirmado = () => {
      setContratoFirmado(true)
      setExito(true)
    }

  return { handleReservar, handleContratoFirmado }
}
