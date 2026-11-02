import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseISOToDate } from './branchDashboardHelpers'

export default function OperationalDateRangeCalendar({ startDateStr, endDateStr, onSelectRange }) {
  const { t } = useTranslation()
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const base = startDateStr ? parseISOToDate(startDateStr) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const monthYearLabel = useMemo(() => {
    const monthNames = [
      t('common.months.january', 'Enero'), t('common.months.february', 'Febrero'), 
      t('common.months.march', 'Marzo'), t('common.months.april', 'Abril'), 
      t('common.months.may', 'Mayo'), t('common.months.june', 'Junio'),
      t('common.months.july', 'Julio'), t('common.months.august', 'Agosto'), 
      t('common.months.september', 'Septiembre'), t('common.months.october', 'Octubre'), 
      t('common.months.november', 'Noviembre'), t('common.months.december', 'Diciembre')
    ]
    return `${monthNames[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`
  }, [currentMonthDate, t])

  const daysGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7
    const totalDays = new Date(year, month + 1, 0).getDate()
    const prevMonthTotalDays = new Date(year, month, 0).getDate()

    const days = []
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateStr: null,
      })
    }
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0')
      const dStr = String(d).padStart(2, '0')
      const dateStr = `${year}-${mStr}-${dStr}`
      days.push({
        dayNum: d,
        isCurrentMonth: true,
        dateStr,
      })
    }
    const remaining = (7 - (days.length % 7)) % 7
    for (let n = 1; n <= remaining; n++) {
      days.push({
        dayNum: n,
        isCurrentMonth: false,
        dateStr: null,
      })
    }
    return days
  }, [currentMonthDate])

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDayClick = (dayItem) => {
    if (!dayItem.isCurrentMonth || !dayItem.dateStr) return
    const clicked = dayItem.dateStr

    if (!startDateStr || (startDateStr && endDateStr && startDateStr !== endDateStr)) {
      onSelectRange(clicked, clicked)
    } else if (clicked < startDateStr) {
      onSelectRange(clicked, clicked)
    } else {
      onSelectRange(startDateStr, clicked)
    }
  }

  const weekHeaders = [
    t('common.daysShort.mon', 'Lu'), t('common.daysShort.tue', 'Ma'), 
    t('common.daysShort.wed', 'Mi'), t('common.daysShort.thu', 'Ju'), 
    t('common.daysShort.fri', 'Vi'), t('common.daysShort.sat', 'Sá'), 
    t('common.daysShort.sun', 'Do')
  ]

  return (
    <div className="native-inline-calendar">
      <div className="native-cal-header">
        <button type="button" className="native-cal-nav-btn" onClick={handlePrevMonth} title={t('common.prevMonth', 'Mes anterior')}>
          &lt;
        </button>
        <strong className="native-cal-title">{monthYearLabel}</strong>
        <button type="button" className="native-cal-nav-btn" onClick={handleNextMonth} title={t('common.nextMonth', 'Mes siguiente')}>
          &gt;
        </button>
      </div>

      <div className="native-cal-week-row">
        {weekHeaders.map((h) => (
          <span key={h} className="native-cal-week-head">{h}</span>
        ))}
      </div>

      <div className="native-cal-grid">
        {daysGrid.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <div key={`disabled-${idx}`} className="native-cal-day native-cal-day--disabled">
                {item.dayNum}
              </div>
            )
          }

          const isStart = item.dateStr === startDateStr
          const isEnd = item.dateStr === endDateStr
          const isInRange =
            startDateStr &&
            endDateStr &&
            item.dateStr >= startDateStr &&
            item.dateStr <= endDateStr

          let cellClass = 'native-cal-day'
          if (isStart && isEnd) cellClass += ' native-cal-day--selected-single'
          else if (isStart) cellClass += ' native-cal-day--range-start'
          else if (isEnd) cellClass += ' native-cal-day--range-end'
          else if (isInRange) cellClass += ' native-cal-day--in-range'

          return (
            <button
              key={item.dateStr}
              type="button"
              className={cellClass}
              onClick={() => handleDayClick(item)}
            >
              {item.dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* COMPONENTE NATIVO: GRÁFICO SVG DE BARRAS DE CARGA OPERATIVA POR FRANJA HORARIA */
