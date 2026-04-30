const API_URL = "http://16.171.174.225";

export const getHabits = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

    if (!res.ok) {
     const body = await res.json().catch(() => ({}));
     throw new Error(`[${res.status}] ${body.mensaje || "Error al obtener hábitos"}`);
    }

  return res.json();
};

export const createHabit = async (habit: {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(habit),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`[${res.status}] ${body.mensaje || "Error al crear hábito"}`);
  }

  return res.json();
};

export const updateHabit = async (
  habitId: number,
  data: { nombre?: string; descripcion?: string; frecuencia?: string }
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits/${habitId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.mensaje || `[${res.status}] Error al actualizar hábito`);
  return body;
};

 export const deleteHabit = async (habitId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits/${habitId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.mensaje || `[${res.status}] Error al eliminar hábito`);
  return body;
};

export const markHabitDone = async (habitId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ habit_id: habitId }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message || `[${res.status}] Error al marcar hábito`);
  }

  return body;
};

export const getStreak = async (habitId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits/${habitId}/streak`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`[${res.status}] Error al obtener racha`);
  }

  return res.json(); // devuelve { streak: number }
};

export const getTodayProgress = async (): Promise<number[]> => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`[${res.status}] Error al obtener progreso`);
  }

  const data = await res.json();

  // Filtramos los completados hoy y devolvemos solo los ids
  const today = new Date().toISOString().split("T")[0];
  return data
    .filter((r: { fecha: string; completado: boolean }) =>
      r.completado && r.fecha === today
    )
    .map((r: { id_habito: number }) => r.id_habito);
};

export const getHabitProgress = async (habitId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/progress/${habitId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`[${res.status}] Error al obtener historial`);
  }

  return res.json(); // devuelve [{ fecha: "2026-04-28", completado: true }, ...]
};