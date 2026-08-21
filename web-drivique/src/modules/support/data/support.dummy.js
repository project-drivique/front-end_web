// ─── CANALES DE ATENCIÓN ──────────────────────────────────────────────────────
export const CANALES_ATENCION = [
  {
    id: 'whatsapp',
    tipo: 'whatsapp',
    tituloKey: 'soporte.canales.whatsappTitle',
    tituloFallback: 'Chat de WhatsApp Directo',
    subtituloKey: 'soporte.canales.whatsappSub',
    subtituloFallback: 'Atención inmediata 24/7 - +57 314 478 9702',
    link: 'https://wa.me/573144789702?text=Hola,%20necesito%20asistencia%20con%20mi%20reserva%20en%20Drivique',
  },
  {
    id: 'telefono',
    tipo: 'telefono',
    tituloKey: 'soporte.canales.telefonoTitle',
    tituloFallback: 'Línea Telefónica de Atención',
    subtituloKey: 'soporte.canales.telefonoSub',
    subtituloFallback: '+57 322 3163531 - Soporte en carretera',
    link: 'tel:+573223163531',
  },
  {
    id: 'correo',
    tipo: 'correo',
    tituloKey: 'soporte.canales.correoTitle',
    tituloFallback: 'Correo Electrónico de Soporte',
    subtituloKey: 'soporte.canales.correoSub',
    subtituloFallback: 'soporte@drivique.com - Respuesta en menos de 2 horas',
    link: 'mailto:soporte@drivique.com',
  },
]

// ─── TIPOS DE INCIDENCIA ──────────────────────────────────────────────────────
export const TIPOS_INCIDENCIA = [
  {
    id: 'averia_mecanica',
    nombre: 'Avería mecánica',
    icono: 'FaCar',
    tiempoEstimado: '2 a 4 horas',
  },
  {
    id: 'falla_electrica',
    nombre: 'Falla eléctrica / Batería',
    icono: 'FaBolt',
    tiempoEstimado: '1 a 2 horas',
  },
  {
    id: 'pinchazo_neumatico',
    nombre: 'Pinchazo / Neumático',
    icono: 'FaLifeRing',
    tiempoEstimado: '1 a 2 horas',
  },
  {
    id: 'limpieza_estetica',
    nombre: 'Limpieza / Estética',
    icono: 'FaSparkles',
    tiempoEstimado: '12 horas',
  },
  {
    id: 'documentacion_licencia',
    nombre: 'Documentación / Licencia',
    icono: 'FaFileAlt',
    tiempoEstimado: '2 a 4 horas',
  },
  {
    id: 'otro_problema',
    nombre: 'Otro problema',
    icono: 'FaQuestionCircle',
    tiempoEstimado: '4 horas',
  },
]

// ─── INITIAL DUMMY REPORTS ────────────────────────────────────────────────────
export const INITIAL_REPORTS = [
  {
    id: 'REP-9102',
    codigo: 'REP-9102',
    tipoIncidenciaId: 'averia_mecanica',
    tipoIncidenciaNombre: 'Avería mecánica',
    vehiculo: 'Toyota Prado VX',
    placa: 'KLS-849',
    descripcion: 'Se encendió el testigo de revisión de motor en el tablero durante el trayecto a Neiva.',
    contactoNombre: 'Carlos Mendoza',
    contactoTelefono: '+57 314 478 9702',
    contactoEmail: 'cliente@drivique.com',
    tiempoEstimado: '2 a 4 horas',
    estado: 'en_atencion',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    evidenciasCount: 1,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Recibido',
        descripcion: 'Reporte registrado en el sistema.',
        hora: '11:20',
        color: '#2563eb',
      },
      {
        estadoKey: 'en_revision',
        titulo: 'En revisión',
        descripcion: 'Asignado al taller autorizado de la zona.',
        hora: '11:35',
        color: '#d97706',
      },
      {
        estadoKey: 'en_atencion',
        titulo: 'En atención',
        descripcion: 'Unidad móvil enviada con mecánico especializado.',
        hora: '12:10',
        color: '#8b5cf6',
      },
    ],
  },
  {
    id: 'REP-8401',
    codigo: 'REP-8401',
    tipoIncidenciaId: 'limpieza_estetica',
    tipoIncidenciaNombre: 'Limpieza / Estética',
    vehiculo: 'Chevrolet Spark GT',
    placa: 'HGF-123',
    descripcion: 'El interior del vehículo requeriría una limpieza adicional en la tapicería trasera.',
    contactoNombre: 'Carlos Mendoza',
    contactoTelefono: '+57 314 478 9702',
    contactoEmail: 'cliente@drivique.com',
    tiempoEstimado: '12 horas',
    estado: 'resuelto',
    fechaIso: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    evidenciasCount: 0,
    historial: [
      {
        estadoKey: 'recibido',
        titulo: 'Recibido',
        descripcion: 'Reporte registrado en el sistema.',
        hora: '09:00',
        color: '#2563eb',
      },
      {
        estadoKey: 'resuelto',
        titulo: 'Resuelto',
        descripcion: 'Limpieza profesional coordinada en el centro de servicio.',
        hora: '14:00',
        color: '#10b981',
      },
    ],
  },
]

// ─── EXACT FAQS FROM IMAGE UPLOADED BY USER ───────────────────────────────────
export const FAQS_INITIAL = [
  {
    id: 'faq-1',
    preguntaKey: 'soporte.faqs.q1',
    preguntaFallback: '¿Cómo se gestiona el cambio de estado del informe?',
    respuestaKey: 'soporte.faqs.a1',
    respuestaFallback: 'El estado del informe es actualizado exclusivamente por el equipo administrador técnico (Recibido, En revisión, En atención o Resuelto). Recibirás notificaciones por correo y en la aplicación cada vez que el administrador actualice tu caso.',
  },
  {
    id: 'faq-2',
    preguntaKey: 'soporte.faqs.q2',
    preguntaFallback: '¿Puedo modificar los datos de contacto del reporte?',
    respuestaKey: 'soporte.faqs.a2',
    respuestaFallback: 'Sí. Por defecto se precargan los datos de tu perfil registrado, pero puedes cambiarlos en el formulario si deseas que la atención en campo sea coordinada con otra persona o número telefónico.',
  },
  {
    id: 'faq-3',
    preguntaKey: 'soporte.faqs.q3',
    preguntaFallback: '¿Cómo se calcula el tiempo estimado de solución?',
    respuestaKey: 'soporte.faqs.a3',
    respuestaFallback: 'El tiempo se calcula automáticamente según la categoría de la incidencia seleccionada y la disponibilidad de unidades móviles de taller autorizados en tu zona.',
  },
  {
    id: 'faq-4',
    preguntaKey: 'soporte.faqs.q4',
    preguntaFallback: '¿Dónde puedo consultar el historial de contratos y reservas?',
    respuestaKey: 'soporte.faqs.a4',
    respuestaFallback: "Dirígete a la sección 'Mis Reservas' en la barra inferior para ver el detalle de tus vehículos, descargar contratos firmados en PDF o reportar incidencias específicas.",
  },
]
