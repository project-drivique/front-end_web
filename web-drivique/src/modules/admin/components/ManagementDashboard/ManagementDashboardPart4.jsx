import { useTranslation } from 'react-i18next'

function WeeklyGroupedBarChart({ data = [], isDark = false }) {
  const { t } = useTranslation()
  const chartData = Array.isArray(data) && data.length > 0 ? data : t('vehiculo.calendarDays', 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom').split(',').map((day) => ({ day, entregas: 0, devoluciones: 0 }))
  const maxDataVal = Math.max(
    ...chartData.map((d) => Math.max(Number(d?.entregas) || 0, Number(d?.devoluciones) || 0)),
    4
  )
  const maxVal = Math.max(4, Math.ceil(maxDataVal / 4) * 4)
  const step = maxVal / 4
  const yTicks = [0, Math.round(step), Math.round(step * 2), Math.round(step * 3), maxVal]

  const svgWidth = 540
  const svgHeight = 210
  const marginTop = 30
  const marginBottom = 35
  const marginLeft = 35
  const marginRight = 15

  const chartWidth = svgWidth - marginLeft - marginRight
  const chartHeight = svgHeight - marginTop - marginBottom

  const numCategories = chartData.length
  const categoryWidth = chartWidth / numCategories
  const barWidth = 14
  const barGap = 4

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines and Y axis ticks */}
        {yTicks.map((tick) => {
          const yPos = marginTop + chartHeight * (1 - tick / maxVal)
          return (
            <g key={tick}>
              <line
                x1={marginLeft}
                y1={yPos}
                x2={svgWidth - marginRight}
                y2={yPos}
                stroke={tick === 0 ? (isDark ? '#475569' : '#94a3b8') : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9')}
                strokeWidth={tick === 0 ? '1.5' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '4 4'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 4}
                fill={isDark ? '#94a3b8' : '#64748b'}
                fontSize="11"
                fontWeight="600"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Grouped Bars per Day */}
        {chartData.map((item, idx) => {
          const groupCenterX = marginLeft + idx * categoryWidth + categoryWidth / 2
          const entregasVal = Number(item?.entregas) || 0
          const devolucionesVal = Number(item?.devoluciones) || 0

          // Bar 1: Entregas
          const hEntregas = (entregasVal / maxVal) * chartHeight
          const yEntregas = marginTop + chartHeight - hEntregas
          const xEntregas = groupCenterX - barWidth - barGap / 2

          // Bar 2: Devoluciones
          const hDevoluciones = (devolucionesVal / maxVal) * chartHeight
          const yDevoluciones = marginTop + chartHeight - hDevoluciones
          const xDevoluciones = groupCenterX + barGap / 2

          return (
            <g key={item.day || idx}>
              {/* Entregas Bar */}
              <rect
                x={xEntregas}
                y={yEntregas}
                width={barWidth}
                height={hEntregas}
                fill="var(--brand-primary, #2563eb)"
                rx="3"
                ry="3"
                style={{ transition: 'all 0.4s ease' }}
              >
                <title>{`Entregas ${item.day}: ${entregasVal}`}</title>
              </rect>
              {/* Entregas Value Label */}
              <text
                x={xEntregas + barWidth / 2}
                y={yEntregas - 4}
                fill="var(--brand-primary, #2563eb)"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {entregasVal}
              </text>

              {/* Devoluciones Bar */}
              <rect
                x={xDevoluciones}
                y={yDevoluciones}
                width={barWidth}
                height={hDevoluciones}
                fill="#10b981"
                rx="3"
                ry="3"
                style={{ transition: 'all 0.4s ease' }}
              >
                <title>{`Devoluciones ${item.day}: ${devolucionesVal}`}</title>
              </rect>
              {/* Devoluciones Value Label */}
              <text
                x={xDevoluciones + barWidth / 2}
                y={yDevoluciones - 4}
                fill="#10b981"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {devolucionesVal}
              </text>

              {/* Day Label (X Axis) */}
              <text
                x={groupCenterX}
                y={svgHeight - 10}
                fill={isDark ? '#cbd5e1' : '#475569'}
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
              >
                {item.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ManagementDashboardPart4({ availPct, availableVehicles, c, isBranchManager, isDark, maintPct, maintenanceVehicles, rentedPct, rentedVehicles, t, totalVehicles, weeklyData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
            
            {/* Gráfica 1: Ocupación y Estado de la Flota */}
            <div style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
                    Estado de la Flota
                  </h3>
                  <span style={{ fontSize: 12, color: c.textMuted }}>{isBranchManager ? t('hc3.fleet_dist_branch', { defaultValue: 'Distribución de los {{total}} vehículos de la sucursal', total: totalVehicles }) : t('hc3.fleet_dist_all', { defaultValue: 'Distribución de los {{total}} vehículos de todas las sucursales', total: totalVehicles })}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.tagText, background: c.tagBg, padding: '4px 10px', borderRadius: 20 }}>
                  {totalVehicles} Vehículo{totalVehicles === 1 ? '' : 's'}
                </span>
              </div>
  
              {/* Barra de progreso combinada visual */}
              <div style={{ height: 12, borderRadius: 6, background: c.trackBg, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
                <div style={{ width: `${availPct}%`, background: '#10b981', transition: 'width 0.4s' }} title={`Disponibles: ${availPct}%`} />
                <div style={{ width: `${rentedPct}%`, background: 'var(--brand-primary, #2563eb)', transition: 'width 0.4s' }} title={`En Alquiler: ${rentedPct}%`} />
                <div style={{ width: `${maintPct}%`, background: '#f59e0b', transition: 'width 0.4s' }} title={`En Taller: ${maintPct}%`} />
              </div>
  
              {/* Lista Desglosada Limpia */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc4.disponibles', 'Disponibles')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{availableVehicles} autos</strong>
                    <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({availPct}%)</span>
                  </div>
                </div>
  
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-primary, #2563eb)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc.en_alquiler', 'En Alquiler')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{rentedVehicles} autos</strong>
                    <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({rentedPct}%)</span>
                  </div>
                </div>
  
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc.en_taller_mantenimiento', 'En Taller / Mantenimiento')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{maintenanceVehicles} autos</strong>
                    <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({maintPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Gráfica 2: Diagrama de Barras Agrupadas Estándar */}
            <div style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
                    Actividad Semanal
                  </h3>
                  <span style={{ fontSize: 12, color: c.textMuted }}>{t('hc.entregas_vs_devoluciones_de_la_semana', 'Entregas vs. Devoluciones de la semana')}</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--brand-primary, #2563eb)' }} /> Entregas
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Devoluciones
                  </span>
                </div>
              </div>
  
              {/* SVG Grouped Bar Chart */}
              <WeeklyGroupedBarChart data={weeklyData} isDark={isDark} />
            </div>
  
          </div>
  )
}
