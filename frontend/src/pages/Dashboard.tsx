import { useEffect, useState } from "react";
import { getHabits, createHabit } from "../services/habits";

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

  const [creating, setCreating] = useState(false);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [frecuencia, setFrecuencia] = useState("diaria");

  // Función reutilizable
  const fetchHabits = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchHabits();
  }, []);

  // Crear hábito
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

     setCreating(true); 

    try {
      await createHabit({
        nombre,
        descripcion,
        frecuencia,
      });

      // limpiar formulario
      setNombre("");
      setDescripcion("");
      setFrecuencia("diaria");

      //refrescar lista
      fetchHabits();
    } catch (err) {
      alert("Error al crear hábito");
    } finally {
    setCreating(false);
  };

  if (loading) return <p>Cargando hábitos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      {/* FORMULARIO */}
      <h2>Crear nuevo hábito</h2>
      <form onSubmit={handleCreateHabit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <select
          value={frecuencia}
          onChange={(e) => setFrecuencia(e.target.value)}
        >
          <option value="diaria">Diaria</option>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
        </select>

        <button type="submit" disabled={creating}>
        {creating ? "Creando..." : "Crear hábito"}
        </button>
      </form>

      {/* LISTA */}
      <h2>Tus hábitos</h2>

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