import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaComments,
  FaTimes,
  FaMinus,
  FaPaperPlane,
  FaRobot,
  FaChevronRight,
} from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import { getBotQuickActions, procesarPreguntaBot } from '@/data/chatbotKnowledge'
import './FloatingChatBot.css'

export default function FloatingChatBot() {
  const { t } = useTranslation()
  const { moneda, formatCurrency } = useLanding()

  const [abierto, setAbierto] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [mensajeUnread, setMensajeUnread] = useState(true)

  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      sender: 'bot',
      texto: t(
        'chatbot.welcomeMsg',
        '👋 ¡Hola! Soy el asistente virtual interactivo de Drivique 24/7.\n¿En qué puedo ayudarte hoy?'
      ),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const [inputTexto, setInputTexto] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)

  const messagesEndRef = useRef(null)

  const quickActions = getBotQuickActions(t)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (abierto && !minimizado) {
      scrollToBottom()
    }
  }, [mensajes, abierto, minimizado, escribiendo])

  const toggleChat = () => {
    if (abierto && minimizado) {
      setMinimizado(false)
    } else {
      setAbierto(!abierto)
      setMinimizado(false)
    }
    setMensajeUnread(false)
  }

  const handleEnviarMensaje = (textoParam) => {
    const textoFinal = textoParam || inputTexto
    if (!textoFinal || !textoFinal.trim()) return

    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const nuevoMensajeUsuario = {
      id: Date.now(),
      sender: 'user',
      texto: textoFinal,
      time: hora,
    }

    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    if (!textoParam) setInputTexto('')
    setEscribiendo(true)

    // Simulación de respuesta en tiempo real del chatbot
    setTimeout(() => {
      const respuestaTexto = procesarPreguntaBot(textoFinal, t, moneda, formatCurrency)
      const horaBot = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          texto: respuestaTexto,
          time: horaBot,
        },
      ])
      setEscribiendo(false)
    }, 850)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEnviarMensaje()
    }
  }

  return (
    <>
      {/* Botón flotante de activación estilo screenshot */}
      <button
        className="floating-chatbot-trigger"
        onClick={toggleChat}
        title={t('chatbot.toggleTitle', 'Asistente de Soporte Drivique')}
        aria-label="Abrir Chatbot de soporte"
      >
        <FaComments />
        {mensajeUnread && <span className="floating-chatbot-badge" />}
      </button>

      {/* Ventana de Chatbot */}
      {abierto && !minimizado && (
        <div className="floating-chatbot-window">
          {/* Header Superior */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <FaRobot />
              </div>
              <div className="chatbot-title-wrap">
                <h4>Drivique Bot 24/7</h4>
                <div className="chatbot-status-row">
                  <span className="chatbot-status-dot" />
                  <span>{t('chatbot.onlineStatus', 'En línea | Asistente Virtual')}</span>
                </div>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                className="chatbot-header-btn"
                onClick={() => setMinimizado(true)}
                title={t('chatbot.minimize', 'Minimizar')}
              >
                <FaMinus />
              </button>
              <button
                className="chatbot-header-btn"
                onClick={() => setAbierto(false)}
                title={t('chatbot.close', 'Cerrar')}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="chatbot-messages-body">
            {mensajes.map((msg) => (
              <div key={msg.id} className={`chatbot-msg-row ${msg.sender}`}>
                <div className="chatbot-msg-bubble">{msg.texto}</div>
                <span className="chatbot-msg-time">{msg.time}</span>
              </div>
            ))}

            {escribiendo && (
              <div className="chatbot-msg-row bot">
                <div className="chatbot-typing-indicator">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Preguntas Rápidas */}
          <div className="chatbot-quick-chips">
            <span className="chatbot-chips-title">
              {t('chatbot.quickQuestionsTitle', 'Preguntas Rápidas:')}
            </span>
            <div className="chatbot-chips-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="chatbot-chip-btn"
                  onClick={() => handleEnviarMensaje(action.label)}
                >
                  <span>{action.label}</span>
                  <FaChevronRight style={{ fontSize: 10, opacity: 0.7 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Input inferior de chat */}
          <form
            className="chatbot-footer-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleEnviarMensaje()
            }}
          >
            <input
              type="text"
              className="chatbot-input"
              placeholder={t('chatbot.inputPlaceholder', 'Escribe tu pregunta aquí...')}
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputTexto.trim()}
              title={t('chatbot.send', 'Enviar')}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
