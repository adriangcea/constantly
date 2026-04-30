import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "../services/api";
import { getHabits, getTodayProgress, getStreak } from "../services/habits";
import logo from "../assets/logo.jpg";

interface UserProfile {
  id_usuario: number;
  nombre: string;
  email: string;
  fecha_registro: string;
  rol: string;
  estado: string;
}

interface ActivitySummary {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
}

export default function Users() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivitySummary>({
    totalHabits: 0,
    completedToday: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos editables
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileData, habitsData, todayIds] = await Promise.all([
          getMyProfile(),
          getHabits(),
          getTodayProgress(),
        ]);

        setProfile(profileData);
        setNombre(profileData.nombre);
        setEmail(profileData.email);

        // Calcular racha más larga entre todos los hábitos
        const streaks = await Promise.all(
          habitsData.map((h: { id_habito: number }) =>
            getStreak(h.id_habito).then((r) => r.streak).catch(() => 0)
          )
        );
        const bestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;

        setActivity({
          totalHabits: habitsData.length,
          completedToday: todayIds.length,
          bestStreak,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`No se pudo cargar el perfil: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const payload: { nombre?: string; email?: string; contraseña?: string } = {};
      if (nombre !== profile.nombre) payload.nombre = nombre;
      if (email !== profile.email) payload.email = email;
      if (contraseña) payload.contraseña = contraseña;

      if (Object.keys(payload).length === 0) {
        setError("No has modificado ningún campo.");
        return;
      }

      await updateMyProfile(profile.id_usuario, payload);
      setSuccessMsg("Perfil actualizado correctamente.");
      setContraseña("");
      setProfile({ ...profile, nombre, email });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al actualizar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    try {
      await deleteMyAccount(profile.id_usuario);
      logout();
      navigate("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al eliminar cuenta: ${msg}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-c-black flex items-center justify-center">
      <p className="text-c-gray text-sm animate-pulse">Cargando perfil...</p>
    </div>
  );

  if (error && !profile) return (
    <div className="min-h-screen bg-c-black flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-c-black text-c-white">

      {/* NAVBAR */}
      <nav className="bg-c-dark border-b border-c-light/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Constantly" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-xl font-bold tracking-tight">Constantly</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-c-gray hover:text-c-white transition px-3 py-1.5 rounded-lg hover:bg-c-light/10"
          >
            ← Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="text-sm bg-c-light/10 hover:bg-c-light/20 text-c-white px-3 py-1.5 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* CABECERA PERFIL */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-c-light/10 flex items-center justify-center text-2xl font-bold text-c-white">
            {profile?.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-c-white">{profile?.nombre}</h2>
            <p className="text-c-gray text-sm">{profile?.email}</p>
          </div>
        </div>

        {/* RESUMEN DE ACTIVIDAD */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-c-dark border border-c-light/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-c-white">{activity.totalHabits}</p>
            <p className="text-xs text-c-gray mt-1">Hábitos activos</p>
          </div>
          <div className="bg-c-dark border border-c-light/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-c-white">{activity.completedToday}</p>
            <p className="text-xs text-c-gray mt-1">Completados hoy</p>
          </div>
          <div className="bg-c-dark border border-c-light/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-c-white">🔥 {activity.bestStreak}</p>
            <p className="text-xs text-c-gray mt-1">Mejor racha</p>
          </div>
        </div>

        {/* MENSAJES */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
            {successMsg}
          </div>
        )}

        {/* FORMULARIO EDICIÓN */}
        <div className="bg-c-dark border border-c-light/10 rounded-xl p-6">
          <h3 className="text-base font-semibold text-c-white mb-5">Editar datos</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Nueva contraseña{" "}
                <span className="text-c-gray/50 font-normal">(dejar vacío para no cambiarla)</span>
              </label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-c-white hover:bg-c-light disabled:bg-c-gray text-c-black font-semibold rounded-lg py-2.5 text-sm transition"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-base font-semibold text-red-400 mb-2">Zona de peligro</h3>
          <p className="text-c-gray text-sm mb-4">
            Eliminar tu cuenta borrará todos tus hábitos y progreso de forma permanente.
          </p>
          <button
            onClick={handleDelete}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 text-sm font-medium transition"
          >
            Eliminar mi cuenta
          </button>
        </div>

      </div>
    </div>
  );
}