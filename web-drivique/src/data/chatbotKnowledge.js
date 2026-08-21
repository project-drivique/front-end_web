// Knowledge base & response generator for Drivique Interactive Chatbot

export const BOT_QUICK_ACTIONS = [
  {
    id: 'alquilar',
    label: '🚗 ¿Cómo alquilar un vehículo?',
    key: 'alquilar',
  },
  {
    id: 'requisitos',
    label: '📋 ¿Cuáles son los requisitos?',
    key: 'requisitos',
  },
  {
    id: 'pagos',
    label: '💰 Métodos de pago y depósitos',
    key: 'pagos',
  },
  {
    id: 'agente',
    label: '👤 Hablar con un agente (WhatsApp/Teléfono)',
    key: 'agente',
  },
]

export const BOT_RESPONSES = {
  alquilar: `🚗 **Alquilar en Drivique es muy sencillo:**

1. Selecciona tu vehículo preferido en el **Catálogo**.
2. Elige la fecha de entrega y devolución, junto con la sucursal deseada.
3. Adjunta tu documento de identidad y licencia de conducción válida.
4. Realiza el pago seguro en línea a través de **Wompi**.
5. ¡Listo! Recibirás la confirmación de reserva al instante.`,

  requisitos: `📋 **Requisitos obligatorios para alquilar:**

• **Edad mínima:** 21 años cumplidos.
• **Documento de Identidad:** Cédula de ciudadanía, Pasaporte, Tarjeta de identidad o Documento de extranjería.
• **Licencia de Conducción:** Vigente (nacional o internacional).
• **Depósito de garantía:** Tarjeta de crédito o débito a nombre del titular.`,

  pagos: `💰 **Métodos de Pago y Depósitos:**

Aceptamos todos los medios de pago digitales a través de la pasarela **Wompi**:
• Tarjetas de crédito (Visa, Mastercard, American Express).
• Transferencias PSE / Nequi / Bancolombia.
• Tarjetas débito nacionales e internacionales.

*El depósito en garantía se libera automáticamente 24 horas después de la devolución del vehículo.*`,

  agente: `👤 **Atención personalizada con Asesor Humano:**

Puedes comunicarte de inmediato con nuestro centro de control:
• 📱 **WhatsApp 24/7:** +57 314 478 9702
• 📞 **Línea Telefónica:** +57 322 3163531
• ✉️ **Correo:** soporte@drivique.com

*Tiempo medio de respuesta: menos de 2 minutos.*`,

  incidencia: `🛠️ **¿Tuviste un problema con tu vehículo?**

Dirígete a la sección de **Soporte** en el menú superior o ingresa a **Mis Reservas** y haz clic en **"Hacer reporte"**. Nuestro equipo de asistencia en carretera enviará una unidad móvil de inmediato.`,

  cancelacion: `🔄 **Política de Cancelaciones:**

Puedes cancelar tu reserva con reembolso total hasta **24 horas antes** de la fecha de entrega acordada desde la sección **Mis Reservas**.`,

  sucursales: `🏢 **Sucursales disponibles:**

Contamos con sedes físicas en Neiva, Bogotá, Medellín, Cali y Cartagena. Puedes ver la ubicación exacta y horarios en la sección **Sucursales**.`,

  default: `🤖 Entiendo tu pregunta. Para darte la mejor orientación sobre Drivique:

• Puedes explorar nuestro **Catálogo** para reservar.
• Consultar el estado de tus viajes en **Mis Reservas**.
• O hacer un reporte técnico urgente en **Soporte**.

Si necesitas hablar directamente con un agente humano, escribe **"agente"** o presiona el botón de WhatsApp a continuación.`,
}

/**
 * Genera la respuesta del chatbot analizando palabras clave en la pregunta del usuario.
 */
export function procesarPreguntaBot(pregunta) {
  const texto = pregunta.toLowerCase().trim()

  if (!texto) return BOT_RESPONSES.default

  if (texto.includes('alquilar') || texto.includes('rentar') || texto.includes('reservar') || texto.includes('pasos') || texto.includes('como funciona')) {
    return BOT_RESPONSES.alquilar
  }

  if (texto.includes('requisito') || texto.includes('documento') || texto.includes('licencia') || texto.includes('cedula') || texto.includes('pasaporte') || texto.includes('edad')) {
    return BOT_RESPONSES.requisitos
  }

  if (texto.includes('pago') || texto.includes('deposito') || texto.includes('tarjeta') || texto.includes('wompi') || texto.includes('pse') || texto.includes('precio') || texto.includes('costo')) {
    return BOT_RESPONSES.pagos
  }

  if (texto.includes('agente') || texto.includes('humano') || texto.includes('whatsapp') || texto.includes('telefono') || texto.includes('contacto') || texto.includes('asesor') || texto.includes('llamada')) {
    return BOT_RESPONSES.agente
  }

  if (texto.includes('falla') || texto.includes('averia') || texto.includes('danio') || texto.includes('grua') || texto.includes('taller') || texto.includes('problema') || texto.includes('accidente') || texto.includes('soporte')) {
    return BOT_RESPONSES.incidencia
  }

  if (texto.includes('cancelar') || texto.includes('reembolso') || texto.includes('devolucion')) {
    return BOT_RESPONSES.cancelacion
  }

  if (texto.includes('sucursal') || texto.includes('sede') || texto.includes('donde') || texto.includes('ubicacion') || texto.includes('direccion')) {
    return BOT_RESPONSES.sucursales
  }

  return BOT_RESPONSES.default
}
