import { useEffect, useState } from "react";
import { getHabitProgress } from "../services/habits";

interface Props {
  habitId: number;
}

interface ProgressEntry {
  fecha: string;
  completado: boolean;
}

export default function HabitCalendar({ habitId }: Props) {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fecha actual
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Días del mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Día de la semana en que empieza el mes (0=Dom, ajustamos a Lunes=0)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data: ProgressEntry[] = await getHabitProgress(habitId);
        const dates = data
          .filter((e) => e.completado)
          .map((e) => e.fecha.split("T")[0]);
        setCompletedDates(dates);
      } catch {
        setCompletedDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [habitId]);

  const isCompleted = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return completedDates.includes(dateStr);
  };

  const isToday = (day: number): boolean => {
    return day === today.getDate();
  };

  if (loading) return (
    <p className="text-c-gray text-xs animate-pulse mt-3">Cargando historial...</p>
  );

  return (
    <div className="mt-4 border-t border-c-light/10 pt-4">
      {/* CABECERA MES */}
      <p className="text-xs font-semibold text-c-gray uppercase tracking-wider mb-3">
        {monthNames[month]} {year}
      </p>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 mb-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-xs text-c-gray/50 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* DÍAS DEL MES */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días vacíos */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Días */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const completed = isCompleted(day);
          const todayDay = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition
                ${completed
                  ? "bg-c-white text-c-black"
                  : todayDay
                  ? "border border-c-gray/50 text-c-white"
                  : "text-c-gray/60"
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* LEYENDA */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-c-white" />
          <span className="text-xs text-c-gray">Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-c-gray/50" />
          <span className="text-xs text-c-gray">Hoy</span>
        </div>
      </div>
    </div>
  );
}