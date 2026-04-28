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