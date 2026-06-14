import { useState } from 'react';

const IcoX = ({ sz = 15, color = '#dc2626' }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SUCURSALES = ['Centro Neiva', 'Aeropuerto Neiva', 'Terminal de Transportes', 'Norte Neiva', 'Sur Neiva'];
const cop = n => `$${Number(n).toLocaleString('es-CO')}`;

export default function ModalEditarReserva({ tipo, reserva, vehiculo, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ ...reserva });
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const tarifas = vehiculo.tarifas || {};
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 };
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 };

  const inp = { width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid var(--borde)', fontSize: 14, color: 'var(--texto-primary)', outline: 'none', boxSizing: 'border-box', background: 'var(--bg-item)' };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--texto-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--texto-primary)', margin: 0 }}>
            {tipo === 'retiro' ? 'Editar Retiro' : tipo === 'devolucion' ? 'Editar Devolución' : 'Tipo de Kilómetros'}
          </h3>
          <button onClick={onCerrar} style={{ background: 'var(--bg-item)', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms ease' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-item)'}>
            <IcoX sz={18} color="#64748b" />
          </button>
        </div>

        {tipo === 'km' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { val: 'limitado', label: `Km limitado (${kmLimit.km} km/día)`, precio: kmLimit.precio },
              { val: 'ilimitado', label: 'Km ilimitado', precio: kmIlimit.precio },
            ].map(op => (
              <button key={op.val} onClick={() => s('tipoKm', op.val)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', borderRadius: 16, cursor: 'pointer',
                border: `2px solid ${form.tipoKm === op.val ? '#2563eb' : 'var(--borde)'}`,
                background: form.tipoKm === op.val ? '#eff6ff' : 'var(--bg-item)',
                transition: 'all 200ms ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.tipoKm === op.val ? '#2563eb' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.tipoKm === op.val && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: form.tipoKm === op.val ? '#1e3a8a' : 'var(--texto-primary)' }}>{op.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#1e3a8a' }}>{cop(op.precio)}/día</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <label style={lbl}>{tipo === 'retiro' ? 'Lugar de retiro' : 'Lugar de devolución'}</label>
            <select
              value={tipo === 'retiro' ? form.sucursalRetiro : form.sucursalDevolucion}
              onChange={e => s(tipo === 'retiro' ? 'sucursalRetiro' : 'sucursalDevolucion', e.target.value)}
              style={{ ...inp, cursor: 'pointer' }}
            >
              <option value="">Selecciona Lugar</option>
              {/* Cambiamos SUCURSALES por el arreglo de puntos */}
              {['Centro', 'Norte', 'Sur', 'Occidente'].map(puntos => (
                <option key={puntos} value={puntos}>
                  {puntos}
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={() => { onGuardar(form); onCerrar() }} style={{ width: '100%', marginTop: 28, padding: '16px', borderRadius: 12, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.25)', transition: 'transform 200ms ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
