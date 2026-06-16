import { useState } from 'react';
import { useLanding } from '../../../landing/LandingContext';
import { formatCurrency } from '@/utils/monedaUtils';


const TERMINOS_TXT = `
1. DURACIÓN DEL CONTRATO
   La duración de la renta será la indicada en la reserva, desde la fecha y hora de inicio hasta la fecha y hora de finalizar.


2. PAGOS Y TARIFAS
   - El precio incluye la renta del vehículo, impuestos y cargos administrativos.
   - Se requiere un pago total o parcial al momento de confirmar la reserva.


3. KILOMETRAJE
   - Opción limitado: Incluye km por día. Si se supera el límite, se cobrará un adicional por cada kilómetro extra ($1.500 COP/km).
   - Opción ilimitado: No hay límite de kilómetros durante el periodo de renta.


4. EXCESO DE KILOMETRAJE (solo para opción limitado)
   - Se cobrará un valor por kilómetro adicional ($1.500 COP/km) por cada km que supere el límite pactado.
   - El exceso se calcula al momento de la devolución del vehículo.


5. CANCELACIONES Y REEMBOLSOS
   - RentaMóvil NO realiza devoluciones del dinero bajo ninguna circunstancia una vez confirmada la reserva.
   - No se aplican reembolsos por cancelaciones, cambios de planes, no presentación ni por ningún otro motivo.


6. DOCUMENTACIÓN REQUERIDA
   - El usuario debe presentar documento de identidad válido (CC, CE o Pasaporte).
   - Debe cumplir con los requisitos de edad y licencia de conducción según normativa vigente.


7. USO DEL VEHÍCULO
   - El vehículo debe ser usado únicamente en territorio colombiano.
   - No se permite subarriendo, uso comercial no autorizado, ni transporte de carga prohibida.


8. DAÑOS Y RESPONSABILIDAD
   - El usuario es responsable por daños causados al vehículo durante el periodo de renta, excepto los cubiertos por el seguro contratado.
   - En caso de accidente, se deberá notificar inmediatamente a RentaMóvil y a las autoridades correspondientes.


9. MODIFICACIONES AL CONTRATO
   - Cualquier cambio en fechas, horas, sucursal o tipo de kilometraje debe ser acordado previamente con RentaMóvil.
   - Los cambios pueden implicar ajustes en el precio total.


10. LEGISLACIÓN APLICABLE
    Este contrato se rige por las leyes de la República de Colombia.
`;


export default function DatosPersonales({ vehiculo, reserva, seguroIdx, datosForm, onCambio, onReservar, errores }) {
  const { moneda } = useLanding();
  const [verTyC, setVerTyC] = useState(false);


  const tarifas = vehiculo.tarifas || {};
  const kmLimit = tarifas.kmLimitado || { precio: 0, km: 0 };
  const kmIlimit = tarifas.kmIlimitado || { precio: 0 };
  const precio = reserva.tipoKm === 'ilimitado' ? kmIlimit.precio : kmLimit.precio;


  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;


  const precioSeg = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0;
  const subtotal = precio * dias;
  const subtotalSeg = precioSeg * dias;
  const cargos = Math.round((subtotal + subtotalSeg) * 0.10);
  const total = subtotal + subtotalSeg + cargos;


  const inp = (err) => ({
    width: '100%', padding: '14px', borderRadius: 12, boxSizing: 'border-box',
    border: `2px solid ${err ? '#fca5a5' : 'var(--borde)'}`,
    background: err ? '#fef2f2' : 'var(--bg-item)',
    fontSize: 14, color: 'var(--texto-primary)', outline: 'none',
    transition: 'border-color 200ms ease'
  });


  const lbl = { display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--texto-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };


  return (
    <div>
      <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--texto-primary)', margin: '0 0 6px' }}>Datos Personales</h3>
      <p style={{ fontSize: 14, color: 'var(--texto-second)', margin: '0 0 8px' }}>Informa tus datos para que podamos realizar tu reserva.</p>
      <p style={{ fontSize: 12, color: '#ef4444', fontStyle: 'italic', margin: '0 0 24px' }}>Los campos marcados con asterisco (*) son obligatorios.</p>


      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, border: '1px solid var(--borde)', padding: '28px', marginBottom: 20, boxShadow: 'var(--sombra-tarjeta)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <div>
            <label style={lbl}>Nombre Completo *</label>
            <input value={datosForm.nombre} onChange={e => onCambio('nombre', e.target.value)} placeholder="Ej: Juan Pérez García" style={inp(errores.nombre)} />
            {errores.nombre && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.nombre}</p>}
          </div>
          <div>
            <label style={lbl}>Nacionalidad *</label>
            <select value={datosForm.nacionalidad} onChange={e => onCambio('nacionalidad', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
              <option value="Colombia">Colombia</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Alemania">Alemania</option>
              <option value="Francia">Francia</option>
              <option value="España">España</option>
              <option value="Italia">Italia</option>
              <option value="Reino Unido">Reino Unido</option>
              <option value="Canadá">Canadá</option>
              <option value="Brasil">Brasil</option>
              <option value="Argentina">Argentina</option>
              <option value="México">México</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Perú">Perú</option>
              <option value="Chile">Chile</option>
              <option value="Australia">Australia</option>
              <option value="Japón">Japón</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Correo Electrónico *</label>
            <input type="email" value={datosForm.correo} onChange={e => onCambio('correo', e.target.value)} placeholder="ejemplo@correo.com" style={inp(errores.correo)} />
            {errores.correo && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.correo}</p>}
          </div>
          <div>
            <label style={lbl}>Número de Celular *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'var(--bg-item)', border: '2px solid var(--borde)', borderRadius: 12, padding: '14px', fontSize: 14, color: 'var(--texto-second)', fontWeight: 800, whiteSpace: 'nowrap' }}>+57</div>
              <input type="tel" value={datosForm.celular} onChange={e => onCambio('celular', e.target.value.replace(/\D/g, ''))} placeholder="3001234567" style={{ ...inp(errores.celular), flex: 1 }} />
            </div>
            {errores.celular && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.celular}</p>}
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
            {errores.numDoc && <p style={{ color: '#ef4444', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>{errores.numDoc}</p>}
          </div>
        </div>


        {/* AVISO INFORMATIVO DEL KILOMETRAJE */}
        <div style={{
          background: reserva.tipoKm === 'limitado' ? '#fef2f2' : '#f0fdf4',
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${reserva.tipoKm === 'limitado' ? '#fecaca' : '#bbf7d0'}`,
          marginTop: 24,
        }}>
          {reserva.tipoKm === 'limitado' && (
            <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
              <strong>Plan de kilometraje limitado:</strong> Incluye{' '}
              <strong>{kmLimit.km} km por día</strong>.{' '}
              <strong>Si superas el límite,</strong> se cobrará un adicional de{' '}
              <strong>{formatCurrency(1500, moneda)} por km extra</strong> al devolver el vehículo.
            </p>
          )}
          {reserva.tipoKm === 'ilimitado' && (
            <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.5 }}>
              <strong>Plan de kilometraje ilimitado:</strong> No hay límite de kilómetros.{' '}
              Puedes manejar sin restricciones durante todo el periodo de renta.
            </p>
          )}
        </div>
      </div>


      <div style={{ background: 'var(--bg-tarjeta)', borderRadius: 24, border: '1px solid var(--borde)', padding: '24px', marginBottom: 20, boxShadow: 'var(--sombra-tarjeta)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: errores.terminos ? 8 : 16 }}>
          <input type="checkbox" id="tyc" checked={datosForm.terminos} onChange={e => onCambio('terminos', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0, accentColor: '#1e3a8a' }} />
          <label htmlFor="tyc" style={{ fontSize: 14, color: 'var(--texto-primary)', cursor: 'pointer', lineHeight: 1.5 }}>
            Autorizo el tratamiento de mis datos personales conforme a la <span style={{ color: '#1e3a8a', fontWeight: 800 }}>política de privacidad</span> *
          </label>
        </div>
        {errores.terminos && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px 28px', fontWeight: 600 }}>{errores.terminos}</p>}


        <button onClick={() => setVerTyC(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 14, fontWeight: 800, padding: '0 0 0 28px', transition: 'opacity 200ms ease' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {verTyC ? '▼ Ocultar' : '▶ Leer'} términos y condiciones
        </button>


        {verTyC && (
          <div style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid #1e3a8a' }}>
            <div style={{ background: '#1e3a8a', padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#bfdbfe', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Políticas Importantes</p>
                <p style={{ fontSize: 13, color: '#ffffff', margin: 0, lineHeight: 1.5 }}>
                  <strong>RentaMóvil NO realiza devoluciones de dinero</strong> bajo ninguna circunstancia una vez confirmada la reserva.
                </p>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: 18 }}>
              <pre style={{ fontSize: 12, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{TERMINOS_TXT}</pre>
            </div>
          </div>
        )}
      </div>


      <div style={{ background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', borderRadius: 24, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap', boxShadow: '0 12px 32px rgba(30,58,138,0.25)' }}>
        <div>
          <p style={{ fontSize: 13, color: '#bfdbfe', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total a pagar</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>{formatCurrency(total, moneda)}</p>
          <p style={{ fontSize: 11, color: '#bfdbfe', margin: '6px 0 0' }}>*Incluye impuestos y cargos administrativos</p>
        </div>
        <button
          onClick={onReservar}
          style={{ padding: '16px 40px', borderRadius: 16, background: '#fff', color: '#1e3a8a', fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', whiteSpace: 'nowrap', transition: 'transform 200ms ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Confirmar Reserva →
        </button>
      </div>
    </div>
  );
}