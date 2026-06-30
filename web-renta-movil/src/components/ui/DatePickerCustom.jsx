import React, { useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, eachDayOfInterval } from 'date-fns';
import reservationsMock from '../../mocks/reservationsMock.json';
import { useTranslation } from 'react-i18next';

export default function DatePickerCustom({ selectedDate, onChange, placeholder, minDate, excludeVehicleId }) {
  const { t } = useTranslation();

  // Filtrar reservaciones para bloquear días.
  // Si excludeVehicleId está presente, podríamos filtrar las reservas de ese vehículo.
  const blockedDates = useMemo(() => {
    let dates = [];
    const filteredReservations = excludeVehicleId 
      ? reservationsMock.filter(r => r.roomId === excludeVehicleId)
      : reservationsMock;

    filteredReservations.forEach(reservation => {
      if (reservation.startDate && reservation.endDate) {
        const interval = eachDayOfInterval({
          start: parseISO(reservation.startDate),
          end: parseISO(reservation.endDate)
        });
        dates = [...dates, ...interval];
      }
    });
    return dates;
  }, [excludeVehicleId]);

  return (
    <div className="relative w-full">
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        minDate={minDate || new Date()}
        excludeDates={blockedDates}
        placeholderText={placeholder || t('calendar.startDate', 'Seleccionar fecha')}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none text-gray-700 bg-white shadow-sm hover:border-gray-300 cursor-pointer"
        dayClassName={(date) => 
          blockedDates.some(bd => bd.getTime() === date.getTime()) 
            ? "line-through text-red-500 bg-red-50 hover:bg-red-100 font-semibold" 
            : undefined
        }
      />
    </div>
  );
}
