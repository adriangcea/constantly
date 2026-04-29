import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  getHabits, createHabit, markHabitDone, getStreak, getTodayProgress } from "../services/habits";

interface Habit {
  id_habito: number;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  streak?: number;        // racha actual
  doneToday?: boolean;    // si ya se marcó hoy
}

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null); // hábito que se está marcando

  // Formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [frecuencia, setFrecuencia] = useState("diaria");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchHabits = async () => {
    try {
      setLoading(true);
      
      // Cargamos hábitos y progreso de hoy en paralelo
      const [data, todayIds] = await Promise.all([
        getHabits(),
        getTodayProgress(),
      ]);

      // Para cada hábito, obtener su racha
      const habitsWithStreak = await Promise.all(
        data.map(async (habit: Habit) => {
          try {
            const { streak } = await getStreak(habit.id_habito);
            return { ...habit, streak };
          } catch {
            return { ...habit, streak: 0 };
          }
        })
      );

      setHabits(habitsWithStreak);
      setCompletedToday(todayIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`No se pudieron cargar los hábitos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    setCreating(true);

    try {
      await createHabit({ nombre, descripcion, frecuencia });
      setNombre("");
      setDescripcion("");
      setFrecuencia("diaria");
      fetchHabits();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "No se pudo determinar la causa del error.";
      alert(`Error al crear hábito: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleMarkDone = async (habitId: number) => {
    setMarkingId(habitId);
    try {
      await markHabitDone(habitId);
      // Refrescar solo para actualizar racha y estado
      fetchHabits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      // Si ya estaba marcado hoy, lo indicamos 
      if (errorMessage.includes("Ya marcado")) {
        alert("Este hábito ya lo completaste hoy 👍");
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setMarkingId(null);
    }
  };

  //Habitos pendientes hoy
  const pendingHabits = habits.filter(
    (h) => !completedToday.includes(h.id_habito)
  );

  if (loading) return <p>Cargando hábitos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <div>
          <button onClick={() => navigate("/profile")}>Mi perfil</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>

      {/* RECORDATORIO */}
      {pendingHabits.length > 0 && (
        <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
          <strong>⏰ Tienes {pendingHabits.length} hábito{pendingHabits.length > 1 ? "s" : ""} pendiente{pendingHabits.length > 1 ? "s" : ""} hoy:</strong>
          <ul style={{ margin: "8px 0 0 0" }}>
            {pendingHabits.map((h) => (
              <li key={h.id_habito}>{h.nombre}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TODOS COMPLETADOS */}
      {habits.length > 0 && pendingHabits.length === 0 && (
        <div style={{ backgroundColor: "#d4edda", border: "1px solid #28a745", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
          <strong>✅ ¡Has completado todos tus hábitos de hoy!</strong>
        </div>
      )}

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
          {habits.map((habit) => {
            const done = completedToday.includes(habit.id_habito);
            return (
              <li key={habit.id_habito}>
                <h3>{habit.nombre} {done && "✅"}</h3>
                <p>{habit.descripcion}</p>
                <p>Frecuencia: {habit.frecuencia}</p>
                <p>🔥 Racha: {habit.streak ?? 0} días</p>
                <button
                  onClick={() => handleMarkDone(habit.id_habito)}
                  disabled={markingId === habit.id_habito || done}
                >
                  {done ? "Completado hoy" : markingId === habit.id_habito ? "Guardando..." : "✓ Completado hoy"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}