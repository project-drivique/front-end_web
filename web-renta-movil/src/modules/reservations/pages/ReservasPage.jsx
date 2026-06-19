// src/modules/reservations/pages/ReservasPage.jsx
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useReservas } from '../hooks/useReservas'
import { catalogoService } from '../../../services/catalogoService'
import logo from '@/assets/logo/logo.png'

const SUCURSALES = ['Centro', 'Sur', 'Occidente', 'Norte']
const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return [`${h}:00`, `${h}:30`]
}).flat();
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/monedaUtils'
const fmt = d => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(day)} de ${M[parseInt(m) - 1]} de ${y}`
}

/* ─── ÍCONOS ─── */
const IcoCheck = ({ color = '#16a34a', sz = 15 }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const IcoWarn = () => (
  <svg width="15" height="15" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)
const IcoX = ({ sz = 15, color = '#dc2626' }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const IcoEdit = () => (
  <svg width="13" height="13" fill="none" stroke="#1e3a8a" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
)
const IcoArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)
const IcoBack = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

/* ─── RESUMEN LATERAL ─── */
function ResumenLateral({ vehiculo, reserva, seguroIdx, onEditar, onGuardar }) {
  const { moneda } = useLanding()
  const precio = reserva.tipoKm === 'ilimitado'
    ? vehiculo.tarifas.kmIlimitado.precio
    : vehiculo.tarifas.kmLimitado.precio
  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1
  const precioSeguro = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0
  const subtotalDiario = precio * dias
  const subtotalSeguro = precioSeguro * dias
  const cargosAdmin = Math.round((subtotalDiario + subtotalSeguro) * 0.10)
  const total = subtotalDiario + subtotalSeguro + cargosAdmin

  return (
    <aside style={{ width: 300, flexShrink: 0, background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden', position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
      <div style={{ background: '#1e3a8a', padding: '14px 20px' }}>
        <p style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 3px' }}>Resumen de la reserva</p>
        <p style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>{vehiculo.nombre}</p>
      </div>
      <div style={{ padding: '0 18px 18px' }}>
        <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lugar de Retiro</span>
            <button onClick={() => onEditar('retiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#1e3a8a', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> Para editar
            </button>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            {reserva.fechaInicio ? `${fmt(reserva.fechaInicio)}` : 'Fecha no seleccionada'}
          </p>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px' }}>{reserva.sucursalRetiro || 'Centro'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a' }}>Hora:</span>
            <select
              value={reserva.horaInicio || '09:00'}
              onChange={e => onGuardar({ ...reserva, horaInicio: e.target.value })}
              style={{ flex: 1, padding: '5px', fontSize: 11, borderRadius: 6, border: '1px solid #cbd5e1', color: '#475569', outline: 'none', cursor: 'pointer' }}
            >
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Devolución</span>
            <button onClick={() => onEditar('devolucion')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#1e3a8a', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> Para editar
            </button>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            {reserva.fechaFin ? `${fmt(reserva.fechaFin)}` : 'Fecha no seleccionada'}
          </p>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px' }}>{reserva.sucursalDevolucion || 'Centro'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a' }}>Hora:</span>
            <select
              value={reserva.horaFin || '09:00'}
              onChange={e => onGuardar({ ...reserva, horaFin: e.target.value })}
              style={{ flex: 1, padding: '5px', fontSize: 11, borderRadius: 6, border: '1px solid #cbd5e1', color: '#475569', outline: 'none', cursor: 'pointer' }}
            >
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Grupo</span>
            <button onClick={() => onEditar('km')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#1e3a8a', fontWeight: 700, padding: 0 }}>
              <IcoEdit /> Para editar
            </button>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{vehiculo.categoria} — {vehiculo.transmision}</p>
          <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px' }}>{vehiculo.nombre}</p>
          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: reserva.tipoKm === 'ilimitado' ? '#ecfdf5' : '#eff6ff', color: reserva.tipoKm === 'ilimitado' ? '#059669' : '#1e3a8a', border: `1px solid ${reserva.tipoKm === 'ilimitado' ? '#bbf7d0' : '#bfdbfe'}` }}>
            {reserva.tipoKm === 'ilimitado' ? '∞ Km ilimitado' : `${vehiculo.tarifas.kmLimitado.km} km/día limitado`}
          </span>
        </div>
        <div style={{ paddingTop: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Oferta Standard</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4 }}><span>Diarias</span><span>Total</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 10 }}>
            <span style={{ color: '#475569' }}>{dias} días × {formatCurrency(precio, moneda)}</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(subtotalDiario, moneda)}</span>
          </div>
          {seguroIdx !== null && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', margin: '0 0 4px' }}>Protecciones</p>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{vehiculo.seguros[seguroIdx]?.nombre}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 10 }}>
                <span style={{ color: '#475569' }}>{dias} días × {formatCurrency(precioSeguro, moneda)}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(subtotalSeguro, moneda)}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, paddingBottom: 12, borderBottom: '1px solid #f1f5f9', marginBottom: 12 }}>
            <span style={{ color: '#475569' }}>Cargos Administrativos (10%)</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(cargosAdmin, moneda)}</span>
          </div>
          <div style={{ background: '#1e3a8a', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 3px' }}>Valor total esperado</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(total, moneda)}</p>
            <p style={{ fontSize: 9, color: '#93c5fd', margin: '3px 0 0' }}>*Valor total incluye impuestos</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── MODAL EDITAR ─── */
function ModalEditar({ tipo, reserva, vehiculo, onGuardar, onCerrar }) {
  const { moneda } = useLanding()
  const [form, setForm] = useState({ ...reserva })
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {tipo === 'retiro' ? 'Editar retiro' : tipo === 'devolucion' ? 'Editar devolución' : 'Tipo de kilómetros'}
          </h3>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IcoX sz={18} color="#94a3b8" /></button>
        </div>
        {tipo === 'km' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { val: 'limitado', label: `Km limitado (${vehiculo.tarifas.kmLimitado.km} km/día)`, precio: vehiculo.tarifas.kmLimitado.precio },
              { val: 'ilimitado', label: 'Km ilimitado', precio: vehiculo.tarifas.kmIlimitado.precio },
            ].map(op => (
              <button key={op.val} onClick={() => s('tipoKm', op.val)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${form.tipoKm === op.val ? '#1e3a8a' : '#e2e8f0'}`, background: form.tipoKm === op.val ? '#eff6ff' : '#fff', transition: 'all 150ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${form.tipoKm === op.val ? '#1e3a8a' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.tipoKm === op.val && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1e3a8a' }} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: form.tipoKm === op.val ? '#1e3a8a' : '#334155' }}>{op.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#1e3a8a' }}>{formatCurrency(op.precio, moneda)}/día</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>{tipo === 'retiro' ? 'Sucursal de retiro' : 'Sucursal de devolución'}</label>
              <select value={tipo === 'retiro' ? form.sucursalRetiro : form.sucursalDevolucion} onChange={e => s(tipo === 'retiro' ? 'sucursalRetiro' : 'sucursalDevolucion', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Selecciona sucursal</option>
                {SUCURSALES.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Fecha</label>
              <input type="date" value={tipo === 'retiro' ? form.fechaInicio : form.fechaFin} min={tipo === 'retiro' ? new Date().toISOString().split('T')[0] : (form.fechaInicio || new Date().toISOString().split('T')[0])} onChange={e => s(tipo === 'retiro' ? 'fechaInicio' : 'fechaFin', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Hora</label>
              <select value={tipo === 'retiro' ? form.horaInicio : form.horaFin} onChange={e => s(tipo === 'retiro' ? 'horaInicio' : 'horaFin', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        )}
        <button onClick={() => { onGuardar(form); onCerrar() }} style={{ width: '100%', marginTop: 20, padding: 13, borderRadius: 12, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

/* ─── PANTALLA 1: PROTECCIÓN ─── */
const ICONOS_PLANES = [
  ['🛡️', '🤍', '🤍'],
  ['🛡️', '🛡️', '🛡️'],
]
const ITEMS_PLANES = [
  [
    { tipo: 'check', texto: 'Asistencia durante tu viaje. *No incluidas en Alquiler Ligero' },
    { tipo: 'check', texto: 'Responsabilidad Civil Extracontractual (hasta $840 millones)' },
    { tipo: 'check', texto: 'Cobertura básica del vehículo (no incluye daños graves ni robo)' },
    { tipo: 'warn', texto: 'En caso de siniestro, deberás asumir un pago adicional llamado Participación obligatoria, que puede llegar hasta $4.760.000 dependiendo del tipo de vehículo' },
    { tipo: 'x', texto: 'No cubre uso indebido del vehículo' },
  ],
  [
    { tipo: 'check', texto: 'Asistencia completa durante tu viaje' },
    { tipo: 'check', texto: 'Responsabilidad Civil Extracontractual (hasta $840M)' },
    { tipo: 'check', texto: 'Cobertura total del vehículo (incluye daños graves y robo)' },
    { tipo: 'check', texto: 'Sin pago de la participación obligatoria en caso de siniestro' },
    { tipo: 'x', texto: 'No cubre uso indebido del vehículo' },
  ],
]

function PantallaProteccion({ vehiculo, reserva, seguroIdx, onSeleccionar, onEditar, onGuardar }) {
  const { moneda } = useLanding()
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {vehiculo.imagenes?.[0]
              ? <img src={vehiculo.imagenes[0]} alt={vehiculo.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <svg width="68" height="68" fill="none" stroke="#1e3a8a" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
            }
            <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: '#ecfdf5', color: '#059669', border: '1px solid #bbf7d0' }}>● Disponible</span>
          </div>
          <div style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '3px 9px', borderRadius: 6, display: 'inline-block', marginBottom: 6 }}>{vehiculo.categoria}</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '4px 0 6px' }}>{vehiculo.nombre}</h2>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>⚙️ {vehiculo.transmision}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>⛽ {vehiculo.combustible}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>👥 {vehiculo.pasajeros} personas</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#1e3a8a' }}>{formatCurrency(vehiculo.precio, moneda)}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>/día</span>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 7 }}>
              {[
                { i: '🚪', l: `${vehiculo.puertas} puertas` },
                { i: '🧳', l: `${vehiculo.maletero}L maletero` },
                { i: '⚡', l: vehiculo.cilindraje },
                { i: '🎨', l: vehiculo.color },
                { i: '📅', l: `Año ${vehiculo.año}` },
                { i: '❄️', l: 'Aire acond.' },
              ].map((c, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{c.i}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{c.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Elige tu protección</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 18, marginBottom: 32 }}>
          {vehiculo.seguros.map((seguro, idx) => {
            const sel = seguroIdx === idx
            const iconos = ICONOS_PLANES[idx] ?? ['🛡️']
            const items = ITEMS_PLANES[idx] ?? []
            return (
              <div key={idx} style={{ borderRadius: 20, border: `2px solid ${sel ? '#1e3a8a' : '#e2e8f0'}`, background: sel ? '#f0f6ff' : '#fff', boxShadow: sel ? '0 4px 20px rgba(30,58,138,0.12)' : '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'all 200ms' }}>
                <div style={{ padding: '18px 22px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>{iconos.map((ic, i) => <span key={i} style={{ fontSize: 15 }}>{ic}</span>)}</div>
                  <h4 style={{ fontSize: 17, fontWeight: 900, color: '#1e3a8a', textAlign: 'center', margin: '0 0 4px' }}>{seguro.nombre}</h4>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#059669', textAlign: 'center', margin: '0 0 14px' }}>
                    {formatCurrency(seguro.precio, moneda)} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/ por día</span>
                  </p>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 14px' }} />
                </div>
                <div style={{ padding: '0 22px' }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 9 }}>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        {item.tipo === 'check' && <IcoCheck />}
                        {item.tipo === 'warn' && <IcoWarn />}
                        {item.tipo === 'x' && <IcoX sz={14} color="#dc2626" />}
                      </div>
                      <span style={{ fontSize: 12, color: item.tipo === 'x' ? '#94a3b8' : '#334155', lineHeight: 1.5, textDecoration: item.tipo === 'x' ? 'line-through' : 'none' }}>{item.texto}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '18px 22px' }}>
                  <button onClick={() => onSeleccionar(idx)} style={{ width: '100%', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 200ms', background: sel ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : idx === 1 ? 'transparent' : '#e2e8f0', color: sel ? '#fff' : idx === 1 ? '#1e3a8a' : '#64748b', border: idx === 1 && !sel ? '2px solid #1e3a8a' : 'none', boxShadow: sel ? '0 4px 14px rgba(30,58,138,0.25)' : 'none' }}>
                    {sel ? '✓ Seleccionado' : 'Elegir plan'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <ResumenLateral vehiculo={vehiculo} reserva={reserva} seguroIdx={seguroIdx} onEditar={onEditar} onGuardar={onGuardar} />
    </div>
  )
}

/* ─── PANTALLA 2: DATOS PERSONALES ─── */
const TERMINOS_TXT = `TÉRMINOS Y CONDICIONES — RENTAMÓVIL

1. REQUISITOS PARA RETIRAR EL VEHÍCULO
Presentar documento de identificación original (cédula, extranjería o pasaporte). Licencia de conducción vigente. El vehículo será entregado únicamente al titular de la reserva.

2. ⚠️ POLÍTICA DE NO REEMBOLSO
RentaMóvil NO realiza devoluciones del dinero bajo ninguna circunstancia una vez confirmada la reserva. No hay reembolsos por cancelaciones, cambios, no presentación ni por ningún otro motivo.

3. NO PRESENTACIÓN (NO SHOW)
Si no retiras el vehículo en la hora programada ni dentro de los 60 minutos siguientes, la reserva se cancela sin derecho a devolución.

4. CONDICIONES DEL SERVICIO
El vehículo se entrega limpio y con el tanque lleno. Debe devolverse en las mismas condiciones. La renta es de 24 horas con 1 hora de tolerancia; a partir de la hora 25 se cobra hora extra.

5. MEDIOS DE PAGO
Para reservas en línea: Visa o MasterCard. No está habilitado el pago con American Express en modalidad en línea.

6. CONSENTIMIENTO DIGITAL
Al confirmar la reserva aceptas expresamente estos términos. Dicha aceptación queda registrada en el sistema.`

function PantallaDatos({ vehiculo, reserva, seguroIdx, datosForm, onCambio, onReservar, errores, onGuardar }) {
  const { moneda } = useLanding()
  const [verTyC, setVerTyC] = useState(false)
  const precio = reserva.tipoKm === 'ilimitado' ? vehiculo.tarifas.kmIlimitado.precio : vehiculo.tarifas.kmLimitado.precio
  const dias = reserva.fechaInicio && reserva.fechaFin ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000)) : 1
  const precioSeg = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0
  const subtotal = precio * dias
  const subtotalSeg = precioSeg * dias
  const cargos = Math.round((subtotal + subtotalSeg) * 0.10)
  const total = subtotal + subtotalSeg + cargos
  const inp = (err) => ({ width: '100%', padding: '11px 13px', borderRadius: 10, boxSizing: 'border-box', border: `1.5px solid ${err ? '#fca5a5' : '#e2e8f0'}`, background: err ? '#fef2f2' : '#fff', fontSize: 13, color: '#1e293b', outline: 'none' })
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Datos Personales</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px' }}>Informa tus datos para que podamos realizar tu reserva.</p>
        <p style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', margin: '0 0 22px' }}>Los campos marcados con asterisco (*) son obligatorios.</p>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 26px', marginBottom: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 22px' }}>
            <div>
              <label style={lbl}>Nombre Completo *</label>
              <input value={datosForm.nombre} onChange={e => onCambio('nombre', e.target.value)} placeholder="Ej: Juan Pérez García" style={inp(errores.nombre)} />
              {errores.nombre && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errores.nombre}</p>}
            </div>
            <div>
              <label style={lbl}>Nacionalidad *</label>
              <select value={datosForm.nacionalidad} onChange={e => onCambio('nacionalidad', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                <option value="Colombia">Colombia</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Perú">Perú</option>
                <option value="México">México</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Correo Electrónico *</label>
              <input type="email" value={datosForm.correo} onChange={e => onCambio('correo', e.target.value)} placeholder="ejemplo@correo.com" style={inp(errores.correo)} />
              {errores.correo && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errores.correo}</p>}
            </div>
            <div>
              <label style={lbl}>Número de Celular *</label>
              <div style={{ display: 'flex', gap: 7 }}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 10px', fontSize: 13, color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>+57</div>
                <input type="tel" value={datosForm.celular} onChange={e => onCambio('celular', e.target.value.replace(/\D/g, ''))} placeholder="3001234567" style={{ ...inp(errores.celular), flex: 1 }} />
              </div>
              {errores.celular && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errores.celular}</p>}
            </div>
            <div>
              <label style={lbl}>Tipo de Documento *</label>
              <select value={datosForm.tipoDoc} onChange={e => onCambio('tipoDoc', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PA">Pasaporte (PA)</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Número de Documento *</label>
              <input value={datosForm.numDoc} onChange={e => onCambio('numDoc', e.target.value)} placeholder="123456789" style={inp(errores.numDoc)} />
              {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errores.numDoc}</p>}
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 9 }}>
            <input type="checkbox" id="vuelo" checked={datosForm.vuelo} onChange={e => onCambio('vuelo', e.target.checked)} style={{ width: 15, height: 15, cursor: 'pointer' }} />
            <label htmlFor="vuelo" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>Voy a llegar por vuelo (opcional)</label>
          </div>
          {datosForm.vuelo && (
            <div style={{ marginTop: 12 }}>
              <label style={lbl}>Número de vuelo</label>
              <input value={datosForm.numVuelo} onChange={e => onCambio('numVuelo', e.target.value)} placeholder="Ej: AV1234" style={inp(false)} />
            </div>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: errores.terminos ? 6 : 12 }}>
            <input type="checkbox" id="tyc" checked={datosForm.terminos} onChange={e => onCambio('terminos', e.target.checked)} style={{ width: 15, height: 15, cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
            <label htmlFor="tyc" style={{ fontSize: 13, color: '#475569', cursor: 'pointer', lineHeight: 1.5 }}>
              Autorizo el tratamiento de mis datos personales conforme a la <span style={{ color: '#1e3a8a', fontWeight: 700 }}>política de privacidad</span> *
            </label>
          </div>
          {errores.terminos && <p style={{ color: '#ef4444', fontSize: 11, margin: '0 0 10px 24px' }}>{errores.terminos}</p>}
          <button onClick={() => setVerTyC(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a8a', fontSize: 12, fontWeight: 700, padding: '0 0 0 24px', textDecoration: 'underline' }}>
            » {verTyC ? 'Ocultar' : 'Ver'} términos y condiciones
          </button>
          {verTyC && (
            <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px 12px 0 0', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🚫</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', margin: '0 0 3px' }}>POLÍTICA DE NO REEMBOLSO</p>
                  <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}><strong>RentaMóvil NO realiza devoluciones del dinero</strong> bajo ninguna circunstancia una vez confirmada la reserva.</p>
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 14 }}>
                <pre style={{ fontSize: 11, color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{TERMINOS_TXT}</pre>
              </div>
            </div>
          )}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', borderRadius: 18, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, margin: '0 0 3px' }}>Total a pagar</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(total, moneda)}</p>
            <p style={{ fontSize: 10, color: '#93c5fd', margin: '3px 0 0' }}>*Incluye impuestos y cargos administrativos</p>
          </div>
          <button onClick={onReservar} style={{ padding: '14px 36px', borderRadius: 13, background: '#fff', color: '#1e3a8a', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Reservar →
          </button>
        </div>
      </div>
      <ResumenLateral vehiculo={vehiculo} reserva={reserva} seguroIdx={seguroIdx} onEditar={() => { }} onGuardar={onGuardar} />
    </div>
  )
}

/* ─────────── PÁGINA PRINCIPAL ─────────── */
export default function ReservasPage() {
  const { id } = useParams()
  const { usuario } = useAuthStore()

  const [vehiculo, setVehiculo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorVeh, setErrorVeh] = useState(null)

  // ✅ función async dentro del efecto — evita setState síncrono
  useEffect(() => {
    let activo = true

    const cargar = async () => {
      setCargando(true)
      try {
        const data = await catalogoService.getVehiculoById(id)
        if (activo) {
          setVehiculo(data)
          setErrorVeh(null)
        }
      } catch {
        if (activo) setErrorVeh('Vehículo no encontrado')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => { activo = false }
  }, [id])

  const {
    pantalla, seguroIdx, reserva,
    modalEditar, datosForm, errores, exito,
    setSeguroIdx, setModalEditar,
    handleCambioDato, handleGuardarReserva,
    handleReservar, irPantalla2, volverAtras,
  } = useReservas(vehiculo)

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (errorVeh || !vehiculo) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Vehículo no encontrado</p>
      <Link to="/catalogo" style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 14 }}>← Volver al catálogo</Link>
    </div>
  )

  if (exito) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 12px 32px rgba(30,58,138,0.28)' }}>
          <IcoCheck color="#fff" sz={34} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>¡Reserva confirmada!</h2>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 6px' }}>Tu reserva del <strong>{vehiculo.nombre}</strong> ha sido registrada.</p>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Recibirás un correo de confirmación. Redirigiendo...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', height: 68 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/"><img src={logo} alt="RentaMovil" style={{ height: 40 }} /></Link>
          <div style={{ flex: 1 }} />
          {!usuario && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={{ padding: '8px 18px', borderRadius: 9999, border: '2px solid rgba(30,58,138,0.25)', color: '#1e3a8a', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
              <Link to="/registro" style={{ padding: '8px 18px', borderRadius: 9999, background: '#1e3a8a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Registrarse</Link>
            </div>
          )}
        </div>
      </nav>

      <div style={{ paddingTop: 68 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <button onClick={volverAtras} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e3a8a', fontWeight: 700, background: 'rgba(30,58,138,0.07)', border: '1px solid rgba(30,58,138,0.15)', borderRadius: 9999, padding: '7px 15px', cursor: 'pointer' }}>
              <IcoBack /> {pantalla === 1 ? 'Volver al catálogo' : 'Volver a protección'}
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Reservar — {vehiculo.nombre}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
            {['Protección', 'Datos personales'].map((label, i) => {
              const num = i + 1
              const activo = pantalla === num
              const completado = pantalla > num
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, background: completado ? '#1e3a8a' : activo ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : '#e2e8f0', color: completado || activo ? '#fff' : '#94a3b8', boxShadow: activo ? '0 4px 12px rgba(30,58,138,0.32)' : 'none' }}>
                      {completado ? <IcoCheck color="#fff" sz={14} /> : num}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: activo ? 700 : 500, color: activo ? '#1e3a8a' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < 1 && <div style={{ width: 80, height: 2, background: pantalla > 1 ? '#1e3a8a' : '#e2e8f0', margin: '0 8px', marginBottom: 18, transition: 'background 300ms' }} />}
                </div>
              )
            })}
          </div>

          {pantalla === 1 && (
            <PantallaProteccion
              vehiculo={vehiculo}
              reserva={reserva}
              seguroIdx={seguroIdx}
              onSeleccionar={setSeguroIdx}
              onEditar={tipo => setModalEditar(tipo)}
              onGuardar={handleGuardarReserva}
            />
          )}
          {pantalla === 2 && (
            <PantallaDatos
              vehiculo={vehiculo}
              reserva={reserva}
              seguroIdx={seguroIdx}
              datosForm={datosForm}
              onCambio={handleCambioDato}
              onReservar={handleReservar}
              errores={errores}
              onGuardar={handleGuardarReserva}
            />
          )}

          {pantalla === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 28 }}>
              {errores.fechas && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '14px', width: 'auto' }}><p style={{ color: '#ef4444', fontSize: '13px', margin: 0, fontWeight: '700' }}>⚠️ {errores.fechas}</p></div>}
              <button onClick={irPantalla2} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 36px', borderRadius: 13, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(30,58,138,0.28)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Continuar con mis datos <IcoArrow />
              </button>
            </div>
          )}
        </div>
      </div>

      {modalEditar && (
        <ModalEditar
          tipo={modalEditar}
          reserva={reserva}
          vehiculo={vehiculo}
          onGuardar={handleGuardarReserva}
          onCerrar={() => setModalEditar(null)}
        />
      )}
    </div>
  )
}