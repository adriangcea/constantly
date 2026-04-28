import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "../services/api";

interface UserProfile {
  id_usuario: number;
  nombre: string;
  email: string;
  fecha_registro: string;
  rol: string;
  estado: string;
}

export default function Users() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos editables
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setNombre(data.nombre);
        setEmail(data.email);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`No se pudo cargar el perfil: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

      // Actualizar datos locales
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

  if (loading) return <p>Cargando perfil...</p>;
  if (error && !profile) return <p>{error}</p>;

  return (
    <div>
      {/* CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mi perfil</h1>
        <button onClick={() => navigate("/dashboard")}>← Volver al Dashboard</button>
      </div>

      {/* MENSAJES */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      {/* INFO DE SOLO LECTURA */}
      {profile && (
        <div>
          <p><strong>Miembro desde:</strong> {new Date(profile.fecha_registro).toLocaleDateString("es-ES")}</p>
          <p><strong>Rol:</strong> {profile.rol}</p>
          <p><strong>Estado:</strong> {profile.estado}</p>
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN */}
      <h2>Editar datos</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Nueva contraseña <small>(dejar vacío para no cambiarla)</small></label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Nueva contraseña"
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      {/* ZONA DE PELIGRO */}
      <hr />
      <h2>Zona de peligro</h2>
      <button onClick={handleDelete} style={{ color: "red" }}>
        Eliminar mi cuenta
      </button>
    </div>
  );
}