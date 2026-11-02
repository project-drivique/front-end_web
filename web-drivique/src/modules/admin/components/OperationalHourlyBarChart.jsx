import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function OperationalHourlyBarChart({ hourlyData = [] }) {
  const { t } = useTranslation()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...hourlyData.map((d) => Math.max(d.deliveries || 0, d.returns || 0)),
      3
    )
    return Math.ceil(highest / 3) * 3 || 3
  }, [hourlyData])

  const svgWidth = 560
  const svgHeight = 200
  const marginTop = 15
  const marginBottom = 32
  const marginLeft = 30
  const marginRight = 15

  const chartWidth = svgWidth - marginLeft - marginRight
  const chartHeight = svgHeight - marginTop - marginBottom

  const numSlots = hourlyData.length || 10
  const slotWidth = chartWidth / numSlots
  const barWidth = 7
  const barGap = 3

  const yTicks = [0, Math.round(maxVal / 3), Math.round((maxVal * 2) / 3), maxVal]

  return (
    <div className="native-barchart-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div
        className="native-chart-legend"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '10px',
          fontSize: '11.5px',
          color: 'var(--texto-second, #64748b)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary, #2563eb)' }} />
          <span>{t('dashboard.labels.deliveries', 'Entregas')}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>{t('dashboard.labels.returns', 'Devoluciones')}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Y Gridlines */}
        {yTicks.map((tick) => {
          const yPos = marginTop + chartHeight * (1 - tick / maxVal)
          return (
            <g key={tick}>
              <line
                x1={marginLeft}
                y1={yPos}
                x2={svgWidth - marginRight}
                y2={yPos}
                stroke={tick === 0 ? 'var(--borde, #cbd5e1)' : 'var(--borde, #f1f5f9)'}
                strokeWidth={tick === 0 ? '1' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '3 3'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 3.5}
                fill="var(--texto-second, #94a3b8)"
                fontSize="10"
                fontWeight="500"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Grouped Bars */}
        {hourlyData.map((item, idx) => {
          const groupCenterX = marginLeft + idx * slotWidth + slotWidth / 2
          const delVal = item.deliveries || 0
          const retVal = item.returns || 0

          const hDel = (delVal / maxVal) * chartHeight
          const yDel = marginTop + chartHeight - hDel
          const xDel = groupCenterX - barWidth - barGap / 2

          const hRet = (retVal / maxVal) * chartHeight
          const yRet = marginTop + chartHeight - hRet
          const xRet = groupCenterX + barGap / 2

          const isHovered = hoveredIndex === idx

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && (
                <rect
                  x={groupCenterX - slotWidth / 2 + 2}
                  y={marginTop}
                  width={slotWidth - 4}
                  height={chartHeight}
                  fill="rgba(var(--brand-primary-rgb), 0.04)"
                  rx="4"
                />
              )}

              {delVal > 0 && (
                <rect
                  x={xDel}
                  y={yDel}
                  width={barWidth}
                  height={hDel}
                  fill="var(--brand-primary, #2563eb)"
                  rx="2"
                  ry="2"
                />
              )}

              {retVal > 0 && (
                <rect
                  x={xRet}
                  y={yRet}
                  width={barWidth}
                  height={hRet}
                  fill="#10b981"
                  rx="2"
                  ry="2"
                />
              )}

              <text
                x={groupCenterX}
                y={svgHeight - 10}
                fill={isHovered ? 'var(--brand-primary, #2563eb)' : 'var(--texto-second, #64748b)'}
                fontSize="10.5"
                fontWeight={isHovered ? '700' : '500'}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>

      {hoveredIndex !== null && hourlyData[hoveredIndex] && (
        <div
          className="native-chart-tooltip"
          style={{
            position: 'absolute',
            top: '25px',
            left: `${((marginLeft + hoveredIndex * slotWidth + slotWidth / 2) / svgWidth) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-tarjeta, #ffffff)',
            border: '1px solid var(--borde, #e2e8f0)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <strong style={{ display: 'block', fontSize: '11.5px', marginBottom: '3px', color: 'var(--texto-primary, #0f172a)' }}>
            {hourlyData[hoveredIndex].label}
          </strong>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--brand-primary, #2563eb)' }}>
            <span>{t('dashboard.labels.deliveriesColon', 'Entregas:')}</span>
            <strong>{hourlyData[hoveredIndex].deliveries}</strong>
          </div>
          <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center', color: '#10b981' }}>
            <span>{t('dashboard.labels.returnsColon', 'Devoluciones:')}</span>
            <strong>{hourlyData[hoveredIndex].returns}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
