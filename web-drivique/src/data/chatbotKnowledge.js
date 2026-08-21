// Knowledge base & response generator for Drivique Interactive Chatbot

export const getBotQuickActions = (t) => [
  {
    id: 'alquilar',
    label: t('chatbot.actions.alquilar', '🚗 ¿Cómo alquilar un vehículo?'),
    key: 'alquilar',
  },
  {
    id: 'requisitos',
    label: t('chatbot.actions.requisitos', '📋 ¿Cuáles son los requisitos?'),
    key: 'requisitos',
  },
  {
    id: 'pagos',
    label: t('chatbot.actions.pagos', '💰 Métodos de pago y depósitos'),
    key: 'pagos',
  },
  {
    id: 'agente',
    label: t('chatbot.actions.agente', '👤 Hablar con un agente (WhatsApp/Teléfono)'),
    key: 'agente',
  },
]

export const getBotResponses = (t, moneda, formatCurrency) => {
  const tarifaEjemploUSD = formatCurrency(50, 'USD')
  const tarifaEjemploCOP = formatCurrency(200000, 'COP')
  const precioActualEjemplo = moneda === 'USD' ? tarifaEjemploUSD : tarifaEjemploCOP

  return {
    hola: t(
      'chatbot.responses.hola',
      '👋 ¡Hola! Bienvenido a Drivique. ¿En qué te puedo asesorar hoy? Puedes elegir una opción rápida o escribirme cualquier inquietud.'
    ),

    queEsDrivique: t(
      'chatbot.responses.queEsDrivique',
      '✨ **¿Qué es Drivique?**\n\nDrivique es la plataforma líder de alquiler de vehículos premium y compactos en Colombia. Te ofrecemos reservas 100% digitales, firmas de contratos online, asistencia 24/7 y la flota más moderna con la mejor tarifa garantizada.'
    ),

    dolar: t(
      'chatbot.responses.dolar',
      `💵 **Conversión de Moneda y Tarifas:**\n\nEn Drivique puedes visualizar todos los precios del catálogo tanto en **Pesos Colombianos (COP)** como en **Dólares (USD)**.\n\n• Tarifas desde aproximadamente **${precioActualEjemplo}/día**.\n• La conversión se calcula en tiempo real según la tasa de cambio vigente al pagar.`
    ),

    alquilar: t(
      'chatbot.responses.alquilar',
      '🚗 **Alquilar en Drivique es muy sencillo:**\n\n1. Selecciona tu vehículo preferido en el **Catálogo**.\n2. Elige la fecha de entrega y devolución, junto con la sucursal deseada.\n3. Adjunta tu documento de identidad y licencia de conducción válida.\n4. Realiza el pago seguro en línea a través de **Wompi**.\n5. ¡Listo! Recibirás la confirmación de reserva al instante.'
    ),

    requisitos: t(
      'chatbot.responses.requisitos',
      '📋 **Requisitos obligatorios para alquilar:**\n\n• **Edad mínima:** 16 años cumplidos.\n• **Documento de Identidad:** Cédula de ciudadanía, Pasaporte, Tarjeta de identidad o Documento de extranjería.\n• **Licencia de Conducción:** Vigente (nacional o internacional).\n• **Depósito de garantía:** Tarjeta de crédito o débito a nombre del titular.'
    ),

    pagos: t(
      'chatbot.responses.pagos',
      `💰 **Métodos de Pago y Depósitos:**\n\nAceptamos todos los medios de pago digitales a través de la pasarela **Wompi**:\n• Tarjetas de crédito (Visa, Mastercard, American Express).\n• Transferencias PSE / Nequi / Bancolombia.\n• Tarjetas débito nacionales e internacionales en COP o USD.\n\n*El depósito en garantía se libera automáticamente 24 horas después de la devolución.*`
    ),

    agente: t(
      'chatbot.responses.agente',
      '👤 **Atención personalizada con Asesor Humano:**\n\nPuedes comunicarte de inmediato con nuestro centro de control:\n• 📱 **WhatsApp 24/7:** +57 314 478 9702\n• 📞 **Línea Telefónica:** +57 322 3163531\n• ✉️ **Correo:** soporte@drivique.com\n\n*Tiempo medio de respuesta: menos de 2 minutos.*'
    ),

    incidencia: t(
      'chatbot.responses.incidencia',
      '🛠️ **¿Tuviste un problema con tu vehículo?**\n\nDirígete a la sección de **Soporte** en el menú superior o ingresa a **Mis Reservas** y haz clic en **"Hacer reporte"**. Nuestro equipo de asistencia en carretera enviará una unidad móvil de inmediato.'
    ),

    cancelacion: t(
      'chatbot.responses.cancelacion',
      '🔄 **Política de Cancelaciones:**\n\nPuedes cancelar tu reserva con reembolso total hasta **24 horas antes** de la fecha de entrega acordada desde la sección **Mis Reservas**.'
    ),

    sucursales: t(
      'chatbot.responses.sucursales',
      '🏢 **Sucursales disponibles:**\n\nContamos con sedes físicas en Neiva, Bogotá, Medellín, Cali y Cartagena. Puedes ver la ubicación exacta y horarios en la sección **Sucursales**.'
    ),

    default: t(
      'chatbot.responses.default',
      '🤖 Entiendo tu inquietud. Puedes explorar nuestro **Catálogo** para alquilar, revisar **Mis Reservas** o contactar a un asesor por WhatsApp escribiendo **"agente"**.'
    ),
  }
}

/**
 * Genera la respuesta del chatbot analizando palabras clave en la pregunta del usuario.
 */
export function procesarPreguntaBot(pregunta, t, moneda, formatCurrency) {
  const texto = pregunta.toLowerCase().trim()
  const resp = getBotResponses(t, moneda, formatCurrency)

  if (!texto) return resp.default

  if (
    texto.includes('hola') ||
    texto.includes('buenas') ||
    texto.includes('buenos dias') ||
    texto.includes('buenas tardes') ||
    texto.includes('buenas noches') ||
    texto.includes('hi') ||
    texto.includes('hello')
  ) {
    return resp.hola
  }

  if (
    texto.includes('de que trata') ||
    texto.includes('que es drivique') ||
    texto.includes('quienes son') ||
    texto.includes('plataforma') ||
    texto.includes('acerca de') ||
    texto.includes('que hacen')
  ) {
    return resp.queEsDrivique
  }

  if (
    texto.includes('dolar') ||
    texto.includes('dólar') ||
    texto.includes('usd') ||
    texto.includes('cop') ||
    texto.includes('moneda') ||
    texto.includes('conversion') ||
    texto.includes('cambio')
  ) {
    return resp.dolar
  }

  if (
    texto.includes('alquilar') ||
    texto.includes('rentar') ||
    texto.includes('reservar') ||
    texto.includes('pasos') ||
    texto.includes('como funciona')
  ) {
    return resp.alquilar
  }

  if (
    texto.includes('requisito') ||
    texto.includes('documento') ||
    texto.includes('licencia') ||
    texto.includes('cedula') ||
    texto.includes('pasaporte') ||
    texto.includes('edad') ||
    texto.includes('16')
  ) {
    return resp.requisitos
  }

  if (
    texto.includes('pago') ||
    texto.includes('deposito') ||
    texto.includes('tarjeta') ||
    texto.includes('wompi') ||
    texto.includes('pse') ||
    texto.includes('precio') ||
    texto.includes('costo') ||
    texto.includes('tarifa')
  ) {
    return resp.pagos
  }

  if (
    texto.includes('agente') ||
    texto.includes('humano') ||
    texto.includes('whatsapp') ||
    texto.includes('telefono') ||
    texto.includes('contacto') ||
    texto.includes('asesor') ||
    texto.includes('llamada')
  ) {
    return resp.agente
  }

  if (
    texto.includes('falla') ||
    texto.includes('averia') ||
    texto.includes('danio') ||
    texto.includes('grua') ||
    texto.includes('taller') ||
    texto.includes('problema') ||
    texto.includes('accidente') ||
    texto.includes('soporte')
  ) {
    return resp.incidencia
  }

  if (texto.includes('cancelar') || texto.includes('reembolso') || texto.includes('devolucion')) {
    return resp.cancelacion
  }

  if (
    texto.includes('sucursal') ||
    texto.includes('sede') ||
    texto.includes('donde') ||
    texto.includes('ubicacion') ||
    texto.includes('direccion')
  ) {
    return resp.sucursales
  }

  return resp.default
}
