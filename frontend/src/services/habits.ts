const API_URL = "http://localhost:5000"; 

export const getHabits = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/habits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener hábitos");
  }

  return res.json();
};

export const createHabit = async (habit: {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(habit),
  });

  if (!res.ok) {
    throw new Error("Error al crear hábito");
  }

  return res.json();
};