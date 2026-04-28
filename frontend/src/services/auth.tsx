const API_URL = "http://localhost:5000";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error("Error en login");

  return res.json();
};

export const register = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nombre: name, email, contraseña: password })
  });

  if (!res.ok) throw new Error("Error en registro");

  return res.json();
};
