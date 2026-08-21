import { useMemo } from 'react'; // Importa useMemo para memorizar cálculos y evitar recomputarlos en cada render.
import DatePicker from 'react-datepicker'; // Importa el calendario visual listo para usar.
import 'react-datepicker/dist/react-datepicker.css'; // Carga los estilos base del DatePicker.
import { parseISO, eachDayOfInterval } from 'date-fns'; // parseISO convierte strings a Date; eachDayOfInterval genera todos los días entre dos fechas.
import reservationsMock from '../../mocks/reservationsMock.json'; // Importa reservas de ejemplo desde un JSON.
import { useTranslation } from 'react-i18next'; // Hook para mostrar textos traducidos según el idioma.

export default function DatePickerCustom({
  selectedDate, // Fecha actualmente seleccionada.
  onChange, // Función que se ejecuta cuando el usuario cambia la fecha.
  placeholder, // Texto opcional del placeholder.
  minDate, // Fecha mínima permitida para seleccionar.
  excludeVehicleId // ID del vehículo que quieres excluir o filtrar en reservas.
}) {
  const { t } = useTranslation(); // Función t para traducir textos.

  // Bloquea los días que ya están reservados.
  const blockedDates = useMemo(() => {
    let dates = []; // Aquí se guardarán todas las fechas bloqueadas.

    // Si existe excludeVehicleId, filtra solo las reservas de ese vehículo.
    const filteredReservations = excludeVehicleId
      ? reservationsMock.filter(r => r.roomId === excludeVehicleId)
      : reservationsMock;

    // Recorre cada reserva filtrada.
    filteredReservations.forEach(reservation => {
      // Verifica que existan fecha inicio y fecha fin.
      if (reservation.startDate && reservation.endDate) {
        // Convierte las fechas string a objetos Date y obtiene todos los días del intervalo.
        const interval = eachDayOfInterval({
          start: parseISO(reservation.startDate),
          end: parseISO(reservation.endDate)
        });

        // Agrega ese rango de días al arreglo total.
        dates = [...dates, ...interval];
      }
    });

    return dates; // Devuelve todas las fechas bloqueadas.
  }, [excludeVehicleId]); // Solo se recalcula si cambia excludeVehicleId.

  return (
    <div className="relative w-full"> {/* Contenedor principal del componente */}
      <DatePicker
        selected={selectedDate} // Fecha seleccionada actualmente.
        onChange={onChange} // Función que se llama al elegir una fecha.
        minDate={minDate || new Date()} // Si no llega minDate, usa la fecha actual.
        excludeDates={blockedDates} // Fechas que no se pueden seleccionar.
        placeholderText={placeholder || t('calendar.startDate', 'Seleccionar fecha')} // Placeholder traducido o personalizado.
        className="w-full px-4 py-3 rounded-lg border-2 border-[var(--borde)] focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none text-[var(--texto-primary)] bg-[var(--bg-tarjeta)] shadow-sm hover:border-red-300 cursor-pointer" // Estilos del input, ahora usan las variables de tema (claro/oscuro).
        dayClassName={(date) =>
          blockedDates.some(bd => bd.getTime() === date.getTime()) // Compara si el día actual está bloqueado.
            ? "line-through text-red-500 bg-red-50 hover:bg-red-100 font-semibold" // Estilo para días bloqueados.
            : undefined // Si no está bloqueado, no aplica clase extra.
        }
      />
    </div>
  );
}
