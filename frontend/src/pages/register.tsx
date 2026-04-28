import { useState } from "react";
import { register } from "../services/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();

    try {
      await register(name, email, password);
      alert("Usuario creado correctamente");
    } catch (err) {
      alert("Error al registrarse");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Nombre"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Registrarse</button>
    </form>
  );
}