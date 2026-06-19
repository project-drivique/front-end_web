import { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaShieldAlt } from 'react-icons/fa'
import { useCambiarContrasena, REGLAS } from '../hooks/useCambiarContrasena'
import { showAlert } from '@/utils/swalConfig'
import { useEffect } from 'react'

const FORTALEZA_CONFIG = [
  { label: 'Muy débil',  color: '#ef4444' },
  { label: 'Débil',      color: '#f97316' },
  { label: 'Regular',    color: '#eab308' },
  { label: 'Buena',      color: '#22c55e' },
  { label: 'Fuerte',     color: '#16a34a' },
]

export default function CambiarContrasena({ c }) {
  const {
    form, errores, cargando, exito,
    modoEdicion, setModoEdicion,
    fortaleza, reglasCumplidas,
    actualizarCampo, handleGuardar, handleCancelar,
  } = useCambiarContrasena()

  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false })
  const toggleVer = (campo) => setVer(prev => ({ ...prev, [campo]: !prev[campo] }))

  useEffect(() => {
    if (exito) {
      showAlert({ icon: 'success', title: '¡Contraseña actualizada!', text: 'Tu contraseña se cambió correctamente.' })
    }
  }, [exito])

  const fortalezaInfo = FORTALEZA_CONFIG[fortaleza] ?? FORTALEZA_CONFIG[0]

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '11px 40px 11px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? '#f87171' : c.inputBorder}`,
    background: hasError ? c.inputErrorBg : c.inputBg,
    fontSize: '14px',
    color: c.inputText,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  })

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: c.labelText,
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }

  return (
    <div style={{ background: c.cardBg, borderRadius: '14px', border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${c.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaShieldAlt style={{ color: c.sectionTitle, fontSize: '15px' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.title, margin: 0 }}>
            Seguridad y Contraseña
          </h2>
        </div>
        {!modoEdicion && (
          <button
            onClick={() => setModoEdicion(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: c.btnPrimary,
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <FaLock style={{ fontSize: '11px' }} /> Cambiar contraseña
          </button>
        )}
      </div>

      {/* Contenido */}
      {!modoEdicion ? (
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaLock style={{ color: c.sectionTitle, fontSize: '16px' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: c.text, margin: '0 0 2px' }}>Contraseña establecida</p>
            <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Haz clic en "Cambiar contraseña" para actualizarla</p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 20px' }}>
            Actualiza tu contraseña para mantener tu cuenta segura.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Contraseña actual */}
            <div>
              <label style={labelStyle}><FaLock style={{ fontSize: '10px' }} /> Contraseña Actual *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={ver.actual ? 'text' : 'password'}
                  value={form.actual}
                  onChange={e => actualizarCampo('actual', e.target.value)}
                  placeholder="Tu contraseña actual"
                  style={inputStyle(!!errores.actual)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.actual ? '#f87171' : c.inputBorder}
                />
                <button type="button" onClick={() => toggleVer('actual')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex' }}>
                  {ver.actual ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errores.actual && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.actual}</p>}
            </div>

            {/* Nueva contraseña */}
            <div>
              <label style={labelStyle}><FaLock style={{ fontSize: '10px' }} /> Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={ver.nueva ? 'text' : 'password'}
                  value={form.nueva}
                  onChange={e => actualizarCampo('nueva', e.target.value)}
                  placeholder="Tu nueva contraseña"
                  style={inputStyle(!!errores.nueva)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.nueva ? '#f87171' : c.inputBorder}
                />
                <button type="button" onClick={() => toggleVer('nueva')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex' }}>
                  {ver.nueva ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Barra de fortaleza */}
              {form.nueva && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '5px', borderRadius: '3px',
                        background: i < fortaleza ? fortalezaInfo.color : c.inputBorder,
                        transition: 'background 250ms',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: fortalezaInfo.color, margin: 0 }}>
                    {fortalezaInfo.label}
                  </p>
                </div>
              )}

              {/* Lista de reglas */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {reglasCumplidas.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                      background: r.ok ? '#22c55e' : c.inputBorder,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 200ms',
                    }}>
                      <FaCheck style={{ fontSize: '8px', color: r.ok ? '#fff' : 'transparent' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: r.ok ? '#22c55e' : c.textMuted, fontWeight: r.ok ? 600 : 400 }}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
              {errores.nueva && <p style={{ color: c.errorText, fontSize: '12px', margin: '6px 0 0' }}>{errores.nueva}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label style={labelStyle}><FaLock style={{ fontSize: '10px' }} /> Confirmar Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={ver.confirmar ? 'text' : 'password'}
                  value={form.confirmar}
                  onChange={e => actualizarCampo('confirmar', e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  style={inputStyle(!!errores.confirmar)}
                  onFocus={e => e.target.style.borderColor = c.inputBorderFocus}
                  onBlur={e => e.target.style.borderColor = errores.confirmar ? '#f87171' : c.inputBorder}
                />
                <button type="button" onClick={() => toggleVer('confirmar')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex' }}>
                  {ver.confirmar ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {/* Indicador coincidencia en tiempo real */}
              {form.confirmar && (
                <p style={{ fontSize: '12px', margin: '5px 0 0', color: form.nueva === form.confirmar ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {form.nueva === form.confirmar ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </p>
              )}
              {errores.confirmar && !form.confirmar && <p style={{ color: c.errorText, fontSize: '12px', margin: '5px 0 0' }}>{errores.confirmar}</p>}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              onClick={handleCancelar}
              disabled={cargando}
              style={{ padding: '11px 24px', borderRadius: '10px', background: c.btnSecBg, border: `1.5px solid ${c.btnSecBorder}`, color: c.btnSecText, fontWeight: 600, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.5 : 1 }}
            >
              <FaTimes /> Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={cargando}
              style={{ padding: '11px 28px', borderRadius: '10px', background: c.btnPrimary, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: cargando ? 0.7 : 1 }}
            >
              {cargando ? (
                <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</>
              ) : (
                <><FaCheck /> Actualizar contraseña</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
