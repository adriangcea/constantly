const API_URL = "http://localhost:5000";

// LOGIN
export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Error en login");
  }

  return res.json();
};

// REGISTER
export const register = async (
  nombre: string,
  email: string,
  password: string
) => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      email,
      password,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Error en registro");
  }

  return res.json();
};