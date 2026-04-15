const API_URL = "http://127.0.0.1:5000";

export const getUsuarios = async () => {
  const response = await fetch(`${API_URL}/usuarios`);
  return response.json();
};

export const createUsuario = async (usuario: {
  nombre: string;
  email: string;
  contraseña: string;
}) => {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  });

  return res.json();
};