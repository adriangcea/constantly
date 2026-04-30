import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import logo from "../assets/logo.jpg";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !email || !password || !confirm) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await register(nombre, email, password);
      navigate("/login");
    } catch (err) {
      setError("Error al registrarse. Es posible que el email ya esté en uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-c-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* LOGO Y TÍTULO */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Constantly logo"
            className="w-48 h-48 rounded-2xl object-cover mb-4"
          />
          <h1 className="text-3xl font-bold text-c-white tracking-tight">Constantly</h1>
          <p className="text-c-gray text-sm mt-1">Construye hábitos que duran</p>
        </div>

        {/* TARJETA */}
        <div className="bg-c-dark rounded-2xl p-8 shadow-xl border border-c-light/10">

          <h2 className="text-lg font-semibold text-c-white mb-6">Crear cuenta</h2>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c-gray mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-c-black border border-c-light/20 rounded-lg px-4 py-2.5 text-sm text-c-white placeholder-c-gray/50 focus:outline-none focus:ring-2 focus:ring-c-gray/40 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-c-white hover:bg-c-light disabled:bg-c-gray text-c-black font-semibold rounded-lg py-2.5 text-sm transition mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* ENLACE LOGIN */}
          <p className="text-center text-sm text-c-gray mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-c-white hover:text-c-light font-medium underline underline-offset-2 transition">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}