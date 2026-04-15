import { useEffect, useState } from "react";
import { getUsuarios, createUsuario, deleteUsuario } from "../services/api";

const Users = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // formulario
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contraseña: "",
  });

  // cargar usuarios
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    getUsuarios().then((data) => setUsuarios(data));
  };

  // actualizar inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id: number) => {
  await deleteUsuario(id);
  loadUsers();
};

  //enviar formulario (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createUsuario(form);

    setForm({
      nombre: "",
      email: "",
      contraseña: "",
    });

    loadUsers(); // refrescar lista
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Usuarios</h2>

      {/*FORMULARIO CREAR USUARIO*/}
      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="contraseña"
          type="password"
          placeholder="Contraseña"
          value={form.contraseña}
          onChange={handleChange}
        />

        <button type="submit">Crear usuario</button>
      </form>

      <hr />

      {/*LISTA DE USUARIOS*/}
      <ul>
      {usuarios.map((u) => (
       <li key={u.id_usuario}>
       {u.nombre} - {u.email}

        <button onClick={() => handleDelete(u.id_usuario)}>
        Eliminar
        </button>
         </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;