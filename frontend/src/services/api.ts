const API_URL = "http://127.0.0.1:5000";

export const getUsuarios = async () => {
  const response = await fetch(`${API_URL}/usuarios`);
  return response.json();
};