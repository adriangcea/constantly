import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación básica
    if (!email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);

      authLogin(data.access_token);

      // Limpiar formulario
      setEmail("");
      setPassword("");

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Verifica tus credenciales o intenta nuevamente más tarde";

      alert(`Error al hacer login: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}