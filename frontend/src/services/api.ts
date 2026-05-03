const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

// ─── PERFIL DEL USUARIO AUTENTICADO ───────────────────────────────────────

export const getMyProfile = async () => {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `[${res.status}] Error al obtener perfil`);
  return body;
};

export const updateMyProfile = async (
  id: number,
  data: { nombre?: string; email?: string; contraseña?: string }
) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `[${res.status}] Error al actualizar perfil`);
  return body;
};

export const deleteMyAccount = async (id: number) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `[${res.status}] Error al eliminar cuenta`);
  return body;
};