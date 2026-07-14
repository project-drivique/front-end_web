import { useTranslation } from 'react-i18next'
import { useVerificarCorreo } from '../hooks/useVerificarCorreo'
import logo from '@/assets/logo.png'

const formatearTiempo = (segundos) => {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IconoConAnillo({ children, tono = 'blue' }) {
  const tonos = {
    blue: 'bg-blue-50 text-blue-800',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="relative mx-auto mb-8 flex h-16 items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tonos[tono]}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

const IconoSobre = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const IconoCheck = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

export default function VerificarCorreoPage() {
  const { t } = useTranslation()
  const {
    correo, codigoEnviado, enviando, handleEnviarCodigo,
    codigo, cargando, error, exito, expirado,
    segundosReenvio, segundosExpiracion, reenviando,
    inputsRef, LARGO_CODIGO,
    handleCambioDigito, handleKeyDown,
    handlePaste, handleSubmit,
    handleReenviar, handleCancelar,
  } = useVerificarCorreo()

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[420px]">
        <img src={logo} alt="Drivique" className="mx-auto mb-8 h-11 sm:mb-10" />

        <div className="rounded-3xl border border-slate-100 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-10">

          {exito ? (
            /* ── Pantalla 3: éxito ── */
            <div className="text-center">
              <IconoConAnillo tono="emerald"><IconoCheck /></IconoConAnillo>
              <h1 className="mb-2 text-2xl font-bold text-slate-900">{t('verificarCorreo.successTitle')}</h1>
              <p className="text-[15px] text-slate-500">{t('verificarCorreo.successSubtitle')}</p>
            </div>

          ) : !codigoEnviado ? (
            /* ── Pantalla 1: confirmar antes de enviar ── */
            <div className="text-center">
              <IconoConAnillo><IconoSobre /></IconoConAnillo>

              <h1 className="mb-3 text-2xl font-bold text-slate-900">{t('verificarCorreo.sendTitle')}</h1>
              <p className="mb-8 text-[15px] leading-relaxed text-slate-500">
                {t('verificarCorreo.sendSubtitle')}<br />
                <span className="font-semibold text-slate-800">{correo}</span>
              </p>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-left text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleEnviarCodigo}
                disabled={enviando}
                className="mb-6 w-full rounded-xl bg-blue-800 py-4 text-base font-bold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? t('verificarCorreo.sending') : t('verificarCorreo.sendButton')}
              </button>

              <button
                type="button"
                onClick={handleCancelar}
                className="text-sm font-medium text-slate-400 hover:text-slate-600"
              >
                {t('verificarCorreo.backToRegistro')}
              </button>
            </div>

          ) : (
            /* ── Pantalla 2: ingresar el código ── */
            <>
              <IconoConAnillo><IconoSobre /></IconoConAnillo>

              <div className="mb-8 text-center">
                <h1 className="mb-3 text-2xl font-bold text-slate-900">{t('verificarCorreo.title')}</h1>
                <p className="text-[15px] leading-relaxed text-slate-500">
                  {t('verificarCorreo.subtitle')}<br />
                  <span className="font-semibold text-slate-800">{correo}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4 flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                    <input
                      key={i}
                      ref={el => inputsRef.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codigo[i] || ''}
                      onChange={e => handleCambioDigito(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      disabled={cargando || expirado}
                      className={`h-12 w-9 rounded-2xl border text-center text-lg font-bold outline-none transition-all sm:h-[54px] sm:w-11 sm:text-xl ${
                        error ? 'border-red-200 bg-red-50 text-red-700'
                        : codigo[i] ? 'border-blue-800 bg-blue-50/40 text-slate-900 ring-4 ring-blue-50'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-blue-800 focus:ring-4 focus:ring-blue-50'
                      } ${expirado ? 'opacity-50' : ''}`}
                    />
                  ))}
                </div>

                <p className={`mb-7 text-center text-[13px] ${expirado ? 'font-semibold text-red-500' : 'text-slate-400'}`}>
                  {expirado
                    ? t('verificarCorreo.expired')
                    : t('verificarCorreo.expiresIn', { time: formatearTiempo(segundosExpiracion) })}
                </p>

                <button
                  type="submit"
                  disabled={cargando || expirado || codigo.length < LARGO_CODIGO}
                  className="mb-6 w-full rounded-xl bg-blue-800 py-4 text-base font-bold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {cargando ? t('verificarCorreo.verifying') : t('verificarCorreo.submit')}
                </button>
              </form>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="font-medium text-slate-400 hover:text-slate-600"
                >
                  {t('verificarCorreo.backToRegistro')}
                </button>

                {segundosReenvio > 0 ? (
                  <span className="font-medium text-slate-400">
                    {t('verificarCorreo.resendCountdown', { seconds: segundosReenvio })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                    className="font-bold text-blue-800 hover:text-blue-900 disabled:opacity-60"
                  >
                    {reenviando ? t('verificarCorreo.resending') : t('verificarCorreo.resend')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
