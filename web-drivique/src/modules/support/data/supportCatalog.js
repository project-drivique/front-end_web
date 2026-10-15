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
    id: 'choque',
    nombre: 'Choque',
    icono: 'FaExclamationTriangle',
    tiempoEstimado: '2 a 4 horas',
  },
  {
    id: 'averia_mecanica',
    nombre: 'Avería Mecánica',
    icono: 'FaCar',
    tiempoEstimado: '2 a 4 horas',
  },
  {
    id: 'pinchazo',
    nombre: 'Pinchazo',
    icono: 'FaLifeRing',
    tiempoEstimado: '1 a 2 horas',
  },
  {
    id: 'bateria_descargada',
    nombre: 'Batería Descargada',
    icono: 'FaBolt',
    tiempoEstimado: '1 a 2 horas',
  },
  {
    id: 'falla_electrica',
    nombre: 'Falla Eléctrica',
    icono: 'FaBolt',
    tiempoEstimado: '1 a 2 horas',
  },
  {
    id: 'robo',
    nombre: 'Robo',
    icono: 'FaExclamationCircle',
    tiempoEstimado: 'Por definir',
  },
  {
    id: 'asistencia_general',
    nombre: 'Asistencia General',
    icono: 'FaExclamationCircle',
    tiempoEstimado: '1 hora',
  },
  {
    id: 'otro_problema',
    nombre: 'Otro',
    icono: 'FaQuestionCircle',
    tiempoEstimado: 'Por definir',
  },
]

// ─── INITIAL DUMMY REPORTS ────────────────────────────────────────────────────

// ─── PREGUNTAS FRECUENTES ───
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
