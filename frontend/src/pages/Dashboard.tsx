import { useEffect, useState } from "react";
import { getHabits } from "../services/habits";

interface Habit {
  id_habito: number;
  nombre: string;
  descripcion: string;
  frecuencia: string;
}

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await getHabits();
        setHabits(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        setError(`No se pudieron cargar los hábitos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  if (loading) return <p>Cargando hábitos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      {habits.length === 0 ? (
        <p>No tienes hábitos aún</p>
      ) : (
        <ul>
          {habits.map((habit) => (
            <li key={habit.id_habito}>
              <h3>{habit.nombre}</h3>
              <p>{habit.descripcion}</p>
              <p>Frecuencia: {habit.frecuencia}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}