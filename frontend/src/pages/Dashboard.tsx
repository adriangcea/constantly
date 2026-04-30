import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import HabitCalendar from "../components/HabitCalendar";
import {
  getHabits,
  createHabit,
  markHabitDone,
  getStreak,
  getTodayProgress,
  updateHabit,
  deleteHabit,
} from "../services/habits";

interface Habit {
  id_habito: number;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  streak?: number;
}

interface EditForm {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [calendarOpenId, setCalendarOpenId] = useState<number | null>(null);

  // Notificaciones
  const [notifOpen, setNotifOpen] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);

  // Edición inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ nombre: "", descripcion: "", frecuencia: "diaria" });
  const [saving, setSaving] = useState(false);

  // Formulario crear
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
      const [data, todayIds] = await Promise.all([
        getHabits(),
        getTodayProgress(),
      ]);

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
      setBadgeVisible(true);
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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) setBadgeVisible(false);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    setCreating(true);
    try {
      await createHabit({ nombre, descripcion, frecuencia });
      setNombre("");
      setDescripcion("");
      setFrecuencia("diaria");
      setFormOpen(false);
      fetchHabits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al crear hábito: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleMarkDone = async (habitId: number) => {
    setMarkingId(habitId);
    try {
      await markHabitDone(habitId);
      fetchHabits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("Ya marcado")) {
        alert("Este hábito ya lo completaste hoy 👍");
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setMarkingId(null);
    }
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingId(habit.id_habito);
    setEditForm({ nombre: habit.nombre, descripcion: habit.descripcion, frecuencia: habit.frecuencia });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (habitId: number) => {
    setSaving(true);
    try {
      await updateHabit(habitId, editForm);
      setEditingId(null);
      fetchHabits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error al actualizar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (habitId: number, nombre: string) => {
    const confirmed = window.confirm(`¿Eliminar el hábito "${nombre}"? Se borrará todo su progreso.`);
    if (!confirmed) return;
    try {
      await deleteHabit(habitId);
      fetchHabits();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error al eliminar: ${errorMessage}`);
    }
  };

  const pendingHabits = habits.filter((h) => !completedToday.includes(h.id_habito));

  if (loading) return (
    <div className="min-h-screen bg-c-black flex items-center justify-center">
      <p className="text-c-gray text-sm animate-pulse">Cargando hábitos...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-c-black flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-c-black text-c-white">

        {/* NAVBAR */}
        <nav className="bg-c-dark border-b border-c-light/10 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="Constantly" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            <h1 className="text-lg font-bold tracking-tight truncate">Constantly</h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">

            {/* CAMPANA DE NOTIFICACIONES */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleToggleNotif}
                className="relative text-sm text-c-gray hover:text-c-white transition p-2 rounded-lg hover:bg-c-light/10"
              >
                🔔
                {badgeVisible && pendingHabits.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-c-white text-c-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingHabits.length}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-c-dark border border-c-light/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-c-light/10">
                    <p className="text-sm font-semibold text-c-white">Pendientes hoy</p>
                  </div>

                  {pendingHabits.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-c-gray text-sm">✅ ¡Todo completado!</p>
                      <p className="text-c-gray/50 text-xs mt-1">No tienes hábitos pendientes hoy</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-c-light/10 max-h-64 overflow-y-auto">
                      {pendingHabits.map((h) => (
                        <li key={h.id_habito} className="px-4 py-3 flex items-center justify-between gap-3">
                          <span className="text-sm text-c-white truncate">{h.nombre}</span>
                          <button
                            onClick={async () => {
                              await handleMarkDone(h.id_habito);
                              if (pendingHabits.length === 1) setNotifOpen(false);
                            }}
                            className="text-xs bg-c-white hover:bg-c-light text-c-black font-medium rounded-lg px-2.5 py-1 transition shrink-0"
                          >
                            ✓ Marcar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="text-sm text-c-gray hover:text-c-white transition p-2 rounded-lg hover:bg-c-light/10 hidden sm:block"
            >
              Mi perfil
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="text-sm text-c-gray hover:text-c-white transition p-2 rounded-lg hover:bg-c-light/10 sm:hidden"
              title="Mi perfil"
            >
              👤
            </button>

            <button
              onClick={handleLogout}
              className="text-sm bg-c-light/10 hover:bg-c-light/20 text-c-white px-2 sm:px-3 py-1.5 rounded-lg transition"
            >
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">↩</span>
            </button>
          </div>
        </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* TODOS COMPLETADOS */}
        {habits.length > 0 && pendingHabits.length === 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4">
            <p className="text-green-400 font-semibold text-sm">✅ ¡Has completado todos tus hábitos de hoy!</p>
          </div>
        )}

        {/* BOTÓN ABRIR FORMULARIO */}
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="w-full bg-c-white hover:bg-c-light text-c-black font-semibold rounded-xl py-2.5 text-sm transition"
        >
          {formOpen ? "Cancelar" : "+ Nuevo hábito"}
        </button>

        {/* FORMULARIO CREAR */}
        {formOpen && (
          <div className="bg-c-dark border border-c-light/10 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-c-white">Nuevo hábito</h2>
            <form onSubmit={handleCreateHabit} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              />
              <select
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              >
                <option value="diaria" className="bg-c-dark text-c-white">Diaria</option>
                <option value="semanal" className="bg-c-dark text-c-white">Semanal</option>
                <option value="mensual" className="bg-c-dark text-c-white">Mensual</option>
              </select>
              <button
                type="submit"
                disabled={creating || !nombre}
                className="w-full bg-c-white hover:bg-c-light disabled:bg-c-gray text-c-black font-semibold rounded-lg py-2.5 text-sm transition"
              >
                {creating ? "Creando..." : "Crear hábito"}
              </button>
            </form>
          </div>
        )}

        {/* LISTA DE HÁBITOS */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-c-gray uppercase tracking-wider">
            Tus hábitos
          </h2>

          {habits.length === 0 ? (
            <div className="bg-c-dark border border-c-light/10 rounded-xl px-5 py-8 text-center">
              <p className="text-c-gray text-sm">No tienes hábitos aún</p>
              <p className="text-c-gray/50 text-xs mt-1">Pulsa "+ Nuevo hábito" para empezar</p>
            </div>
          ) : (
            habits.map((habit) => {
              const done = completedToday.includes(habit.id_habito);
              const isEditing = editingId === habit.id_habito;

              return (
                <div
                  key={habit.id_habito}
                  className={`bg-c-dark border rounded-xl p-5 transition ${
                    done ? "border-green-500/30" : "border-c-light/10"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
                      />
                      <input
                        type="text"
                        value={editForm.descripcion}
                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                        className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
                      />
                      <select
                        value={editForm.frecuencia}
                        onChange={(e) => setEditForm({ ...editForm, frecuencia: e.target.value })}
                        className="w-full bg-c-dark border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
                      >
                        <option value="diaria" className="bg-c-dark text-c-white">Diaria</option>
                        <option value="semanal" className="bg-c-dark text-c-white">Semanal</option>
                        <option value="mensual" className="bg-c-dark text-c-white">Mensual</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(habit.id_habito)}
                          disabled={saving}
                          className="flex-1 bg-c-white hover:bg-c-light disabled:bg-c-gray text-c-black font-semibold rounded-lg py-2 text-sm transition"
                        >
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-c-light/10 hover:bg-c-light/20 text-c-white rounded-lg py-2 text-sm transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-c-white">
                            {habit.nombre} {done && "✅"}
                          </h3>
                          {habit.descripcion && (
                            <p className="text-c-gray text-sm mt-0.5">{habit.descripcion}</p>
                          )}
                        </div>
                        <span className="text-xs text-c-gray bg-c-light/10 px-2 py-1 rounded-full capitalize">
                          {habit.frecuencia}
                        </span>
                      </div>

                      <p className="text-sm text-c-gray mb-4">
                        🔥 Racha: <span className="text-c-white font-medium">{habit.streak ?? 0} días</span>
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkDone(habit.id_habito)}
                          disabled={markingId === habit.id_habito || done}
                          className={`flex-1 text-sm font-medium rounded-lg py-2 transition ${
                            done
                              ? "bg-green-500/10 text-green-400 border border-green-500/30 cursor-default"
                              : "bg-c-white hover:bg-c-light text-c-black"
                          }`}
                        >
                          {done ? "Completado hoy" : markingId === habit.id_habito ? "Guardando..." : "✓ Completado hoy"}
                        </button>
                        <button
                          onClick={() => handleStartEdit(habit)}
                          className="px-3 py-2 text-sm text-c-gray hover:text-c-white bg-c-light/10 hover:bg-c-light/20 rounded-lg transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id_habito, habit.nombre)}
                          className="px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </div>

                      <button
                        onClick={() => setCalendarOpenId(calendarOpenId === habit.id_habito ? null : habit.id_habito)}
                        className="w-full mt-2 text-xs text-c-gray hover:text-c-white transition text-center py-1"
                      >
                        {calendarOpenId === habit.id_habito ? "▲ Ocultar historial" : "▼ Ver historial"}
                      </button>

                      {calendarOpenId === habit.id_habito && (
                        <HabitCalendar habitId={habit.id_habito} />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}