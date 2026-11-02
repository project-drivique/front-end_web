import { FaHeadphones, FaExclamationTriangle, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { CANALES_ATENCION, FAQS_INITIAL } from '../../data/supportCatalog'

export default function CanalesPestanaActiva({ faqAbiertaId, setFaqAbiertaId, setPestanaActiva, t }) {
  return (
    <div>
              {/* Card Hero Centro de Atención */}
              <div className="centro-atencion-card">
                <div className="centro-atencion-icon-wrap">
                  <FaHeadphones />
                </div>
                <h2>{t('soporte.centroTitle', 'Centro de Atención al Usuario')}</h2>
                <p>
                  {t(
                    'soporte.centroSub',
                    t('hc2.asistencia_personalizada_para_tus_alqu', 'Asistencia personalizada para tus alquileres de vehículos en Drivique.')
                  )}
                </p>
                <button
                  className="btn-reportar-incidencia-hero"
                  onClick={() => setPestanaActiva('reportar')}
                >
                  <FaExclamationTriangle /> {t('soporte.btnReportarHero', 'Reportar Incidencia')}
                </button>
              </div>
  
              {/* Lista de Canales de Atención */}
              <h3 className="seccion-subtitulo-soporte">
                {t('soporte.canalesHeader', 'Canales de atención')}
              </h3>
  
              <div className="canales-lista">
                {CANALES_ATENCION.map((canal) => (
                  <a
                    key={canal.id}
                    href={canal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canal-card-item"
                  >
                    <div className={`canal-icon-wrap ${canal.tipo}`}>
                      {canal.tipo === 'whatsapp' && <FaWhatsapp />}
                      {canal.tipo === 'telefono' && <FaPhoneAlt />}
                      {canal.tipo === 'correo' && <FaEnvelope />}
                    </div>
  
                    <div className="canal-info">
                      <h4 className="canal-titulo">{t(canal.tituloKey, canal.tituloFallback)}</h4>
                      <p className="canal-subtitulo">{t(canal.subtituloKey, canal.subtituloFallback)}</p>
                    </div>
  
                    <FaChevronRight className="canal-flecha" />
                  </a>
                ))}
              </div>
  
              {/* Sección Preguntas Frecuentes (FAQs) */}
              <h3 className="seccion-subtitulo-soporte" style={{ marginTop: 36 }}>
                {t('soporte.faqsHeader', 'Preguntas frecuentes')}
              </h3>
  
              <div className="faqs-lista">
                {FAQS_INITIAL.map((faq) => {
                  const isOpen = faqAbiertaId === faq.id
                  return (
                    <div key={faq.id} className="faq-item">
                      <button
                        className="faq-pregunta-btn"
                        onClick={() => setFaqAbiertaId(isOpen ? null : faq.id)}
                      >
                        <span>{t(faq.preguntaKey, faq.preguntaFallback)}</span>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
  
                      {isOpen && (
                        <div className="faq-respuesta">
                          {t(faq.respuestaKey, faq.respuestaFallback)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
  )
}
