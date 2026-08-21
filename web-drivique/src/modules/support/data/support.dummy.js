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
    estado: 'en_atencion', // 'recibido' | 'en_revision' | 'en_atencion' | 'resuelto'
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

// ─── FAQS ────────────────────────────────────────────────────────────────────
export const FAQS_INITIAL = [
  {
    id: 'faq-1',
    preguntaKey: 'soporte.faqs.q1',
    preguntaFallback: '¿Qué debo hacer si el vehículo sufre una avería en carretera?',
    respuestaKey: 'soporte.faqs.a1',
    respuestaFallback: 'Estaciónese en un lugar seguro, encienda las luces de emergencia y utilice la pestaña "Reportar incidencia" en esta sección o comuníquese a nuestra línea de asistencia en carretera 24/7.',
  },
  {
    id: 'faq-2',
    preguntaKey: 'soporte.faqs.q2',
    preguntaFallback: '¿Cómo funciona la asistencia mecánica o de grúa?',
    respuestaKey: 'soporte.faqs.a2',
    respuestaFallback: 'Contamos con una red nacional de unidades móviles y talleres autorizados. Una vez reportada la incidencia, coordinamos la grúa o mecánico sin costo adicional si está cubierto por tu plan de protección.',
  },
  {
    id: 'faq-3',
    preguntaKey: 'soporte.faqs.q3',
    preguntaFallback: '¿Puedo cambiar de vehículo si el reporte toma mucho tiempo?',
    respuestaKey: 'soporte.faqs.a3',
    respuestaFallback: 'Sí, si la falla técnica supera un tiempo de solución razonable, nuestro equipo de soporte coordinará un vehículo de reemplazo de categoría equivalente en la sucursal más cercana.',
  },
]
